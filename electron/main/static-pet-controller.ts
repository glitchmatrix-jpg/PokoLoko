import { BrowserWindow, screen, type Display } from 'electron';
import { performance } from 'node:perf_hooks';
import { computeGroundXRange, computeStaticPetGeometry } from '../services/display-grounding.js';
import {
  loadPetAsset,
  loadStaticPetAsset,
  walkPreparationAnimationId,
  walkingAnimationId,
  type CharacterId,
  type SafeIntegerScale,
  type StaticPetAsset,
} from '../services/static-pet-assets.js';
import type { LocomotionActivityLevel, LocomotionEvent, StaticPetPresentation } from '../preload/contracts.js';
import { Logger } from '../services/logger.js';
import {
  LocomotionEngine,
  animationFpsForTravelSpeed,
  createLocomotionProfile,
  type ActivityLevel,
} from '../../packages/pet-engine/locomotion/src/index.js';
import {
  DirectionTurnController,
  createDirectionTurnProfile,
  type DirectionTurnAction,
} from '../../packages/pet-engine/direction/src/index.js';
import {
  InteractionController,
  createSettlePlan,
  sampleSettle,
  type InteractionAction,
  type PointerInput,
  type SettlePlan,
} from '../../packages/pet-engine/interaction/src/index.js';
import { PetStateMachine } from '../../packages/pet-engine/state-machine/src/index.js';
import { CharacterSwitchController, createCharacterProfileBundle, type CharacterProfileBundle } from '../../packages/pet-engine/character-switch/src/index.js';
import { LivingRuntimeController } from '../../packages/pet-engine/orchestration/src/index.js';
import type { PetContextSnapshot } from '../../packages/pet-engine/context/src/index.js';
import { EventTraceBuffer, TraceReplayer, type DiagnosticCommand, type DiagnosticTrace } from '../../packages/pet-engine/diagnostics/src/index.js';
import { PerformanceSampler } from '../../packages/performance-monitor/src/index.js';

const CANVAS_SIZE = 128 as const;
const BASE_MARGIN = 16;
const BOTTOM_CLEARANCE = 2;
const MOVEMENT_INTERVAL_MS = 16;
const SETTLE_INTERVAL_MS = 16;

type RendererAnimationEvent =
  | Readonly<{
      type: 'FRAME_CHANGED';
      animationId: string;
      generation: number;
      frameIndex: number;
      elapsedMs: number;
      loopCount: number;
      loopBoundary: boolean;
    }>
  | Readonly<{
      type: 'ANIMATION_COMPLETED';
      animationId: string;
      generation: number;
      frameIndex: number;
      elapsedMs: number;
    }>;

type MovementPresentationState = 'idle' | 'starting' | 'walking' | 'stopping' | 'turning';
type InteractionPresentationPhase = 'idle' | 'pressed' | 'dragged' | 'settling';

export class StaticPetController {
  private asset!: StaticPetAsset;
  private character: CharacterId;
  private scale: SafeIntegerScale;
  private activityLevel: ActivityLevel = 'balanced';
  private walkingSpeed: ActivityLevel = 'balanced';
  private reducedMotion = false;
  private preferredGroundX: number | undefined;
  private activeDisplayId: number | undefined;
  private animationGeneration = 0;
  private visualRequestGeneration = 0;
  private characterLoadGeneration = 0;
  private locomotionGeneration = 0;
  private movementRequestGeneration = 0;
  private movementTimer: NodeJS.Timeout | null = null;
  private choreographyTimer: NodeJS.Timeout | null = null;
  private settleTimer: NodeJS.Timeout | null = null;
  private settlePlan: SettlePlan | null = null;
  private locomotion = new LocomotionEngine();
  private directionTurn: DirectionTurnController;
  private readonly interaction = new InteractionController();
  private readonly stateMachine: PetStateMachine;
  private readonly characterSwitch: CharacterSwitchController<CharacterProfileBundle<StaticPetAsset>>;
  private interactionPhase: InteractionPresentationPhase = 'idle';
  private activeDragSessionId: string | undefined;
  private activePointerId: number | undefined;
  private movementState: MovementPresentationState = 'idle';
  private direction: 'left' | 'right' = 'right';
  private currentTravelSpeed = 0;
  private targetTravelSpeed = 0;
  private readonly logger = new Logger('static-pet');
  private readonly livingRuntime: LivingRuntimeController;
  private readonly diagnosticTrace = new EventTraceBuffer(500);
  private readonly traceReplayer = new TraceReplayer();
  private readonly performanceSampler = new PerformanceSampler();
  private performanceTimer: NodeJS.Timeout | null = null;
  private lastAnimationEvent: RendererAnimationEvent | null = null;

