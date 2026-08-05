import { getActivityDefinition } from './registry.js';
import type { ActivityCommand, ActivityDefinition, ActivityEvent, ActivityPhase, ActivityRandomSource, ActivityRequest, ActivityResult, ActivitySession, ActivityStep, ActivityStopReason, InterruptionLevel } from './types.js';

const phaseInterruption = (definition: ActivityDefinition, phase: ActivityPhase): InterruptionLevel => {
  if (phase === 'completed' || phase === 'cancelled') return 'immediate';
  return definition.interruption[phase];
};

const commandsForSteps = (steps: readonly ActivityStep[], generation: number): ActivityCommand[] => steps.map((step) => {
  if (step.kind === 'transition') return { type: 'REQUEST_STATE', target: step.targetState, reason: step.note ?? 'activity choreography', generation };
  if (step.kind === 'animation') return { type: 'PLAY_ANIMATION', animationId: step.animationId, loops: step.loops, generation };
  if (step.kind === 'hold') return { type: 'HOLD', durationMs: step.durationMs, note: step.note, generation };
  return { type: 'SET_PROP', action: step.action, propId: step.propId, generation };
});

const sampleDuration = (definition: ActivityDefinition, rng: ActivityRandomSource): { endAt?: number; loops?: number } => {
  if (definition.duration.kind === 'one_shot') return {};
  if (definition.duration.kind === 'loop_count') {
    return { loops: definition.duration.min + rng.nextInt(definition.duration.max - definition.duration.min + 1) };
  }
  return { endAt: definition.duration.minMs + rng.nextInt(definition.duration.maxMs - definition.duration.minMs + 1) };
};

export class ActivityController {
  private generation = 0;
  private session: ActivitySession | null = null;

  constructor(private readonly rng: ActivityRandomSource) {}

  snapshot(): ActivitySession | null { return this.session; }

  start(request: ActivityRequest): ActivityResult {
    const definition = getActivityDefinition(request.character, request.activityId);
    if (!definition) return this.reject(request, `Activity ${request.activityId} is not approved for ${request.character}.`);
    if (!definition.legalEntryStates.includes(request.currentState) || !definition.legalEntryPostures.includes(request.currentPosture)) {
      return this.reject(request, `Illegal activity entry from ${request.currentState}/${request.currentPosture}.`);
    }
    this.generation += 1;
    const sampled = sampleDuration(definition, this.rng);
    this.session = {
      sessionId: request.requestId,
      generation: this.generation,
      character: request.character,
      activityId: request.activityId,
      phase: 'entry', phaseIndex: 0,
      startedAtMs: request.nowMs, phaseStartedAtMs: request.nowMs,
      plannedEndAtMs: sampled.endAt === undefined ? undefined : request.nowMs + sampled.endAt,
      plannedLoopCount: sampled.loops, completedLoops: 0,
      propVisible: false,
    };
    return {
      session: this.session,
      commands: [
        { type: 'REQUEST_STATE', target: 'transition.activity_entry', reason: `Begin ${definition.label}`, generation: this.generation },
        ...commandsForSteps(definition.entry, this.generation),
        { type: 'DIAGNOSTIC', level: 'info', message: `Activity ${definition.id} entered phase entry.`, generation: this.generation },
      ],
    };
  }

