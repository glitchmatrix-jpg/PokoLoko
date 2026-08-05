import type {
  Direction,
  DirectionTurnAction,
  DirectionTurnProfile,
  DirectionTurnResult,
  DirectionTurnSnapshot,
} from './types.js';

function finite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

export class DirectionTurnController {
  private state: DirectionTurnSnapshot;
  private profile: DirectionTurnProfile;

  public constructor(initialDirection: Direction, profile: DirectionTurnProfile) {
    if (!Number.isFinite(profile.neutralHoldMs) || profile.neutralHoldMs < 0) {
      throw new Error('neutralHoldMs must be a finite non-negative number.');
    }
    this.profile = profile;
    this.state = { phase: 'idle', direction: initialDirection, generation: 0 };
  }

  public configure(profile: DirectionTurnProfile): void {
    if (!Number.isFinite(profile.neutralHoldMs) || profile.neutralHoldMs < 0) {
      throw new Error('neutralHoldMs must be a finite non-negative number.');
    }
    this.profile = profile;
  }

  public requestMove(
    targetDirection: Direction,
    destinationX: number,
    isTranslating: boolean,
    monotonicMs: number,
  ): DirectionTurnResult {
    finite(destinationX, 'destinationX');
    finite(monotonicMs, 'monotonicMs');
    const generation = this.state.generation + 1;

    if (isTranslating && targetDirection === this.state.direction) {
      this.state = { phase: 'walking', direction: this.state.direction, generation };
      return this.result([{ type: 'RETARGET_TRANSLATION', direction: targetDirection, destinationX, generation }]);
    }

    if (isTranslating && targetDirection !== this.state.direction) {
      this.state = {
        phase: 'waiting_gait_boundary',
        direction: this.state.direction,
        pendingDirection: targetDirection,
        pendingDestinationX: destinationX,
        generation,
      };
      return this.result([{ type: 'WAIT_FOR_GAIT_BOUNDARY', direction: targetDirection, destinationX, generation }]);
    }

    this.state = {
      phase: targetDirection === this.state.direction && this.profile.hasPreparation ? 'preparing' :
        targetDirection === this.state.direction ? 'walking' : 'neutral_hold',
      direction: this.state.direction,
      pendingDirection: targetDirection,
      pendingDestinationX: destinationX,
      ...(targetDirection !== this.state.direction ? { deadlineMs: monotonicMs + this.profile.neutralHoldMs } : {}),
      generation,
    };

    if (targetDirection !== this.state.direction) {
      return this.result([{ type: 'PLAY_NEUTRAL_HOLD', untilMs: this.state.deadlineMs!, generation }]);
    }
    if (this.profile.hasPreparation) {
      return this.result([{ type: 'PLAY_PREPARATION', direction: targetDirection, generation }]);
    }
    return this.result([{ type: 'START_TRANSLATION', direction: targetDirection, destinationX, generation }]);
  }

  public onGaitBoundary(monotonicMs: number): DirectionTurnResult {
    finite(monotonicMs, 'monotonicMs');
    if (this.state.phase !== 'waiting_gait_boundary') return this.result([]);
    const deadlineMs = monotonicMs + this.profile.neutralHoldMs;
    this.state = { ...this.state, phase: 'neutral_hold', deadlineMs };
    return this.result([
      { type: 'STOP_TRANSLATION', reason: 'direction-change', generation: this.state.generation },
      { type: 'PLAY_NEUTRAL_HOLD', untilMs: deadlineMs, generation: this.state.generation },
    ]);
  }

  public onTranslationEnded(monotonicMs: number): DirectionTurnResult {
    finite(monotonicMs, 'monotonicMs');
    if (this.state.phase !== 'waiting_gait_boundary') {
      this.state = { phase: 'idle', direction: this.state.direction, generation: this.state.generation };
      return this.result([]);
    }
    const deadlineMs = monotonicMs + this.profile.neutralHoldMs;
    this.state = { ...this.state, phase: 'neutral_hold', deadlineMs };
    return this.result([{ type: 'PLAY_NEUTRAL_HOLD', untilMs: deadlineMs, generation: this.state.generation }]);
  }

  public tick(monotonicMs: number): DirectionTurnResult {
    finite(monotonicMs, 'monotonicMs');
    if (this.state.phase !== 'neutral_hold' || this.state.deadlineMs === undefined || monotonicMs < this.state.deadlineMs) {
      return this.result([]);
    }
    const direction = this.state.pendingDirection;
    const destinationX = this.state.pendingDestinationX;
    if (!direction || destinationX === undefined) return this.interrupt();
    const { deadlineMs: _deadlineMs, ...withoutDeadline } = this.state;
    this.state = {
      ...withoutDeadline,
      phase: this.profile.hasPreparation ? 'preparing' : 'walking',
      direction,
    };
    const actions: DirectionTurnAction[] = [
      { type: 'COMMIT_DIRECTION', direction, generation: this.state.generation },
    ];
    if (this.profile.hasPreparation) {
      actions.push({ type: 'PLAY_PREPARATION', direction, generation: this.state.generation });
    } else {
      actions.push({ type: 'START_TRANSLATION', direction, destinationX, generation: this.state.generation });
    }
    return this.result(actions);
  }

  public onPreparationCompleted(): DirectionTurnResult {
    if (this.state.phase !== 'preparing') return this.result([]);
    const direction = this.state.pendingDirection ?? this.state.direction;
    const destinationX = this.state.pendingDestinationX;
    if (destinationX === undefined) return this.interrupt();
    this.state = { phase: 'walking', direction, generation: this.state.generation };
    return this.result([{ type: 'START_TRANSLATION', direction, destinationX, generation: this.state.generation }]);
  }

  public markWalking(direction: Direction): DirectionTurnSnapshot {
    this.state = { phase: 'walking', direction, generation: this.state.generation };
    return this.state;
  }

  public markIdle(): DirectionTurnSnapshot {
    this.state = { phase: 'idle', direction: this.state.direction, generation: this.state.generation };
    return this.state;
  }

  public interrupt(): DirectionTurnResult {
    this.state = { phase: 'idle', direction: this.state.direction, generation: this.state.generation + 1 };
    return this.result([]);
  }

  public snapshot(): DirectionTurnSnapshot {
    return this.state;
  }

  private result(actions: readonly DirectionTurnAction[]): DirectionTurnResult {
    return { snapshot: this.state, actions };
  }
}
