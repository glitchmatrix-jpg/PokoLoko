import { GLOBAL_TUNING, tuningFor } from '../../tuning/src/index.js';
import { ActivityController, SeededActivityRandom, buildPlannerOverlay, getApprovedIntegratedActivities, type ActivityCommand, type ActivityEvent, type ActivityId } from '../../activities/src/index.js';
import { BehaviorPlanner, SeededRandom, createInitialMind, createSessionMemory, rememberActivity, rememberDisturbance, rememberRegion, updateMind, type AmbientStep, type ContextSummary, type PetIntention, type PetMind, type ScreenRegion, type SessionMemory } from '../../behavior/src/index.js';
import type { PetContextSnapshot } from '../../context/src/index.js';
import { SocialInteractionController, type SocialInput } from '../../reactions/src/index.js';
import { SleepLifecycleController, type SleepCommand } from '../../sleep/src/index.js';
import { InteractionLifecycle, type InteractionLifecycleState } from './InteractionLifecycle.js';
import type { LivingRuntimePort, LivingRuntimeSettings, LivingRuntimeSnapshot, LivingSpatialContext } from './types.js';

const MIND_TICK_MS = GLOBAL_TUNING.clocks.mindTickMs;
const DEFAULT_CONTEXT: ContextSummary = { typingActivity:'none', pointerActivity:'none', systemIdle:false, audioActive:false, fullscreenActive:false, screenLocked:false, localTimeBand:'day', recentUserInteraction:'none', enabled:false };

export class LivingRuntimeController {
  private character: 'poko'|'loko';
  private settings: LivingRuntimeSettings;
  private mind: PetMind;
  private memory: SessionMemory;
  private context: PetContextSnapshot | null = null;
  private mode: LivingRuntimeSnapshot['mode'] = 'idle';
  private previousMode: LivingRuntimeSnapshot['mode'] | undefined;
  private lastPlannerCandidates: readonly Readonly<{key:string;score:number;reasons:readonly string[]}>[] = [];
  private nextPlanAtMonotonicMs: number | undefined;
  private diagnosticSeed: number;
  private activeId: string | undefined;
  private generation = 0;
  private planner: BehaviorPlanner;
  private activities: ActivityController;
  private reactions: SocialInteractionController;
  private sleep: SleepLifecycleController;
  private plannerTimer: ReturnType<typeof setTimeout> | null = null;
  private mindTimer: ReturnType<typeof setInterval> | null = null;
  private deadlineTimer: ReturnType<typeof setTimeout> | null = null;
  private ambientTimer: ReturnType<typeof setTimeout> | null = null;
  private ambientPhrase: Readonly<{ phraseId: string; steps: readonly AmbientStep[]; index: number; generation: number }> | null = null;
  private lastMindTick = performance.now();
  private lastDecisionReason: string | undefined;
  private spatial: LivingSpatialContext = { region: 'center', nearEdge: false };
  private contextInterruptionGeneration = 0;
  private lastAcceptedSocialInputAtMs = Number.NEGATIVE_INFINITY;
  private readonly socialInputCooldownMs = 2_500;
  private readonly interactionLifecycle = new InteractionLifecycle();

  public constructor(character: 'poko'|'loko', settings: LivingRuntimeSettings, private readonly port: LivingRuntimePort, seed = 0x504f4b4f) {
    this.character = character; this.settings = settings; this.diagnosticSeed = seed >>> 0;
    this.mind = createInitialMind(character); this.memory = createSessionMemory(performance.now());
    this.planner = new BehaviorPlanner(new SeededRandom(seed));
    this.activities = new ActivityController(new SeededActivityRandom(seed ^ 0xa51c));
    this.reactions = new SocialInteractionController(new SeededRandom(seed ^ 0x10c0));
    this.sleep = new SleepLifecycleController(character, performance.now());
  }