  public constructor(
    private readonly window: BrowserWindow,
    initial: Readonly<{ character: CharacterId; scale: SafeIntegerScale }>,
  ) {
    this.character = initial.character;
    this.scale = initial.scale;
    this.directionTurn = new DirectionTurnController(this.direction, createDirectionTurnProfile(initial.character));
    this.characterSwitch = new CharacterSwitchController(initial.character, {
      load: async (character) => createCharacterProfileBundle(character, await loadStaticPetAsset(character), performance.now()),
    });
    this.stateMachine = new PetStateMachine(initial.character, performance.now(), (entry) => {
      this.logger.debug('State transition', entry); this.recordDiagnostic('state', entry.accepted ? 'transition-accepted' : 'transition-rejected', entry, entry.accepted ? 'info' : 'warn');
    });
    this.livingRuntime = new LivingRuntimeController(initial.character, { activityLevel: 'balanced', paused: false, quietMode: false, contextualAwareness: false }, {
      playAnimation: async (animationId, options) => this.playRuntimeAnimation(animationId, options),
      restoreIdle: async (reason) => this.restoreIdleAsset(reason),
      walkToRegion: async (region) => this.walkToRegion(region),
      stopMovement: async (reason) => this.stopMovement(reason),
      log: (message, details) => {
        this.logger.debug(message, typeof details === 'object' && details !== null ? details as Record<string, unknown> : { details });
        this.recordDiagnostic('system', message, details);
      },
      onSnapshot: (snapshot) => { if (!this.window.isDestroyed()) this.window.webContents.send('pet:living-runtime', snapshot); },
    });
  }

  public async initialize(): Promise<void> {
    this.asset = await loadStaticPetAsset(this.character);
    this.reposition('initialize');
    this.window.setIgnoreMouseEvents(true, { forward: true });
    this.stateMachine.request({
      requestId: 'initialize-idle',
      target: { kind: 'idle', orientation: 'front' },
      reason: 'static-renderer-ready',
      monotonicMs: performance.now(),
    });
    this.livingRuntime.start();
    this.startPerformanceSampling();
  }

  public getLivingRuntimeSnapshot() { return this.livingRuntime.snapshot(); }

  public getDiagnosticSnapshot() {
    const presentation=this.getPresentation(); const bounds=this.window.getBounds(); const display=screen.getDisplayNearestPoint({x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2});
    return { capturedAtMonotonicMs:performance.now(), seed:this.livingRuntime.diagnosticSeedValue(), runtime:this.livingRuntime.snapshot(), stateMachine:this.stateMachine.snapshot(), presentation, windowBounds:bounds, display:{id:String(display.id),bounds:display.bounds,workArea:display.workArea,scaleFactor:display.scaleFactor}, lastAnimationEvent:this.lastAnimationEvent, trace:this.diagnosticTrace.snapshot(), performance:this.performanceSampler.summarize() };
  }
  public exportDiagnosticTrace(): DiagnosticTrace { return this.diagnosticTrace.exportTrace(); }
  public async replayDiagnosticTrace(trace:DiagnosticTrace):Promise<number>{ this.recordDiagnostic('diagnostic','trace-replay-started',{events:trace.events.length}); this.livingRuntime.setDiagnosticSeed(trace.seed); return this.traceReplayer.replay(trace,(command)=>this.applyDiagnosticCommand(command),{timingScale:0,maximumEvents:200}); }
  public async applyDiagnosticCommand(command:DiagnosticCommand):Promise<void>{
    this.recordDiagnostic('diagnostic',`command:${command.type}`,command,'info',command);
    if(command.type==='force_idle') return this.livingRuntime.forceIntention({kind:'remain_idle',durationMs:command.durationMs??5000});
    if(command.type==='force_walk') return this.livingRuntime.forceIntention({kind:'walk',destinationRegion:command.region,durationMs:command.durationMs??6000});
    if(command.type==='force_sleep') return this.livingRuntime.forceIntention({kind:'sleep',durationMs:command.durationMs??60000});
    if(command.type==='force_wake') return this.livingRuntime.forceDiagnosticWake();
    if(command.type==='force_activity') return this.livingRuntime.forceIntention({kind:'activity',activityId:command.activityId,durationMs:command.durationMs??15000});
    if(command.type==='force_reaction') return this.livingRuntime.forceDiagnosticReaction(command.reaction);
    if(command.type==='play_animation') return this.playRuntimeAnimation(command.animationId,{loop:command.loop,playback:command.playback});
    if(command.type==='move_to') return this.moveToGroundX(command.destinationX);
    if(command.type==='stop_movement') return this.stopMovement(command.reason??'diagnostic');
    if(command.type==='complete_drag') return this.cancelPointerInteraction('diagnostic-complete');
    if(command.type==='simulate_display_change') { this.handleDisplayTopologyChange('diagnostic-simulation'); return; }
    if(command.type==='set_character') { await this.setCharacter(command.character); return; }
    if(command.type==='set_paused') { this.setPaused(command.paused); return; }
    if(command.type==='set_seed') { this.diagnosticTrace.setSeed(command.seed); this.livingRuntime.setDiagnosticSeed(command.seed); return; }
    if(command.type==='set_context') { const current=this.livingRuntime.snapshot().context; const now=performance.now(); const base:PetContextSnapshot=current??{generation:0,sampledAtMonotonicMs:now,enabled:true,typingActivity:'none',mouseActivity:'none',systemIdle:false,systemIdleSeconds:0,timeBand:'day',audioActive:false,fullscreenActive:false,screenLocked:false,resumedRecently:false,recentPetInteraction:'none',availability:{typingPresence:'available',mouseActivity:'available',systemIdle:'available',timeOfDay:'available',audioState:'available',fullscreenState:'available',lockAndResume:'available',recentPetInteraction:'available'}}; this.updateContext({...base,...command.patch,enabled:true,generation:base.generation+1,sampledAtMonotonicMs:now}); return; }
    if(command.type==='set_mind') { this.livingRuntime.setDiagnosticMind(command.patch); return; }
    if(command.type==='reset_runtime') { await this.livingRuntime.resetSession(); this.diagnosticTrace.clear(); return; }
  }
  private recordDiagnostic(category:'state'|'planner'|'animation'|'locomotion'|'interaction'|'activity'|'sleep'|'reaction'|'context'|'system'|'diagnostic',name:string,details?:unknown,severity:'debug'|'info'|'warn'|'error'='info',replayCommand?:DiagnosticCommand):void { this.diagnosticTrace.record({monotonicMs:performance.now(),category,severity,name,...(details===undefined?{}:{details}),...(replayCommand?{replayCommand}:{})}); }


