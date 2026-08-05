import { STATE_DEFINITIONS } from './stateGraph.js';
import { resolveRoute } from './routes.js';
import type {
  CharacterId, CompletionEvent, MachineResult, PropState, StateId, StateSnapshot,
  StateTarget, TransitionLogEntry, TransitionRequest, Direction
} from './types.js';

export type TransitionLogger = (entry: TransitionLogEntry) => void;

function finite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

export class PetStateMachine {
  private snapshotValue: StateSnapshot;
  private readonly transitionLog: TransitionLogEntry[] = [];

  public constructor(
    character: CharacterId,
    monotonicMs = 0,
    private readonly logger?: TransitionLogger,
  ) {
    finite(monotonicMs, 'monotonicMs');
    this.snapshotValue = {
      character,
      state: 'system.booting',
      generation: 0,
      enteredAtMonotonicMs: monotonicMs,
      direction: 'front',
      prop: { kind: 'none' },
      route: [],
    };
  }

  public snapshot(): StateSnapshot { return this.snapshotValue; }
  public history(): readonly TransitionLogEntry[] { return this.transitionLog; }

  public request(request: TransitionRequest): MachineResult {
    finite(request.monotonicMs, 'monotonicMs');
    const before = this.snapshotValue;
    const resolved = resolveRoute(before, request.target);
    const accepted = resolved.route.length > 0;
    let after = before;

    if (accepted) {
      const generation = before.generation + 1;
      const [first, ...rest] = resolved.route;
      after = this.enter(first!, rest, generation, request.monotonicMs, request.reason, request.target);
      this.snapshotValue = after;
    }

    const log: TransitionLogEntry = {
      requestId: request.requestId,
      reason: request.reason,
      source: before.state,
      requestedTarget: request.target.kind,
      accepted,
      route: resolved.route,
      ...(resolved.fallback ? { fallback: resolved.fallback } : {}),
      generationBefore: before.generation,
      generationAfter: after.generation,
    };
    this.record(log);
    return { snapshot: after, log };
  }

  public complete(event: CompletionEvent): StateSnapshot {
    finite(event.monotonicMs, 'monotonicMs');
    const current = this.snapshotValue;
    if (event.generation !== current.generation) return current;
    const definition = STATE_DEFINITIONS[current.state];
    if (definition.completionEvent !== event.type) return current;

    if (current.route.length === 0) return current;
    const [next, ...remaining] = current.route;
    this.snapshotValue = this.enter(next!, remaining, current.generation, event.monotonicMs, current.routeReason ?? event.type);
    this.drainPlannedStableWaypoints(event.monotonicMs);
    return this.snapshotValue;
  }

  public replaceCharacter(character: CharacterId, monotonicMs: number): StateSnapshot {
    finite(monotonicMs, 'monotonicMs');
    this.snapshotValue = {
      character,
      state: 'transition.recovering',
      generation: this.snapshotValue.generation + 1,
      enteredAtMonotonicMs: monotonicMs,
      direction: 'front',
      prop: { kind: 'none' },
      route: ['stable.idle_front'],
      routeReason: 'character-change',
    };
    return this.snapshotValue;
  }

  public forceRecovery(reason: string, monotonicMs: number): StateSnapshot {
    finite(monotonicMs, 'monotonicMs');
    this.snapshotValue = {
      ...this.snapshotValue,
      state: 'system.recovering',
      generation: this.snapshotValue.generation + 1,
      enteredAtMonotonicMs: monotonicMs,
      prop: { kind: 'none' },
      route: ['stable.idle_front'],
      routeReason: reason,
    };
    return this.snapshotValue;
  }

  private enter(
    state: StateId,
    route: readonly StateId[],
    generation: number,
    monotonicMs: number,
    reason: string,
    target?: StateTarget,
  ): StateSnapshot {
    const definition = STATE_DEFINITIONS[state];
    let direction: Direction = this.snapshotValue.direction;
    if (target?.kind === 'walk') direction = target.direction;
    if (state === 'stable.idle_front') direction = 'front';
    let prop: PropState = this.snapshotValue.prop;
    if (state === 'transition.activity_entry' && target?.kind === 'activity') {
      prop = target.propId ? { kind: 'appearing', propId: target.propId } : { kind: 'none' };
    } else if (state.startsWith('activity.') && this.snapshotValue.prop.kind === 'appearing') {
      prop = { kind: 'held', propId: this.snapshotValue.prop.propId };
    } else if (state === 'transition.activity_exit' && prop.kind !== 'none') {
      prop = { kind: 'disappearing', propId: prop.propId };
    } else if (definition.propPolicy === 'none') {
      prop = { kind: 'none' };
    }
    return {
      character: this.snapshotValue.character,
      state,
      generation,
      enteredAtMonotonicMs: monotonicMs,
      direction,
      prop,
      route,
      routeReason: reason,
    };
  }


  private drainPlannedStableWaypoints(monotonicMs: number): void {
    // Stable waypoints inside an already accepted route are posture checkpoints, not
    // new behavior-planning opportunities. Advance synchronously to the next
    // choreography state without a timer, while preserving the same generation.
    while (STATE_DEFINITIONS[this.snapshotValue.state].stable && this.snapshotValue.route.length > 0) {
      const [next, ...remaining] = this.snapshotValue.route;
      this.snapshotValue = this.enter(
        next!,
        remaining,
        this.snapshotValue.generation,
        monotonicMs,
        this.snapshotValue.routeReason ?? 'planned-route',
      );
    }
  }

  private record(entry: TransitionLogEntry): void {
    this.transitionLog.push(entry);
    if (this.transitionLog.length > 250) this.transitionLog.shift();
    this.logger?.(entry);
  }
}
