export type CharacterId = 'poko' | 'loko';
export type SleepPhase =
  | 'awake'
  | 'entry'
  | 'sleeping'
  | 'wake_hold'
  | 'waking'
  | 'recovery'
  | 'paused'
  | 'suspended';
export type TimeBand = 'morning' | 'day' | 'evening' | 'late_night';
export type WakeTrigger =
  | 'planner'
  | 'user_click'
  | 'drag'
  | 'character_switch'
  | 'system_resume'
  | 'settings_change'
  | 'shutdown';
export type SleepTrigger = 'planner' | 'quiet_hours' | 'system_idle';

export type SleepSnapshot = Readonly<{
  character: CharacterId;
  phase: SleepPhase;
  generation: number;
  enteredAtMonotonicMs: number;
  sleepingSinceMonotonicMs?: number;
  plannedWakeAtMonotonicMs?: number;
  activeAnimationId?: string;
  wakeTrigger?: WakeTrigger;
  suspendedFrom?: Exclude<SleepPhase, 'suspended'>;
  recoveryTarget: 'stable.idle_front' | 'transition.recovering';
}>;

export type SleepContext = Readonly<{
  energy: number;
  wakeDurationMs: number;
  timeBand: TimeBand;
  systemIdle: boolean;
  quietMode: boolean;
  screenLocked: boolean;
  recentHighInteraction: boolean;
}>;

export type SleepSettings = Readonly<{
  dailyRhythmEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}>;

export type SleepProfile = Readonly<{
  character: CharacterId;
  entryAnimationId: string;
  primaryLoopAnimationId: string;
  variationLoopAnimationIds: readonly string[];
  wakeStrategy: 'reverse_entry_then_hold' | 'lying_hold_then_neutral';
  wakeHoldMs: number;
  minSleepMs: number;
  maxSleepMs: number;
  minWakeProtectionMs: number;
  energySleepThreshold: number;
  lateNightBias: number;
  idleBias: number;
}>;

export type SleepCommand =
  | Readonly<{ kind: 'play_animation'; animationId: string; generation: number; playback?: 'forward' | 'reverse'; loop: boolean }>
  | Readonly<{ kind: 'hold_frame'; animationId: string; frame: 'first' | 'last'; durationMs: number; generation: number }>
  | Readonly<{ kind: 'request_state'; target: 'sleep' | 'wake' | 'idle' | 'drag' | 'shutdown'; reason: string; generation: number }>
  | Readonly<{ kind: 'disable_locomotion'; generation: number }>
  | Readonly<{ kind: 'enable_locomotion'; generation: number }>
  | Readonly<{ kind: 'sleep_started'; generation: number }>
  | Readonly<{ kind: 'sleep_finished'; sleptMs: number; trigger: WakeTrigger; generation: number }>;

export type SleepEvent =
  | Readonly<{ type: 'REQUEST_SLEEP'; trigger: SleepTrigger; monotonicMs: number; plannedDurationMs: number }>
  | Readonly<{ type: 'REQUEST_WAKE'; trigger: WakeTrigger; monotonicMs: number }>
  | Readonly<{ type: 'ANIMATION_COMPLETED'; animationId: string; generation: number; monotonicMs: number }>
  | Readonly<{ type: 'HOLD_COMPLETED'; generation: number; monotonicMs: number }>
  | Readonly<{ type: 'SLEEP_DEADLINE_REACHED'; generation: number; monotonicMs: number }>
  | Readonly<{ type: 'DRAG_STARTED'; monotonicMs: number }>
  | Readonly<{ type: 'PAUSE'; monotonicMs: number }>
  | Readonly<{ type: 'RESUME'; monotonicMs: number }>
  | Readonly<{ type: 'SUSPEND'; monotonicMs: number }>
  | Readonly<{ type: 'SYSTEM_RESUMED'; monotonicMs: number }>
  | Readonly<{ type: 'CHARACTER_CHANGED'; character: CharacterId; monotonicMs: number }>
  | Readonly<{ type: 'SHUTDOWN'; monotonicMs: number }>;

export type SleepResult = Readonly<{
  snapshot: SleepSnapshot;
  commands: readonly SleepCommand[];
  ignoredReason?: string;
}>;