  public getPresentation(): StaticPetPresentation {
    const bounds = this.window.getBounds();
    const margin = BASE_MARGIN * this.scale;
    const fps = this.movementState === 'walking' || this.movementState === 'stopping'
      ? animationFpsForTravelSpeed(
          this.asset.fps,
          this.targetTravelSpeed || createLocomotionProfile(this.character, this.walkingSpeed).maximumSpeedPxPerSecond,
          this.asset.authoredSpeedPxPerSecond,
        )
      : this.asset.fps;
    const presentedFps = this.reducedMotion ? Math.min(fps, this.movementState === 'walking' ? 6 : 4) : fps;
    return {
      character: this.character,
      animationId: this.asset.animationId,
      frames: this.asset.frames,
      sourceFrameIds: this.asset.sourceFrameIds,
      fps: presentedFps,
      playback: this.asset.playback,
      loop: this.asset.loop,
      animationGeneration: this.animationGeneration,
      canvasSize: CANVAS_SIZE,
      scale: this.scale,
      spriteOffset: { x: margin, y: margin },
      anchor: this.asset.anchor,
      ...(this.asset.bodyCenter ? { bodyCenter: this.asset.bodyCenter } : {}),
      windowSize: { width: bounds.width, height: bounds.height },
      displayId: String(this.activeDisplayId ?? ''),
      interaction: {
        phase: this.interactionPhase,
        generation: this.interaction.snapshot().generation,
        ...(this.activeDragSessionId ? { sessionId: this.activeDragSessionId } : {}),
        ...(this.activePointerId !== undefined ? { pointerId: this.activePointerId } : {}),
      },
      locomotion: {
        state: this.movementState,
        generation: this.locomotionGeneration,
        direction: this.direction,
        speedPxPerSecond: this.currentTravelSpeed,
        groundX: this.preferredGroundX ?? 0,
        destinationX: this.locomotion.getSnapshot()?.destinationX ?? this.preferredGroundX ?? 0,
        activityLevel: this.activityLevel,
      },
    };
  }

  public async setCharacter(character: CharacterId): Promise<boolean> {
    if (character === this.character) return true;
    const requestGeneration = ++this.characterLoadGeneration;
    this.visualRequestGeneration += 1;
    await this.cancelPointerInteraction('character-change');
    await this.stopMovement('character-change');

    const result = await this.characterSwitch.request({
      character,
      monotonicMs: performance.now(),
      reason: 'settings',
    });
    if (requestGeneration !== this.characterLoadGeneration || !result.accepted) return false;

    const bundle = result.snapshot.bundle;
    if (!bundle || bundle.character !== character) return false;

    const preservedGroundX = this.preferredGroundX;
    this.character = character;
    this.asset = bundle.asset;
    this.directionTurn = new DirectionTurnController(this.direction, createDirectionTurnProfile(character));
    this.stateMachine.replaceCharacter(character, performance.now());
    this.animationGeneration = result.snapshot.presentationGeneration;
    this.locomotionGeneration += 1;
    this.movementRequestGeneration += 1;
    this.activeDragSessionId = undefined;
    this.activePointerId = undefined;
    this.interactionPhase = 'idle';
    this.movementState = 'idle';
    this.preferredGroundX = preservedGroundX;
    this.reposition('character-change');
    await this.livingRuntime.switchCharacter(character);
    this.publish();
    return true;
  }

  public setScale(scale: SafeIntegerScale): void {
    if (scale === this.scale) return;
    this.scale = scale;
    this.handleDisplayTopologyChange('scale-change');
  }

