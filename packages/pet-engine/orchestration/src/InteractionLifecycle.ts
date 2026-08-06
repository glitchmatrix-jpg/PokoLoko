export type InteractionLifecycleState =
  | 'idle'
  | 'pressed'
  | 'dragging'
  | 'carried'
  | 'landing'
  | 'reacting'
  | 'walking'
  | 'performing_activity'
  | 'sleeping'
  | 'waking'
  | 'paused';

const ALLOWED: Readonly<Record<InteractionLifecycleState, readonly InteractionLifecycleState[]>> = {
  idle: ['pressed', 'reacting', 'walking', 'performing_activity', 'sleeping', 'paused'],
  pressed: ['idle', 'dragging', 'reacting', 'walking', 'performing_activity', 'sleeping', 'waking', 'paused'],
  dragging: ['carried', 'landing', 'idle', 'paused'],
  carried: ['landing', 'idle', 'paused'],
  landing: ['idle', 'reacting', 'paused'],
  reacting: ['idle', 'pressed', 'paused'],
  walking: ['idle', 'pressed', 'paused'],
  performing_activity: ['idle', 'pressed', 'paused'],
  sleeping: ['pressed', 'waking', 'paused'],
  waking: ['idle', 'pressed', 'paused'],
  paused: ['idle'],
};

export type InteractionLifecycleSnapshot = Readonly<{
  state: InteractionLifecycleState;
  previousState?: InteractionLifecycleState;
  stateBeforePress?: InteractionLifecycleState;
  generation: number;
  reason: string;
}>;

export class InteractionLifecycle {
  private value: InteractionLifecycleSnapshot = {
    state: 'idle',
    generation: 0,
    reason: 'initialized',
  };

  public snapshot(): InteractionLifecycleSnapshot {
    return this.value;
  }

  public canTransition(next: InteractionLifecycleState): boolean {
    return next === this.value.state || ALLOWED[this.value.state].includes(next);
  }

  public transition(next: InteractionLifecycleState, reason: string): InteractionLifecycleSnapshot {
    const current = this.value;
    if (next === current.state) return current;
    if (!this.canTransition(next)) {
      throw new Error(`Illegal interaction lifecycle transition: ${current.state} -> ${next} (${reason})`);
    }
    this.value = {
      state: next,
      previousState: current.state,
      ...(next === 'pressed'
        ? { stateBeforePress: current.state }
        : current.stateBeforePress && ['dragging', 'carried', 'landing'].includes(next)
          ? { stateBeforePress: current.stateBeforePress }
          : {}),
      generation: current.generation + 1,
      reason,
    };
    return this.value;
  }

  public press(reason = 'pointer-down'): InteractionLifecycleSnapshot {
    if (this.value.state === 'pressed' || this.value.state === 'dragging' || this.value.state === 'carried') {
      return this.value;
    }
    return this.transition('pressed', reason);
  }

  public releaseWithoutDrag(reason = 'pointer-release'): InteractionLifecycleSnapshot {
    if (this.value.state !== 'pressed') return this.value;
    const restore = this.value.stateBeforePress ?? 'idle';
    return this.transition(restore, reason);
  }

  public force(next: InteractionLifecycleState, reason: string): InteractionLifecycleSnapshot {
    const current = this.value;
    this.value = {
      state: next,
      previousState: current.state,
      generation: current.generation + 1,
      reason,
    };
    return this.value;
  }
}
