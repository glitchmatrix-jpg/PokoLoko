export type Direction = 'left' | 'right';

export type DirectionPhase =
  | 'idle'
  | 'walking'
  | 'waiting_gait_boundary'
  | 'neutral_hold'
  | 'preparing';

export type DirectionTurnProfile = Readonly<{
  neutralHoldMs: number;
  hasPreparation: boolean;
}>;

export type DirectionTurnSnapshot = Readonly<{
  phase: DirectionPhase;
  direction: Direction;
  pendingDirection?: Direction;
  pendingDestinationX?: number;
  deadlineMs?: number;
  generation: number;
}>;

export type DirectionTurnAction =
  | Readonly<{ type: 'RETARGET_TRANSLATION'; direction: Direction; destinationX: number; generation: number }>
  | Readonly<{ type: 'WAIT_FOR_GAIT_BOUNDARY'; direction: Direction; destinationX: number; generation: number }>
  | Readonly<{ type: 'STOP_TRANSLATION'; reason: 'direction-change'; generation: number }>
  | Readonly<{ type: 'PLAY_NEUTRAL_HOLD'; untilMs: number; generation: number }>
  | Readonly<{ type: 'COMMIT_DIRECTION'; direction: Direction; generation: number }>
  | Readonly<{ type: 'PLAY_PREPARATION'; direction: Direction; generation: number }>
  | Readonly<{ type: 'START_TRANSLATION'; direction: Direction; destinationX: number; generation: number }>;

export type DirectionTurnResult = Readonly<{
  snapshot: DirectionTurnSnapshot;
  actions: readonly DirectionTurnAction[];
}>;