  public setActivityLevel(level: LocomotionActivityLevel): void {
    this.activityLevel = level;
    this.livingRuntime.updateSettings({ activityLevel: level });
    this.publish();
  }

  public setWalkingSpeed(level: LocomotionActivityLevel): void {
    this.walkingSpeed = level;
    this.publish();
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
    this.publish();
  }

  public async resetBehaviorProfile(character: CharacterId): Promise<void> {
    if (character !== this.character) return;
    await this.livingRuntime.resetSession();
  }

  public updateContext(snapshot: PetContextSnapshot): void {
    this.livingRuntime.updateSettings({ contextualAwareness: snapshot.enabled });
    this.livingRuntime.updateContext(snapshot);
  }

  public setPaused(paused: boolean): void {
    this.livingRuntime.updateSettings({ paused });
  }

  public setQuietMode(quietMode: boolean): void {
    this.livingRuntime.updateSettings({ quietMode });
  }

  public setInteractive(interactive: boolean): void {
    this.window.setIgnoreMouseEvents(!interactive, { forward: true });
  }

  public async moveToGroundX(destinationX: number): Promise<void> {
    if (!Number.isFinite(destinationX)) throw new Error('Destination X must be finite.');
    const requestGeneration = ++this.movementRequestGeneration;
    const positionX = this.preferredGroundX ?? destinationX;
    const direction = destinationX < positionX ? 'left' : 'right';
    const snapshot = this.locomotion.getSnapshot();
    const translating = Boolean(snapshot?.active);

    if (!translating && this.movementState !== 'idle') {
      await this.cancelChoreography('replacement-destination');
    }

    this.directionTurn.configure(createDirectionTurnProfile(this.character));
    const result = this.directionTurn.requestMove(direction, destinationX, translating, performance.now());
    if (requestGeneration !== this.movementRequestGeneration) return;
    await this.executeDirectionActions(result.actions, requestGeneration);
  }

  public async moveBy(deltaX: number): Promise<void> {
    await this.moveToGroundX((this.preferredGroundX ?? this.window.getBounds().x) + deltaX);
  }

  public async moveToDisplay(display: Display): Promise<void> {
    await this.stopMovement('move-to-current-screen');
    this.activeDisplayId = display.id;
    const range = this.groundRange(display);
    this.preferredGroundX = (range.minimumX + range.maximumX) / 2;
    this.reposition('move-to-current-screen');
    this.publish();
  }

  public async stopMovement(reason = 'requested'): Promise<void> {
    this.movementRequestGeneration += 1;
    await this.cancelChoreography(reason);
    const interrupted = await this.interruptTranslation(reason);
    this.directionTurn.interrupt();
    this.movementState = 'idle';
    if (interrupted || this.asset.animationId !== (await loadStaticPetAsset(this.character)).animationId) {
      await this.restoreIdleAsset();
    } else {
      this.publish();
    }
  }

  public async handlePointerDown(input: PointerInput): Promise<void> {
    const result = this.interaction.pointerDown(input, this.window.getBounds());
    this.interactionPhase = result.snapshot.phase === 'pressed' ? 'pressed' : this.interactionPhase;
    this.activePointerId = result.snapshot.activePointerId;
    await this.applyInteractionActions(result.actions);
    this.publish();
  }

  public async handlePointerMove(input: PointerInput): Promise<void> {
    const result = this.interaction.pointerMove(input, this.window.getBounds());
    this.activePointerId = result.snapshot.activePointerId;
    await this.applyInteractionActions(result.actions);
  }

  public async handlePointerUp(input: PointerInput): Promise<void> {
    const result = this.interaction.pointerUp(input, this.window.getBounds());
    await this.applyInteractionActions(result.actions);
    if (result.snapshot.phase === 'idle' && this.interactionPhase === 'pressed') {
      this.interactionPhase = 'idle';
      this.activePointerId = undefined;
      this.publish();
    }
  }