  public start(): void { this.stopTimers(); this.lastMindTick=performance.now(); this.mindTimer=setInterval(()=>this.tickMind(),MIND_TICK_MS); this.schedulePlan(1_200); this.publish(); }
  public dispose(): void { this.stopTimers(); }
  public snapshot(): LivingRuntimeSnapshot { const activity=this.activities.snapshot(); const sleep=this.sleep.snapshot(); return { character:this.character, mode:this.mode, ...(this.previousMode?{previousMode:this.previousMode}:{}), ...(this.activeId?{activeId:this.activeId}:{}), mind:this.mind, memory:this.memory, context:this.context, generation:this.generation, interaction:this.interactionLifecycle.snapshot(), ...(this.lastDecisionReason?{lastDecisionReason:this.lastDecisionReason}:{}), plannerCandidates:this.lastPlannerCandidates, ...(this.nextPlanAtMonotonicMs!==undefined?{nextPlanAtMonotonicMs:this.nextPlanAtMonotonicMs}:{}), ...(activity?{activity:{id:activity.activityId,phase:activity.phase,propVisible:activity.propVisible,...(activity.activePropId?{activePropId:activity.activePropId}:{}),...(activity.pendingInterruption?{pendingInterruption:activity.pendingInterruption.reason}:{}),generation:activity.generation}}:{}), ...(sleep?{sleep:{phase:sleep.phase,generation:sleep.generation,...(sleep.plannedWakeAtMonotonicMs!==undefined?{plannedWakeAtMonotonicMs:sleep.plannedWakeAtMonotonicMs}:{})}}:{}) }; }
  public updateContext(context: PetContextSnapshot): void {
    const previous = this.context;
    this.context = context;
    const becameRestrained = context.enabled && ((context.screenLocked && !previous?.screenLocked) || (context.fullscreenActive && !previous?.fullscreenActive));
    if (becameRestrained) void this.applyContextRestraint(context.screenLocked ? 'screen-locked' : 'fullscreen-quiet');
    if (this.mode === 'idle' && !context.screenLocked) this.schedulePlan(1_500);
    this.publish();
  }

  public updateSpatialContext(spatial: LivingSpatialContext): void {
    this.spatial = spatial;
    if (this.mode === 'idle') this.schedulePlan(1_500);
    this.publish();
  }
  public updateSettings(patch: Partial<LivingRuntimeSettings>): void {
    const wasPaused=this.settings.paused;
    this.settings={...this.settings,...patch};
    if(!wasPaused&&this.settings.paused) void this.pauseSafely();
    else if(wasPaused&&!this.settings.paused) void this.resumeSafely();
    else if(this.settings.quietMode && !patch.paused) void this.applyContextRestraint('quiet-mode');
    this.publish();
  }

  public async switchCharacter(character:'poko'|'loko'): Promise<void> { if(character===this.character)return; this.invalidate('character-switch'); this.character=character; this.mind=createInitialMind(character); this.memory=createSessionMemory(performance.now()); this.activities=new ActivityController(new SeededActivityRandom(this.generation^0xa51c)); this.reactions=new SocialInteractionController(new SeededRandom(this.generation^0x10c0)); this.sleep=new SleepLifecycleController(character,performance.now()); this.mode='idle'; this.activeId=undefined; this.interactionLifecycle.force('idle','character-switch'); this.schedulePlan(1_200); this.publish(); }

  public async resetSession(): Promise<void> { this.invalidate('behavior-reset'); this.mind=createInitialMind(this.character); this.memory=createSessionMemory(performance.now()); this.activities=new ActivityController(new SeededActivityRandom(this.generation^0xa51c)); this.reactions=new SocialInteractionController(new SeededRandom(this.generation^0x10c0)); this.sleep=new SleepLifecycleController(this.character,performance.now()); this.mode='idle'; this.activeId=undefined; this.interactionLifecycle.force('idle','behavior-reset'); await this.port.stopMovement('behavior-reset'); await this.port.restoreIdle('behavior-reset'); this.schedulePlan(1_200); this.publish(); }

  public async forceIntention(intention: PetIntention): Promise<void> {
    if (this.settings.paused) return;
    this.invalidate('diagnostic-force');
    this.mode = 'idle';
    this.interactionLifecycle.force('idle','diagnostic-force');
    await this.executeIntention(intention);
  }