  handle(event: ActivityEvent): ActivityResult {
    if (!this.session) return { session: null, commands: [] };
    if (event.generation !== this.session.generation) {
      return { session: this.session, commands: [{ type: 'DIAGNOSTIC', level: 'warn', message: `Ignored stale ${event.type}.`, generation: this.session.generation }] };
    }
    const definition = getActivityDefinition(this.session.character, this.session.activityId);
    if (!definition) return this.forceCancel('asset_failure', event.nowMs);
    if (event.type === 'INTERRUPT') return this.interrupt(definition, event.reason, event.nowMs);
    if (event.type === 'ASSET_FAILED') return this.forceCancel('asset_failure', event.nowMs);
    if (event.type === 'ANIMATION_MARKER') {
      this.session = { ...this.session, lastSafeMarker: event.marker };
      if (this.session.pendingInterruption && definition.interruption.deferredSafeMarkers.includes(event.marker)) return this.beginExit(definition, this.session.pendingInterruption.reason, event.nowMs);
      return { session: this.session, commands: [] };
    }
    if (event.type === 'STATE_READY' && this.session.phase === 'entry') return this.beginSetup(definition, event.nowMs);
    if (event.type === 'ANIMATION_COMPLETED') {
      if (this.session.phase === 'setup') return this.beginLoop(definition, event.nowMs);
      if (this.session.phase === 'variation') return this.beginLoop(definition, event.nowMs);
      if (this.session.phase === 'loop' && definition.duration.kind === 'one_shot') return this.beginExit(definition, 'completed', event.nowMs);
      if (this.session.phase === 'exit') return this.finish(definition, this.session.exitReason ?? 'completed', event.nowMs);
      if (this.session.phase === 'recovery') return this.finish(definition, this.session.exitReason ?? 'invalid_state', event.nowMs);
    }
    if (event.type === 'LOOP_BOUNDARY' && this.session.phase === 'loop') {
      const loops = this.session.completedLoops + 1;
      this.session = { ...this.session, completedLoops: loops, lastSafeMarker: 'loop_boundary' };
      if (this.session.pendingInterruption) return this.beginExit(definition, this.session.pendingInterruption.reason, event.nowMs);
      if (definition.duration.kind === 'loop_count' && loops >= (this.session.plannedLoopCount ?? 1)) return this.beginExit(definition, 'completed', event.nowMs);
      if (definition.duration.kind === 'time_range' && this.session.plannedEndAtMs !== undefined && event.nowMs >= this.session.plannedEndAtMs) return this.beginExit(definition, 'completed', event.nowMs);
      return this.maybeVariation(definition, event.nowMs);
    }
    if (event.type === 'DURATION_ELAPSED' && this.session.phase === 'loop') {
      this.session = { ...this.session, pendingInterruption: { reason: 'completed', requestedAtMs: event.nowMs } };
      return { session: this.session, commands: [{ type: 'DIAGNOSTIC', level: 'info', message: 'Duration elapsed; waiting for safe activity boundary.', generation: this.session.generation }] };
    }
    return { session: this.session, commands: [] };
  }

  private beginSetup(definition: ActivityDefinition, nowMs: number): ActivityResult {
    this.session = { ...this.session!, phase: 'setup', phaseIndex: 0, phaseStartedAtMs: nowMs, propVisible: definition.prop.appearsDuring === 'setup', activePropId: definition.prop.propId };
    const commands = commandsForSteps(definition.setup, this.session.generation);
    if (commands.length === 0) return this.beginLoop(definition, nowMs);
    return { session: this.session, commands: [...commands, { type: 'REQUEST_STATE', target: `activity.${definition.id}`, reason: 'Activity setup', generation: this.session.generation }] };
  }

  private beginLoop(definition: ActivityDefinition, nowMs: number): ActivityResult {
    const animation = definition.loop.find((x) => x.kind === 'animation');
    this.session = { ...this.session!, phase: 'loop', phaseIndex: 0, phaseStartedAtMs: nowMs, activeAnimationId: animation?.kind === 'animation' ? animation.animationId : undefined, propVisible: definition.prop.ownership !== 'none' };
    const commands: ActivityCommand[] = [...commandsForSteps(definition.loop, this.session.generation)];
    if (this.session.plannedEndAtMs !== undefined) commands.push({ type: 'SCHEDULE_DEADLINE', atMs: this.session.plannedEndAtMs, generation: this.session.generation });
    commands.push({ type: 'DIAGNOSTIC', level: 'info', message: `Activity ${definition.id} entered loop.`, generation: this.session.generation });
    return { session: this.session, commands };
  }