  public async cancelPointerInteraction(reason: string): Promise<void> {
    const wasDragged = this.interactionPhase === 'dragged';
    const result = this.interaction.cancel(reason);
    await this.applyInteractionActions(result.actions);
    if (wasDragged && !this.window.isDestroyed()) {
      this.stateMachine.complete({
        type: 'DRAG_ENDED',
        generation: this.stateMachine.snapshot().generation,
        monotonicMs: performance.now(),
      });
      const bounds = this.window.getBounds();
      this.beginSettlement({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
      return;
    }
    if (this.interactionPhase !== 'settling') {
      this.interactionPhase = 'idle';
      this.activePointerId = undefined;
      this.activeDragSessionId = undefined;
      this.publish();
    }
  }

  public async handleAnimationEvent(event: RendererAnimationEvent): Promise<void> {
    this.lastAnimationEvent=event; this.recordDiagnostic('animation',event.type,event,'debug');
    if (event.generation !== this.animationGeneration || event.animationId !== this.asset.animationId) return;
    await this.livingRuntime.onAnimationEvent(event);

    if (event.type === 'FRAME_CHANGED' && event.loopBoundary) {
      const result = this.directionTurn.onGaitBoundary(performance.now());
      await this.executeDirectionActions(result.actions, this.movementRequestGeneration);
      return;
    }

    if (event.type === 'ANIMATION_COMPLETED') {
      const preparationId = walkPreparationAnimationId(this.character);
      if (preparationId && event.animationId === preparationId) {
        const result = this.directionTurn.onPreparationCompleted();
        await this.executeDirectionActions(result.actions, this.movementRequestGeneration);
      }
    }
  }

  public handleDisplayTopologyChange(reason: string): void {
    if (this.interactionPhase === 'dragged' || this.interactionPhase === 'pressed') {
      const bounds = this.window.getBounds();
      this.activeDisplayId = screen.getDisplayNearestPoint({
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      }).id;
      this.logger.debug('Display topology changed during pointer interaction', { reason, displayId: this.activeDisplayId });
      this.publish();
      return;
    }
    if (this.interactionPhase === 'settling') {
      const bounds = this.window.getBounds();
      this.beginSettlement({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
      this.logger.debug('Settlement replanned after display topology change', { reason });
      return;
    }
    const snapshot = this.locomotion.getSnapshot();
    if (snapshot?.active) {
      const display = this.selectDisplay();
      const result = this.locomotion.tick(performance.now(), this.groundRange(display));
      this.applyMovementSnapshot(result.snapshot, display);
      this.emitLocomotionEvents(result.events);
      this.publish();
      if (!result.snapshot.active) void this.finishMovement(result.snapshot.generation);
    } else {
      this.reposition(reason);
      this.publish();
    }
  }

  private startPerformanceSampling(): void {
    if (this.performanceTimer) return;
    this.performanceSampler.sample();
    this.performanceTimer = setInterval(() => this.performanceSampler.sample(), 5_000);
    this.performanceTimer.unref?.();
  }

  private stopPerformanceSampling(): void {
    if (this.performanceTimer) clearInterval(this.performanceTimer);
    this.performanceTimer = null;
  }

  public dispose(): void {
    this.stopPerformanceSampling();
    this.livingRuntime.dispose();
    this.stopMovementClock();
    this.clearChoreographyTimer();
    this.stopSettling();
    this.interaction.cancel('dispose');
  }

  private async applyInteractionActions(actions: readonly InteractionAction[]): Promise<void> {
    for (const action of actions) {
      if (action.type === 'DRAG_STARTED') {
        this.visualRequestGeneration += 1;
        await this.livingRuntime.onDragStarted();
        this.stopSettling();
        await this.cancelChoreography('drag-start');
        await this.interruptTranslation('drag-start');
        this.directionTurn.interrupt();
        this.movementState = 'idle';
        this.interactionPhase = 'dragged';
        this.activeDragSessionId = action.session.id;
        this.activePointerId = action.session.pointerId;
        this.stateMachine.request({
          requestId: `drag-start:${action.session.id}`,
          target: { kind: 'drag' },
          reason: 'visible-pixel-pointer-drag',
          monotonicMs: performance.now(),
        });
        this.logger.debug('Drag started', { sessionId: action.session.id, pointerId: action.session.pointerId });
        this.publish();
      }

      if (action.type === 'DRAG_MOVED') {
        if (action.session.id !== this.activeDragSessionId || this.interactionPhase !== 'dragged') continue;
        this.applyDraggedWindowPosition(action.windowTopLeft);
      }

      if (action.type === 'DRAG_ENDED') {
        if (action.session.id !== this.activeDragSessionId) continue;
        this.applyDraggedWindowPosition(action.windowTopLeft);
        this.stateMachine.complete({
          type: 'DRAG_ENDED',
          generation: this.stateMachine.snapshot().generation,
          monotonicMs: performance.now(),
        });
        this.beginSettlement(action.releasePoint);
      }

      if (action.type === 'CLICKED') {
        this.logger.debug('Pet clicked', { point: action.point });
        await this.livingRuntime.onSocialInput('click');
      }

      if (action.type === 'DOUBLE_CLICKED') {
        this.logger.debug('Pet double-clicked', { point: action.point });
        await this.livingRuntime.onSocialInput('double_click');
      }

      if (action.type === 'POINTER_CANCELED') {
        this.logger.debug('Pointer interaction canceled', { reason: action.reason });
      }
    }
  }

  private applyDraggedWindowPosition(point: Readonly<{ x: number; y: number }>): void {
    if (this.window.isDestroyed()) return;
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    this.performanceSampler.noteWindowMove();
    this.window.setPosition(x, y, false);
    const margin = BASE_MARGIN * this.scale;
    this.preferredGroundX = x + margin + this.asset.anchor.x * this.scale;
    this.updateLivingSpatialContext();
    const center = { x: x + this.window.getBounds().width / 2, y: y + this.window.getBounds().height / 2 };
    this.activeDisplayId = screen.getDisplayNearestPoint(center).id;
    this.publish();
  }

  private beginSettlement(releasePoint: Readonly<{ x: number; y: number }>): void {
    this.stopSettling();
    const display = screen.getDisplayNearestPoint({ x: Math.round(releasePoint.x), y: Math.round(releasePoint.y) });
    const current = this.window.getBounds();
    const margin = BASE_MARGIN * this.scale;
    const currentGroundX = current.x + margin + this.asset.anchor.x * this.scale;
    const geometry = computeStaticPetGeometry(
      display.workArea,
      {
        canvasSize: CANVAS_SIZE,
        scale: this.scale,
        margin,
        bottomClearance: BOTTOM_CLEARANCE,
        anchor: this.asset.anchor,
      },
      currentGroundX,
    );
    const generation = this.interaction.snapshot().generation;
    this.interactionPhase = 'settling';
    this.activePointerId = undefined;
    this.settlePlan = createSettlePlan(
      generation,
      { x: current.x, y: current.y },
      { x: geometry.windowBounds.x, y: geometry.windowBounds.y },
      performance.now(),
      this.character === 'poko' ? 165 : 210,
    );
    this.activeDisplayId = display.id;
    this.preferredGroundX = geometry.groundPoint.x;
    this.publish();
    this.settleTimer = setInterval(() => this.settlementTick(), SETTLE_INTERVAL_MS);
    this.settleTimer.unref?.();
  }

  private settlementTick(): void {
    const plan = this.settlePlan;
    if (!plan || this.window.isDestroyed()) return;
    if (plan.generation !== this.interaction.snapshot().generation) {
      this.stopSettling();
      return;
    }
    const sample = sampleSettle(plan, performance.now());
    this.performanceSampler.noteWindowMove();
    this.window.setPosition(Math.round(sample.point.x), Math.round(sample.point.y), false);
    if (!sample.completed) return;
    this.performanceSampler.noteWindowMove();
    this.window.setPosition(Math.round(plan.to.x), Math.round(plan.to.y), false);
    this.stopSettling();
    this.interactionPhase = 'idle';
    this.activeDragSessionId = undefined;
    this.activePointerId = undefined;
    this.stateMachine.complete({
      type: 'RECOVERY_COMPLETED',
      generation: this.stateMachine.snapshot().generation,
      monotonicMs: performance.now(),
    });
    void this.restoreIdleAsset('drag-settled').then(() => this.livingRuntime.onDragEnded());
    this.logger.debug('Drag settlement completed', { destination: plan.to });
  }

  private stopSettling(): void {
    if (this.settleTimer) clearInterval(this.settleTimer);
    this.settleTimer = null;
    this.settlePlan = null;
  }

  private async executeDirectionActions(
    actions: readonly DirectionTurnAction[],
    requestGeneration: number,
  ): Promise<void> {
    for (const action of actions) {
      if (requestGeneration !== this.movementRequestGeneration) return;
      if (action.generation !== this.directionTurn.snapshot().generation) return;

      if (action.type === 'RETARGET_TRANSLATION') {
        const display = this.selectDisplay();
        const result = this.locomotion.retarget(action.destinationX, this.groundRange(display), performance.now());
        this.direction = action.direction;
        this.applyMovementSnapshot(result.snapshot, display);
        this.emitLocomotionEvents(result.events);
        this.publish();
        if (!result.snapshot.active) await this.finishMovement(result.snapshot.generation);
      }

      if (action.type === 'WAIT_FOR_GAIT_BOUNDARY') {
        this.movementState = 'stopping';
        this.publish();
      }

      if (action.type === 'STOP_TRANSLATION') {
        await this.interruptTranslation(action.reason);
      }

      if (action.type === 'PLAY_NEUTRAL_HOLD') {
        this.movementState = 'turning';
        await this.restoreIdleAsset('direction-neutral-hold');
        this.scheduleDirectionTick(action.untilMs, requestGeneration, action.generation);
      }

      if (action.type === 'COMMIT_DIRECTION') {
        this.direction = action.direction;
        this.publish();
      }

      if (action.type === 'PLAY_PREPARATION') {
        const preparationId = walkPreparationAnimationId(this.character);
        if (!preparationId) {
          const fallback = this.directionTurn.onPreparationCompleted();
          await this.executeDirectionActions(fallback.actions, requestGeneration);
          continue;
        }
        const asset = await loadPetAsset(preparationId);
        if (requestGeneration !== this.movementRequestGeneration) return;
        this.asset = { ...asset, loop: false };
        this.animationGeneration += 1;
        this.movementState = 'starting';
        this.reposition('walk-preparation');
        this.publish();
      }

      if (action.type === 'START_TRANSLATION') {
        await this.startTranslation(action.direction, action.destinationX, requestGeneration);
      }
    }
  }

  private scheduleDirectionTick(untilMs: number, requestGeneration: number, directionGeneration: number): void {
    this.clearChoreographyTimer();
    const delay = Math.max(0, untilMs - performance.now());
    this.choreographyTimer = setTimeout(() => {
      this.choreographyTimer = null;
      if (requestGeneration !== this.movementRequestGeneration) return;
      if (directionGeneration !== this.directionTurn.snapshot().generation) return;
      const result = this.directionTurn.tick(performance.now());
      void this.executeDirectionActions(result.actions, requestGeneration);
    }, delay);
    this.choreographyTimer.unref?.();
  }

  private clearChoreographyTimer(): void {
    if (this.choreographyTimer) clearTimeout(this.choreographyTimer);
    this.choreographyTimer = null;
  }

  private async startTranslation(
    direction: 'left' | 'right',
    destinationX: number,
    requestGeneration: number,
  ): Promise<void> {
    const walkingAsset = await loadPetAsset(walkingAnimationId(this.character, direction));
    if (requestGeneration !== this.movementRequestGeneration) return;
    const display = this.selectDisplay();
    const generation = ++this.locomotionGeneration;
    this.direction = direction;
    this.directionTurn.markWalking(direction);
    this.asset = walkingAsset;
    this.animationGeneration += 1;
    this.movementState = 'walking';
    const range = this.groundRange(display);
    const profile = createLocomotionProfile(this.character, this.walkingSpeed);
    this.currentTravelSpeed = 0;
    this.targetTravelSpeed = profile.maximumSpeedPxPerSecond;
    const started = this.locomotion.start({
      generation,
      positionX: this.preferredGroundX ?? (range.minimumX + range.maximumX) / 2,
      destinationX,
      bounds: range,
      profile,
      monotonicMs: performance.now(),
    });
    this.applyMovementSnapshot(started.snapshot, display);
    this.publish();
    this.emitLocomotionEvents(started.events);
    if (started.snapshot.active) this.startMovementClock();
    else await this.finishMovement(generation);
  }

  private async cancelChoreography(reason: string): Promise<void> {
    this.clearChoreographyTimer();
    this.directionTurn.interrupt();
    if (this.movementState !== 'idle') {
      this.logger.debug('Direction choreography interrupted', { reason, state: this.movementState });
    }
  }

  private selectDisplay(): Display {
    if (this.activeDisplayId !== undefined) {
      const existing = screen.getAllDisplays().find((display) => display.id === this.activeDisplayId);
      if (existing) return existing;
    }
    if (this.preferredGroundX === undefined) return screen.getPrimaryDisplay();
    const currentBounds = this.window.getBounds();
    return screen.getDisplayNearestPoint({
      x: this.preferredGroundX,
      y: currentBounds.y + currentBounds.height,
    });
  }

  private groundRange(display: Display) {
    const margin = BASE_MARGIN * this.scale;
    return computeGroundXRange(display.workArea, {
      canvasSize: CANVAS_SIZE,
      scale: this.scale,
      margin,
      bottomClearance: BOTTOM_CLEARANCE,
      anchor: this.asset.anchor,
    });
  }

  private reposition(reason: string): void {
    const display = this.selectDisplay();
    const margin = BASE_MARGIN * this.scale;
    const geometry = computeStaticPetGeometry(
      display.workArea,
      {
        canvasSize: CANVAS_SIZE,
        scale: this.scale,
        margin,
        bottomClearance: BOTTOM_CLEARANCE,
        anchor: this.asset.anchor,
      },
      this.preferredGroundX,
    );
    this.performanceSampler.noteWindowMove();
    this.window.setBounds(geometry.windowBounds, false);
    this.preferredGroundX = geometry.groundPoint.x;
    this.activeDisplayId = display.id;
    this.updateLivingSpatialContext(display);
    this.logger.debug('Pet grounded', {
      reason,
      displayId: display.id,
      scaleFactor: display.scaleFactor,
      workArea: display.workArea,
      bounds: geometry.windowBounds,
      groundPoint: geometry.groundPoint,
      character: this.character,
      scale: this.scale,
    });
  }

  private startMovementClock(): void {
    this.stopMovementClock();
    this.movementTimer = setInterval(() => this.movementTick(), MOVEMENT_INTERVAL_MS);
    this.movementTimer.unref?.();
  }

  private stopMovementClock(): void {
    if (this.movementTimer) clearInterval(this.movementTimer);
    this.movementTimer = null;
  }

  private movementTick(): void {
    const snapshot = this.locomotion.getSnapshot();
    if (!snapshot?.active || this.window.isDestroyed()) return;
    const display = this.selectDisplay();
    const result = this.locomotion.tick(performance.now(), this.groundRange(display));
    this.currentTravelSpeed = result.snapshot.speedPxPerSecond;
    this.direction = result.snapshot.direction;
    this.applyMovementSnapshot(result.snapshot, display);
    this.emitLocomotionEvents(result.events);
    if (!result.snapshot.active) void this.finishMovement(result.snapshot.generation);
  }

  private applyMovementSnapshot(snapshot: { positionX: number }, display: Display): void {
    const margin = BASE_MARGIN * this.scale;
    const geometry = computeStaticPetGeometry(
      display.workArea,
      {
        canvasSize: CANVAS_SIZE,
        scale: this.scale,
        margin,
        bottomClearance: BOTTOM_CLEARANCE,
        anchor: this.asset.anchor,
      },
      snapshot.positionX,
    );
    const current = this.window.getBounds();
    if (current.width !== geometry.windowBounds.width || current.height !== geometry.windowBounds.height) {
      this.performanceSampler.noteWindowMove();
    this.window.setBounds(geometry.windowBounds, false);
    } else if (current.x !== geometry.windowBounds.x || current.y !== geometry.windowBounds.y) {
      this.performanceSampler.noteWindowMove();
      this.window.setPosition(geometry.windowBounds.x, geometry.windowBounds.y, false);
    }
    this.preferredGroundX = geometry.groundPoint.x;
    this.activeDisplayId = display.id;
    this.updateLivingSpatialContext(display);
  }

  private async interruptTranslation(reason: string): Promise<boolean> {
    const interrupted = this.locomotion.interrupt(reason, performance.now());
    this.stopMovementClock();
    if (!interrupted) return false;
    this.currentTravelSpeed = 0;
    this.targetTravelSpeed = 0;
    this.emitLocomotionEvents(interrupted.events);
    return true;
  }

  private async finishMovement(generation: number): Promise<void> {
    if (generation !== this.locomotionGeneration) return;
    this.stopMovementClock();
    this.currentTravelSpeed = 0;
    this.targetTravelSpeed = 0;

    const directionSnapshot = this.directionTurn.snapshot();
    if (directionSnapshot.phase === 'waiting_gait_boundary') {
      const result = this.directionTurn.onTranslationEnded(performance.now());
      await this.executeDirectionActions(result.actions, this.movementRequestGeneration);
      return;
    }

    this.directionTurn.markIdle();
    this.movementState = 'idle';
    await this.restoreIdleAsset();
    await this.livingRuntime.onMovementFinished();
  }

  private async restoreIdleAsset(reason = 'movement-finished'): Promise<void> {
    const characterGeneration = this.characterLoadGeneration;
    const visualGeneration = ++this.visualRequestGeneration;
    const asset = await loadStaticPetAsset(this.character);
    if (characterGeneration !== this.characterLoadGeneration || visualGeneration !== this.visualRequestGeneration) return;
    this.asset = asset;
    this.animationGeneration += 1;
    this.reposition(reason);
    this.publish();
  }

  private emitLocomotionEvents(events: ReadonlyArray<LocomotionEvent>): void {
    for (const event of events) {
      this.logger.debug(event.type, event);
      if (!this.window.isDestroyed()) this.window.webContents.send('pet:locomotion-event', event);
    }
  }


  private async playRuntimeAnimation(
    animationId: string,
    options?: Readonly<{ loop?: boolean; playback?: 'forward' | 'reverse' | 'ping_pong' }>,
  ): Promise<void> {
    const characterGeneration = this.characterLoadGeneration;
    const visualGeneration = ++this.visualRequestGeneration;
    const asset = await loadPetAsset(animationId);
    if (characterGeneration !== this.characterLoadGeneration || visualGeneration !== this.visualRequestGeneration) {
      this.logger.debug('Discarded stale runtime animation load', { animationId, visualGeneration });
      return;
    }
    if (asset.character !== this.character) throw new Error(`Animation ${animationId} does not belong to ${this.character}.`);
    this.asset = { ...asset, ...(options?.loop !== undefined ? { loop: options.loop } : {}), ...(options?.playback ? { playback: options.playback } : {}) };
    this.animationGeneration += 1;
    this.movementState = 'idle';
    this.reposition(`runtime-animation:${animationId}`);
    this.publish();
  }

  private async walkToRegion(region: 'left' | 'center' | 'right'): Promise<void> {
    const display = this.selectDisplay();
    const range = this.groundRange(display);
    const destination = region === 'left'
      ? range.minimumX + (range.maximumX - range.minimumX) * 0.2
      : region === 'right'
        ? range.minimumX + (range.maximumX - range.minimumX) * 0.8
        : (range.minimumX + range.maximumX) / 2;
    await this.moveToGroundX(destination);
  }


  private updateLivingSpatialContext(display = this.selectDisplay()): void {
    const range = this.groundRange(display);
    const x = this.preferredGroundX ?? (range.minimumX + range.maximumX) / 2;
    const span = Math.max(1, range.maximumX - range.minimumX);
    const ratio = Math.max(0, Math.min(1, (x - range.minimumX) / span));
    const region = ratio < 0.34 ? 'left' : ratio > 0.66 ? 'right' : 'center';
    const nearEdge = ratio <= 0.12 || ratio >= 0.88;
    this.livingRuntime.updateSpatialContext({ region, nearEdge });
  }

  private publish(): void {
    if (!this.window.isDestroyed()) this.window.webContents.send('pet:static-presentation', this.getPresentation());
  }
}