  public diagnosticSeedValue(): number { return this.diagnosticSeed; }
  public setDiagnosticSeed(seed:number): void { this.diagnosticSeed=seed>>>0; this.planner=new BehaviorPlanner(new SeededRandom(this.diagnosticSeed)); this.activities=new ActivityController(new SeededActivityRandom(this.diagnosticSeed^0xa51c)); this.reactions=new SocialInteractionController(new SeededRandom(this.diagnosticSeed^0x10c0)); this.lastPlannerCandidates=[]; this.lastDecisionReason=`Diagnostic seed set to ${this.diagnosticSeed}.`; this.publish(); }
  public setDiagnosticMind(patch:Partial<Record<'energy'|'playfulness'|'focus'|'sociability'|'curiosity'|'comfort'|'boredom'|'recentAttention'|'interruptionLoad',number>>):void { const clamped=Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,Math.max(0,Math.min(1,Number(v))) ])); this.mind={...this.mind,...clamped}; this.lastDecisionReason='Mind values changed by diagnostics.'; this.publish(); }
  public async forceDiagnosticWake():Promise<void>{ if(this.mode!=='sleeping')return; await this.executeSleepCommands(this.sleep.handle({type:'REQUEST_WAKE',trigger:'settings_change',monotonicMs:performance.now()}).commands); }
  public async forceDiagnosticReaction(kind:'click'|'double_click'):Promise<void>{ await this.onSocialInput(kind); }

  public onPointerPressed(): void {
    this.interactionLifecycle.press();
    this.publish();
  }

  public onPointerReleasedWithoutDrag(): void {
    this.interactionLifecycle.releaseWithoutDrag();
    if (this.interactionLifecycle.snapshot().state === 'idle' && !this.settings.paused) this.schedulePlan(1_000);
    this.publish();
  }

  public onLandingStarted(): void {
    const state = this.interactionLifecycle.snapshot().state;
    if (state === 'carried' || state === 'dragging') this.interactionLifecycle.transition('landing', 'drag-release');
    this.mode = 'dragged';
    this.publish();
  }

  private enterLifecycle(state: InteractionLifecycleState, reason: string): void {
    if (this.interactionLifecycle.snapshot().state === state) return;
    if (this.interactionLifecycle.canTransition(state)) this.interactionLifecycle.transition(state, reason);
    else this.interactionLifecycle.force(state, reason);
  }

  private plannerAllowed(): boolean {
    return this.interactionLifecycle.snapshot().state === 'idle' && this.mode === 'idle' && this.ambientPhrase === null && !this.settings.paused;
  }

  public async onMovementFinished(): Promise<void> { if(this.mode!=='walking'||this.interactionLifecycle.snapshot().state!=='walking')return; this.memory=rememberActivity(this.memory,'walk',performance.now(),false); this.mode='idle';this.activeId=undefined;this.enterLifecycle('idle','movement-finished');this.schedulePlan(1_000);this.publish(); }
  public async onDragStarted(): Promise<void> { const current=this.interactionLifecycle.snapshot().state; if(current==='dragging'||current==='carried'||current==='landing')return; this.invalidate('drag'); this.enterLifecycle('dragging','drag-threshold-crossed'); await this.port.stopMovement('drag'); this.mind=updateMind(this.mind,{type:'dragged'}); const session=this.activities.snapshot(); if(session) await this.executeActivityCommands(this.activities.handle({type:'INTERRUPT',reason:'drag',generation:session.generation,nowMs:performance.now()}).commands); this.activities=new ActivityController(new SeededActivityRandom(this.generation^0xa51c)); this.clearDeadline(); this.mode='dragged'; this.activeId=undefined; this.enterLifecycle('carried','native-window-following-cursor'); this.publish(); }
  public async onDragEnded(): Promise<void> { if(this.interactionLifecycle.snapshot().state!=='landing')this.enterLifecycle('landing','drag-ended-without-explicit-landing'); this.mode='idle';this.activeId=undefined;this.memory=rememberDisturbance(this.memory,performance.now());this.enterLifecycle('idle','landing-complete');this.schedulePlan(1_500);this.publish(); await this.handleSocial({type:'drag_release',nowMs:performance.now()}); }
  public async onSocialInput(type:'click'|'double_click'): Promise<void> {
    const nowMs = performance.now();
    const lifecycleState=this.interactionLifecycle.snapshot().state;
    if(['dragging','carried','landing'].includes(lifecycleState)){this.lastDecisionReason='Click suppressed during drag lifecycle.';this.publish();return;}
    this.mind = updateMind(this.mind, { type:'interaction', intensity:type==='double_click'?'high':'light' });
    if (this.mode === 'reaction' || nowMs - this.lastAcceptedSocialInputAtMs < this.socialInputCooldownMs) {
      this.lastDecisionReason = 'Social input acknowledged without restarting the current reaction.';
      this.publish();
      return;
    }
    this.lastAcceptedSocialInputAtMs = nowMs;
    await this.handleSocial({type,nowMs});
  }

  public async onAnimationEvent(event:{type:'ANIMATION_COMPLETED'|'FRAME_CHANGED';animationId:string;generation:number;loopBoundary?:boolean}): Promise<void> {
    if(this.mode==='activity'&&this.interactionLifecycle.snapshot().state==='performing_activity') {
      const session=this.activities.snapshot(); if(!session)return;
      const mapped:ActivityEvent|undefined=event.type==='ANIMATION_COMPLETED'?{type:'ANIMATION_COMPLETED',animationId:event.animationId,generation:session.generation,nowMs:performance.now()}:event.loopBoundary?{type:'LOOP_BOUNDARY',animationId:event.animationId,generation:session.generation,nowMs:performance.now()}:undefined;
      if(mapped) await this.executeActivityCommands(this.activities.handle(mapped).commands);
    } else if(this.mode==='reaction'&&this.interactionLifecycle.snapshot().state==='reacting' && event.type==='ANIMATION_COMPLETED') { await this.finishReaction(); }
    else if(this.mode==='sleeping'&&['sleeping','waking'].includes(this.interactionLifecycle.snapshot().state) && event.type==='ANIMATION_COMPLETED') { await this.executeSleepCommands(this.sleep.handle({type:'ANIMATION_COMPLETED',animationId:event.animationId,generation:this.sleep.snapshot().generation,monotonicMs:performance.now()}).commands); }
  }

  private schedulePlan(delayMs:number):void { if(!this.plannerAllowed())return; this.nextPlanAtMonotonicMs=performance.now()+Math.max(0,delayMs); if(this.plannerTimer)clearTimeout(this.plannerTimer); const gen=this.generation; this.plannerTimer=setTimeout(()=>{this.plannerTimer=null;if(gen===this.generation)void this.plan();},Math.max(0,delayMs)); }
  private async plan():Promise<void>{ this.nextPlanAtMonotonicMs=undefined; if(!this.plannerAllowed())return; const now=performance.now(); const context=this.toPlannerContext(); const approved=getApprovedIntegratedActivities(this.character).map(x=>x.id); const overlay=buildPlannerOverlay({character:this.character,state:'stable.idle_front',posture:'standing_front',currentRegion:this.region(),nearScreenEdge:this.nearEdge(),context:{enabled:context.enabled,typingActivity:context.typingActivity,pointerActivity:context.pointerActivity,systemIdle:context.systemIdle,audioActive:context.audioActive,fullscreenActive:context.fullscreenActive,screenLocked:context.screenLocked,recentUserInteraction:context.recentUserInteraction},mind:this.mind,history:this.memory.recentActivities.filter(x=>['drink','eat','laptop','music','peeking','playing_ball','reading'].includes(x.id)).map(x=>({activityId:x.id as ActivityId,character:this.character,completedAtMs:x.completedAtMs,interrupted:x.interrupted})),nowMs:now,activityLevel:this.settings.activityLevel,quietMode:this.settings.quietMode});
    const decision=this.planner.decide({character:this.character,state:'stable.idle_front',currentRegion:this.region(),mind:this.mind,context,memory:this.memory,settings:this.settings,nowMs:now,legalActivities:approved,activityScoreMultipliers:overlay.scoreMultipliers,activityDurationOverrides:overlay.durationOverrides}); this.lastDecisionReason=decision.reason; this.lastPlannerCandidates=decision.candidates.slice(0,12); this.port.log('Behavior decision',{reason:decision.reason,candidates:decision.candidates.slice(0,5),intention:decision.intention}); if(!decision.intention){this.schedulePlan(4_000);return;} await this.executeIntention(decision.intention); }
  private async executeIntention(i:PetIntention):Promise<void>{ this.previousMode=this.mode; this.generation+=1; this.activeId=i.kind; if(i.kind==='remain_idle'){this.mode='idle';this.enterLifecycle('idle','planner-remain-idle');this.memory=rememberActivity(this.memory,'remain_idle',performance.now(),false);this.schedulePlan(i.durationMs);}
    else if(i.kind==='ambient'){this.mode='idle';this.enterLifecycle('idle','planner-ambient-phrase');this.activeId=i.phraseId;this.ambientPhrase={phraseId:i.phraseId,steps:i.steps,index:0,generation:this.generation};await this.playAmbientStep();}
    else if(i.kind==='walk'){this.mode='walking';this.enterLifecycle('walking','planner-walk');this.memory=rememberRegion(this.memory,i.destinationRegion);await this.port.walkToRegion(i.destinationRegion);}
    else if(i.kind==='sleep'){this.mode='sleeping';this.enterLifecycle('sleeping','planner-sleep');await this.executeSleepCommands(this.sleep.handle({type:'REQUEST_SLEEP',trigger:'planner',plannedDurationMs:i.durationMs,monotonicMs:performance.now()}).commands);}
    else if(i.kind==='activity'){this.mode='activity';this.enterLifecycle('performing_activity','planner-activity');this.activeId=i.activityId;const result=this.activities.start({requestId:`activity:${this.generation}`,character:this.character,activityId:i.activityId,currentState:'stable.idle_front',currentPosture:'standing_front',nowMs:performance.now()});await this.executeActivityCommands(result.commands);}
    else if(i.kind==='social_reaction'){await this.handleSocial({type:'long_idle',nowMs:performance.now()});}
    this.publish(); }

  private async playAmbientStep(): Promise<void> {
    const phrase = this.ambientPhrase;
    if (!phrase || phrase.generation !== this.generation) return;
    const step = phrase.steps[phrase.index];
    if (!step) { await this.finishAmbientPhrase(false); return; }
    await this.port.playAnimation(step.animationId, { loop: step.loop ?? false });
    this.clearAmbientTimer();
    const expectedGeneration = phrase.generation;
    const expectedIndex = phrase.index;
    this.ambientTimer = setTimeout(() => {
      const current = this.ambientPhrase;
      if (!current || current.generation !== expectedGeneration || current.index !== expectedIndex) return;
      this.ambientPhrase = { ...current, index: current.index + 1 };
      void this.playAmbientStep();
    }, Math.max(120, step.durationMs));
    this.publish();
  }

  private async finishAmbientPhrase(interrupted: boolean): Promise<void> {
    const phrase = this.ambientPhrase;
    if (!phrase) return;
    this.clearAmbientTimer();
    this.ambientPhrase = null;
    this.memory = rememberActivity(this.memory, phrase.phraseId as Parameters<typeof rememberActivity>[1], performance.now(), interrupted);
    this.activeId = undefined;
    if (!interrupted) await this.port.restoreIdle('ambient-phrase-finished');
    if (!this.settings.paused && this.interactionLifecycle.snapshot().state === 'idle') this.schedulePlan(this.character === 'poko' ? 650 : 1_400);
    this.publish();
  }

  private clearAmbientTimer(): void {
    if (this.ambientTimer) clearTimeout(this.ambientTimer);
    this.ambientTimer = null;
  }

  private cancelAmbientPhrase(reason: string): void {
    if (!this.ambientPhrase) return;
    this.port.log('Ambient phrase interrupted', { phraseId: this.ambientPhrase.phraseId, reason });
    this.clearAmbientTimer();
    this.memory = rememberActivity(this.memory, this.ambientPhrase.phraseId as Parameters<typeof rememberActivity>[1], performance.now(), true);
    this.ambientPhrase = null;
    this.activeId = undefined;
  }

  private async executeActivityCommands(commands:readonly ActivityCommand[]):Promise<void>{
    const hasHold = commands.some((command) => command.type === 'HOLD');
    for(const c of commands){
      if(c.type==='PLAY_ANIMATION'){
        await this.port.playAnimation(c.animationId,{...(c.loops!==undefined?{loop:c.loops>1}:{})});
      } else if(c.type==='HOLD'){
        this.scheduleActivityHold(c.durationMs,c.generation);
      } else if(c.type==='REQUEST_STATE'){
        if(!hasHold && c.target==='transition.activity_entry') this.scheduleActivityStateReady(c.generation);
        else if(!hasHold && c.target.startsWith('activity.')) this.scheduleActivitySyntheticCompletion(c.generation);
        else if(!hasHold && (c.target==='transition.activity_exit'||c.target==='transition.recovering'||c.target==='stable.idle_front'||c.target==='stable.sitting'||c.target==='stable.idle_side')) this.scheduleActivitySyntheticCompletion(c.generation);
      } else if(c.type==='SCHEDULE_DEADLINE'){
        this.clearDeadline();
        this.deadlineTimer=setTimeout(()=>{const session=this.activities.snapshot();if(session?.generation===c.generation)void this.executeActivityCommands(this.activities.handle({type:'DURATION_ELAPSED',generation:c.generation,nowMs:performance.now()}).commands);},Math.max(0,c.atMs-performance.now()));
      } else if(c.type==='CANCEL_DEADLINE'){
        this.clearDeadline();
      } else if(c.type==='ACTIVITY_FINISHED'){
        if(this.interactionLifecycle.snapshot().state!=='performing_activity')continue;
        this.clearDeadline();
        this.mind=updateMind(this.mind,{type:'activity_completed',activityId:c.activityId,interrupted:c.interrupted});
        this.memory=rememberActivity(this.memory,c.activityId,performance.now(),c.interrupted);
        this.mode='idle'; this.activeId=undefined;this.enterLifecycle('idle','activity-finished');
        await this.port.restoreIdle('activity-finished');
        this.schedulePlan(1_500);
        if(!c.interrupted) await this.handleSocial({type:'activity_success',nowMs:performance.now()});
      } else if(c.type==='DIAGNOSTIC') this.port.log(c.message);
    }
    this.publish();
  }

  private scheduleActivityStateReady(generation:number):void{
    queueMicrotask(()=>{
      const session=this.activities.snapshot();
      if(session?.generation!==generation||session.phase!=='entry')return;
      void this.executeActivityCommands(this.activities.handle({type:'STATE_READY',state:'transition.activity_entry',generation,nowMs:performance.now()}).commands);
    });
  }

  private scheduleActivitySyntheticCompletion(generation:number):void{
    queueMicrotask(()=>{
      const session=this.activities.snapshot();
      if(session?.generation!==generation)return;
      void this.executeActivityCommands(this.activities.handle({type:'ANIMATION_COMPLETED',animationId:session.activeAnimationId??'',generation,nowMs:performance.now()}).commands);
    });
  }

  private scheduleActivityHold(ms:number,generation:number):void{this.clearDeadline();this.deadlineTimer=setTimeout(()=>{const s=this.activities.snapshot();if(!s||s.generation!==generation)return;const synthetic=s.phase==='entry'?{type:'STATE_READY' as const,state:'transition.activity_entry',generation,nowMs:performance.now()}:{type:'ANIMATION_COMPLETED' as const,animationId:s.activeAnimationId??'',generation,nowMs:performance.now()};void this.executeActivityCommands(this.activities.handle(synthetic).commands);},ms);}
  private async executeSleepCommands(commands:readonly SleepCommand[]):Promise<void>{for(const c of commands){if(c.kind==='disable_locomotion')await this.port.stopMovement('sleep');else if(c.kind==='play_animation')await this.port.playAnimation(c.animationId,{loop:c.loop,playback:c.playback});else if(c.kind==='hold_frame'){this.clearDeadline();this.deadlineTimer=setTimeout((): void => { void this.executeSleepCommands(this.sleep.handle({type:'HOLD_COMPLETED',generation:c.generation,monotonicMs:performance.now()}).commands); },c.durationMs);}else if(c.kind==='sleep_started'){const snap=this.sleep.snapshot();const delay=Math.max(1_000,(snap.plannedWakeAtMonotonicMs??performance.now()+60_000)-performance.now());this.clearDeadline();this.deadlineTimer=setTimeout((): void => { void this.executeSleepCommands(this.sleep.handle({type:'SLEEP_DEADLINE_REACHED',generation:c.generation,monotonicMs:performance.now()}).commands); },delay);}else if(c.kind==='sleep_finished'){this.mind=updateMind(this.mind,{type:'slept',elapsedMs:c.sleptMs});this.mind=updateMind(this.mind,{type:'woke'});this.memory={...this.memory,lastWakeAtMs:performance.now(),lastSleepAtMs:performance.now()-c.sleptMs};this.mode='idle';this.activeId=undefined;this.enterLifecycle('idle','wake-finished');await this.port.restoreIdle('wake-finished');this.schedulePlan(2_000);}}
    this.publish();}
  private async handleSocial(input:SocialInput):Promise<void>{const session=this.activities.snapshot();const result=this.reactions.handle({character:this.character,posture:this.mode==='sleeping'?'lying_sleep':session?.propVisible?'activity_prop':'standing_front',stateId:this.mode,stateInterruption:this.mode==='activity'?'deferred':'soft',sleeping:this.mode==='sleeping',...(session?{activeActivity:{id:session.activityId,propVisible:session.propVisible,safeMarker:Boolean(session.lastSafeMarker)}}:{})},input);for(const c of result.commands){if(c.type==='PLAY_REACTION'){this.invalidate('reaction');await this.port.stopMovement('social-reaction');this.mode='reaction';this.activeId=c.reactionId;this.enterLifecycle('reacting','social-reaction');await this.port.playAnimation(c.animationId,{loop:false});this.clearDeadline();const watchdogMs=Math.max(GLOBAL_TUNING.clocks.reactionWatchdogMinimumMs,c.durationMs*GLOBAL_TUNING.clocks.reactionWatchdogMultiplier+GLOBAL_TUNING.clocks.reactionWatchdogPaddingMs);this.deadlineTimer=setTimeout(()=>{if(this.mode==='reaction'){this.port.log('Reaction animation watchdog recovered a missing completion',{reactionId:c.reactionId,watchdogMs});void this.finishReaction();}},watchdogMs);}else if(c.type==='REQUEST_WAKE'){this.enterLifecycle('waking','wake-requested');await this.executeSleepCommands(this.sleep.handle({type:'REQUEST_WAKE',trigger:'user_click',monotonicMs:performance.now()}).commands);}else if(c.type==='REQUEST_ACTIVITY_SAFE_EXIT'&&session){await this.executeActivityCommands(this.activities.handle({type:'INTERRUPT',reason:'fullscreen_quiet',generation:session.generation,nowMs:performance.now()}).commands);}else if(c.type==='DIAGNOSTIC'||c.type==='REACTION_IGNORED'||c.type==='DEFER_REACTION')this.port.log('Reaction',c);}this.publish();}
  private async finishReaction():Promise<void>{if(this.mode!=='reaction'||this.interactionLifecycle.snapshot().state!=='reacting')return;this.clearDeadline();this.mode='idle';this.activeId=undefined;this.enterLifecycle('idle','reaction-finished');await this.port.restoreIdle('reaction-finished');this.schedulePlan(1_500);this.publish();}
  private async pauseSafely():Promise<void>{
    this.invalidate('pause');
    await this.port.stopMovement('runtime-paused');
    const session=this.activities.snapshot();
    if(session){
      await this.executeActivityCommands(this.activities.handle({type:'INTERRUPT',reason:'pause',generation:session.generation,nowMs:performance.now()}).commands);
      this.activities=new ActivityController(new SeededActivityRandom(this.generation^0xa51c));
    }
    this.sleep.handle({type:'PAUSE',monotonicMs:performance.now()});
    await this.port.restoreIdle('runtime-paused-safe-neutral');
    this.mode='paused'; this.activeId=undefined; this.interactionLifecycle.force('paused','runtime-paused'); this.publish();
  }

  private async resumeSafely():Promise<void>{
    this.invalidate('resume');
    this.sleep.handle({type:'RESUME',monotonicMs:performance.now()});
    await this.port.restoreIdle('runtime-resumed');
    this.mode='idle'; this.activeId=undefined; this.interactionLifecycle.force('idle','runtime-resumed'); this.schedulePlan(1_200); this.publish();
  }


  private async applyContextRestraint(reason: 'screen-locked'|'fullscreen-quiet'|'quiet-mode'): Promise<void> {
    const guard = ++this.contextInterruptionGeneration;
    if (['pressed','dragging','carried','landing'].includes(this.interactionLifecycle.snapshot().state) || this.mode === 'paused' || this.mode === 'sleeping') return;
    if (this.mode === 'walking') {
      this.invalidate(reason);
      await this.port.stopMovement(reason);
      if (guard !== this.contextInterruptionGeneration) return;
      this.mode = 'idle'; this.activeId = undefined;this.enterLifecycle('idle',reason);
      await this.port.restoreIdle(reason);
    } else if (this.mode === 'activity') {
      const session = this.activities.snapshot();
      if (session) await this.executeActivityCommands(this.activities.handle({type:'INTERRUPT',reason:'fullscreen_quiet',generation:session.generation,nowMs:performance.now()}).commands);
    } else if (this.mode === 'reaction') {
      this.invalidate(reason);
      this.mode = 'idle'; this.activeId = undefined;this.enterLifecycle('idle',reason);
      await this.port.restoreIdle(reason);
    }
    if (guard !== this.contextInterruptionGeneration) return;
    if (!this.settings.paused && !this.context?.screenLocked) this.schedulePlan(2_000);
    this.publish();
  }

  private tickMind():void{const now=performance.now();const elapsed=now-this.lastMindTick;this.lastMindTick=now;const kind=this.mode==='sleeping'?'sleep':this.mode==='activity'?'activity':this.mode==='walking'?'walk':'remain_idle';this.mind=updateMind(this.mind,{type:'tick',elapsedMs:elapsed,context:this.toPlannerContext(),activeKind:kind});this.publish();}
  private toPlannerContext():ContextSummary{const c=this.context;if(!this.settings.contextualAwareness||!c||!c.enabled)return DEFAULT_CONTEXT;return{typingActivity:c.typingActivity,pointerActivity:c.mouseActivity,systemIdle:c.systemIdle,audioActive:c.audioActive,fullscreenActive:c.fullscreenActive,screenLocked:c.screenLocked,localTimeBand:c.timeBand,recentUserInteraction:c.recentPetInteraction,enabled:true};}
  private region():ScreenRegion{return this.spatial.region;} private nearEdge():boolean{return this.spatial.nearEdge;}
  private invalidate(reason:string):void{this.cancelAmbientPhrase(reason);this.previousMode=this.mode;this.generation+=1;this.nextPlanAtMonotonicMs=undefined;this.clearDeadline();if(this.plannerTimer)clearTimeout(this.plannerTimer);this.plannerTimer=null;this.port.log('Living runtime invalidated',{reason,generation:this.generation});}
  private clearDeadline():void{if(this.deadlineTimer)clearTimeout(this.deadlineTimer);this.deadlineTimer=null;}
  private stopTimers():void{if(this.plannerTimer)clearTimeout(this.plannerTimer);if(this.mindTimer)clearInterval(this.mindTimer);this.clearDeadline();this.clearAmbientTimer();this.ambientPhrase=null;this.plannerTimer=null;this.mindTimer=null;}
  private publish():void{this.port.onSnapshot(this.snapshot());}
}