  private maybeVariation(definition: ActivityDefinition, nowMs: number): ActivityResult {
    if (definition.variations.length === 0 || this.rng.nextFloat() > 0.25) return { session: this.session, commands: [] };
    const total = definition.variations.reduce((sum, item) => sum + item.weight, 0);
    let pick = this.rng.nextFloat() * total;
    const variation = definition.variations.find((item) => (pick -= item.weight) <= 0) ?? definition.variations[0];
    this.session = { ...this.session!, phase: 'variation', phaseIndex: 0, phaseStartedAtMs: nowMs };
    return { session: this.session, commands: [...commandsForSteps(variation.steps, this.session.generation), { type: 'DIAGNOSTIC', level: 'info', message: `Variation ${variation.id}.`, generation: this.session.generation }] };
  }

  private interrupt(definition: ActivityDefinition, reason: ActivityStopReason, nowMs: number): ActivityResult {
    const level = phaseInterruption(definition, this.session!.phase);
    if (reason === 'drag' || reason === 'character_switch' || reason === 'display_loss' || reason === 'shutdown') return this.forceCancel(reason, nowMs, definition);
    if (level === 'immediate') return this.forceCancel(reason, nowMs, definition);
    if (level === 'soft' && (this.session!.lastSafeMarker === 'loop_boundary' || this.session!.phase === 'entry')) return this.beginExit(definition, reason, nowMs);
    this.session = { ...this.session!, pendingInterruption: { reason, requestedAtMs: nowMs } };
    return { session: this.session, commands: [{ type: 'DIAGNOSTIC', level: 'info', message: `${reason} deferred until a prop/posture-safe boundary.`, generation: this.session!.generation }] };
  }

  private beginExit(definition: ActivityDefinition, reason: ActivityStopReason, nowMs: number): ActivityResult {
    this.session = { ...this.session!, phase: 'exit', phaseIndex: 0, phaseStartedAtMs: nowMs, pendingInterruption: undefined, exitReason: reason };
    return { session: this.session, commands: [{ type: 'CANCEL_DEADLINE', generation: this.session.generation }, ...commandsForSteps(definition.exit, this.session.generation), { type: 'REQUEST_STATE', target: 'transition.activity_exit', reason: `Exit ${definition.id}: ${reason}`, generation: this.session.generation }] };
  }

  private forceCancel(reason: ActivityStopReason, nowMs: number, definition?: ActivityDefinition): ActivityResult {
    if (!this.session) return { session: null, commands: [] };
    const active = definition ?? getActivityDefinition(this.session.character, this.session.activityId);
    const generation = this.session.generation;
    if (!active) {
      const id = this.session.activityId;
      this.session = null;
      return { session: null, commands: [{ type: 'ACTIVITY_FINISHED', activityId: id, interrupted: true, reason, generation }] };
    }
    this.session = { ...this.session, phase: 'recovery', phaseStartedAtMs: nowMs, pendingInterruption: undefined, exitReason: reason, propVisible: false };
    return { session: this.session, commands: [{ type: 'CANCEL_DEADLINE', generation }, ...(active.prop.propId ? [{ type: 'SET_PROP', action: 'remove', propId: active.prop.propId, generation } as const] : []), ...commandsForSteps(active.recovery, generation), { type: 'REQUEST_STATE', target: active.interruption.immediateRecoveryState, reason: `Immediate activity recovery: ${reason}`, generation }] };
  }

  private finish(definition: ActivityDefinition, reason: ActivityStopReason, nowMs: number): ActivityResult {
    const generation = this.session!.generation;
    const interrupted = reason !== 'completed';
    this.session = { ...this.session!, phase: 'completed', phaseStartedAtMs: nowMs, propVisible: false };
    const final = this.session;
    this.session = null;
    return { session: null, commands: [{ type: 'ACTIVITY_FINISHED', activityId: definition.id, interrupted, reason, generation }, { type: 'DIAGNOSTIC', level: 'info', message: `Activity ${definition.id} finished (${reason}).`, generation }] };
  }

  private reject(request: ActivityRequest, message: string): ActivityResult {
    return { session: this.session, commands: [{ type: 'DIAGNOSTIC', level: 'error', message, generation: this.generation }] };
  }
}
