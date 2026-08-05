export type CharacterId = 'poko' | 'loko';
export type Direction = 'left' | 'right' | 'front';
export type InterruptionLevel = 'immediate' | 'soft' | 'deferred' | 'locked';

export const ACTIVITY_IDS = [
  'drink', 'eat', 'laptop', 'music', 'peeking', 'playing_ball', 'reading'
] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export type StableStateId =
  | 'stable.idle_front'
  | 'stable.idle_side'
  | 'stable.sitting'
  | 'stable.sleeping';
export type TransitionalStateId =
  | 'transition.neutral_bridge'
  | 'transition.walk_start'
  | 'transition.walk_stop'
  | 'transition.turning'
  | 'transition.sleep_entry'
  | 'transition.waking'
  | 'transition.activity_entry'
  | 'transition.activity_exit'
  | 'transition.recovering';
export type MovementStateId = 'movement.walking';
export type InteractionStateId = 'interaction.dragged' | 'interaction.social_reaction';
export type SystemStateId =
  | 'system.booting'
  | 'system.paused'
  | 'system.suspended'
  | 'system.recovering'
  | 'system.shutting_down';
export type ActivityStateId = `activity.${ActivityId}`;
export type StateId = StableStateId | TransitionalStateId | MovementStateId | InteractionStateId | SystemStateId | ActivityStateId;

export type PropState = Readonly<{
  kind: 'none' | 'appearing' | 'held' | 'disappearing';
  propId?: string;
}>;

export type StateFamily = 'stable' | 'transition' | 'movement' | 'activity' | 'interaction' | 'system';

export type StateDefinition = Readonly<{
  id: StateId;
  family: StateFamily;
  posture: string;
  stable: boolean;
  interruption: InterruptionLevel;
  completionEvent?: 'ANIMATION_COMPLETED' | 'DESTINATION_REACHED' | 'DRAG_ENDED' | 'RECOVERY_COMPLETED';
  propPolicy: 'none' | 'allowed' | 'required';
}>;

export type StateSnapshot = Readonly<{
  character: CharacterId;
  state: StateId;
  generation: number;
  enteredAtMonotonicMs: number;
  direction: Direction;
  prop: PropState;
  route: readonly StateId[];
  routeReason?: string;
}>;

export type StateTarget =
  | Readonly<{ kind: 'idle'; orientation?: 'front' | 'side' }>
  | Readonly<{ kind: 'walk'; direction: Exclude<Direction, 'front'> }>
  | Readonly<{ kind: 'sleep' }>
  | Readonly<{ kind: 'wake' }>
  | Readonly<{ kind: 'activity'; activityId: ActivityId; propId?: string }>
  | Readonly<{ kind: 'social_reaction' }>
  | Readonly<{ kind: 'drag' }>
  | Readonly<{ kind: 'pause' }>
  | Readonly<{ kind: 'resume' }>
  | Readonly<{ kind: 'suspend' }>
  | Readonly<{ kind: 'shutdown' }>;

export type TransitionRequest = Readonly<{
  requestId: string;
  target: StateTarget;
  reason: string;
  monotonicMs: number;
}>;

export type CompletionEvent = Readonly<{
  type: 'ANIMATION_COMPLETED' | 'DESTINATION_REACHED' | 'DRAG_ENDED' | 'RECOVERY_COMPLETED';
  generation: number;
  monotonicMs: number;
}>;

export type TransitionLogEntry = Readonly<{
  requestId: string;
  reason: string;
  source: StateId;
  requestedTarget: StateTarget['kind'];
  accepted: boolean;
  route: readonly StateId[];
  fallback?: string;
  generationBefore: number;
  generationAfter: number;
}>;

export type MachineResult = Readonly<{
  snapshot: StateSnapshot;
  log: TransitionLogEntry;
}>;
