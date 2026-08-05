export type CharacterId = 'poko' | 'loko';
export type ActivityId = 'drink' | 'eat' | 'laptop' | 'music' | 'peeking' | 'playing_ball' | 'reading';
export type ActivityPhase = 'entry' | 'setup' | 'loop' | 'variation' | 'exit' | 'recovery' | 'completed' | 'cancelled';
export type InterruptionLevel = 'immediate' | 'soft' | 'deferred' | 'locked';
export type ActivityStopReason = 'completed' | 'drag' | 'character_switch' | 'pause' | 'fullscreen_quiet' | 'display_loss' | 'shutdown' | 'asset_failure' | 'invalid_state';
export type PropOwnership = 'none' | 'composite_frame' | 'separate_layer';

export type ActivityStep =
  | Readonly<{ kind: 'transition'; targetState: string; note?: string }>
  | Readonly<{ kind: 'animation'; animationId: string; loops?: number; safeExitMarkers?: readonly string[] }>
  | Readonly<{ kind: 'hold'; durationMs: number; note: string }>
  | Readonly<{ kind: 'prop'; action: 'appear' | 'hold' | 'remove'; propId: string; marker?: string }>;

export type DurationPolicy =
  | Readonly<{ kind: 'one_shot' }>
  | Readonly<{ kind: 'loop_count'; min: number; max: number }>
  | Readonly<{ kind: 'time_range'; minMs: number; maxMs: number; exitAtSafeBoundary: true }>;

export type ActivityInterruptionPolicy = Readonly<{
  entry: InterruptionLevel;
  setup: InterruptionLevel;
  loop: InterruptionLevel;
  variation: InterruptionLevel;
  exit: InterruptionLevel;
  recovery: InterruptionLevel;
  immediateRecoveryState: string;
  deferredSafeMarkers: readonly string[];
}>;

export type PropLifecycle = Readonly<{
  propId?: string;
  ownership: PropOwnership;
  appearsDuring?: 'entry' | 'setup' | 'loop';
  appearsAtMarker?: string;
  disappearsDuring?: 'exit' | 'recovery';
  disappearsAtMarker?: string;
  interruptionRecovery: 'neutral_frame' | 'finish_phrase' | 'clear_separate_layer' | 'none';
}>;

export type ActivityDefinition = Readonly<{
  id: ActivityId;
  character: CharacterId;
  label: string;
  category: 'contextual' | 'spontaneous' | 'social' | 'ambient';
  triggerTags: readonly string[];
  legalEntryStates: readonly string[];
  legalEntryPostures: readonly string[];
  destination: Readonly<{ required: boolean; policy?: 'comfortable_region' | 'screen_edge' | 'stay_here' }>;
  entry: readonly ActivityStep[];
  setup: readonly ActivityStep[];
  loop: readonly ActivityStep[];
  variations: readonly Readonly<{ id: string; weight: number; steps: readonly ActivityStep[] }>[];
  duration: DurationPolicy;
  interruption: ActivityInterruptionPolicy;
  exit: readonly ActivityStep[];
  recovery: readonly ActivityStep[];
  cooldownMs: Readonly<{ min: number; max: number; categoryMin: number }>;
  moodEffects: Readonly<Partial<Record<'energy' | 'playfulness' | 'focus' | 'sociability' | 'curiosity' | 'comfort' | 'boredom', number>>>;
  prop: PropLifecycle;
  sourceAnimations: readonly string[];
  knownLimitations: readonly string[];
}>;

export type ActivitySession = Readonly<{
  sessionId: string;
  generation: number;
  character: CharacterId;
  activityId: ActivityId;
  phase: ActivityPhase;
  phaseIndex: number;
  startedAtMs: number;
  phaseStartedAtMs: number;
  plannedEndAtMs?: number;
  plannedLoopCount?: number;
  completedLoops: number;
  activeAnimationId?: string;
  activePropId?: string;
  propVisible: boolean;
  pendingInterruption?: Readonly<{ reason: ActivityStopReason; requestedAtMs: number }>;
  lastSafeMarker?: string;
  exitReason?: ActivityStopReason;
}>;

export type ActivityRequest = Readonly<{
  requestId: string;
  character: CharacterId;
  activityId: ActivityId;
  currentState: string;
  currentPosture: string;
  nowMs: number;
}>;

export type ActivityEvent =
  | Readonly<{ type: 'STATE_READY'; state: string; generation: number; nowMs: number }>
  | Readonly<{ type: 'ANIMATION_COMPLETED'; animationId: string; generation: number; nowMs: number }>
  | Readonly<{ type: 'ANIMATION_MARKER'; animationId: string; marker: string; generation: number; nowMs: number }>
  | Readonly<{ type: 'LOOP_BOUNDARY'; animationId: string; generation: number; nowMs: number }>
  | Readonly<{ type: 'DURATION_ELAPSED'; generation: number; nowMs: number }>
  | Readonly<{ type: 'INTERRUPT'; reason: ActivityStopReason; generation: number; nowMs: number }>
  | Readonly<{ type: 'ASSET_FAILED'; animationId: string; generation: number; nowMs: number }>;

export type ActivityCommand =
  | Readonly<{ type: 'REQUEST_STATE'; target: string; reason: string; generation: number }>
  | Readonly<{ type: 'PLAY_ANIMATION'; animationId: string; loops?: number; generation: number }>
  | Readonly<{ type: 'HOLD'; durationMs: number; note: string; generation: number }>
  | Readonly<{ type: 'SET_PROP'; action: 'appear' | 'hold' | 'remove'; propId: string; generation: number }>
  | Readonly<{ type: 'SCHEDULE_DEADLINE'; atMs: number; generation: number }>
  | Readonly<{ type: 'CANCEL_DEADLINE'; generation: number }>
  | Readonly<{ type: 'ACTIVITY_FINISHED'; activityId: ActivityId; interrupted: boolean; reason: ActivityStopReason; generation: number }>
  | Readonly<{ type: 'DIAGNOSTIC'; level: 'info' | 'warn' | 'error'; message: string; generation: number }>;

export type ActivityResult = Readonly<{ session: ActivitySession | null; commands: readonly ActivityCommand[] }>;

export interface ActivityRandomSource {
  nextFloat(): number;
  nextInt(maxExclusive: number): number;
}
