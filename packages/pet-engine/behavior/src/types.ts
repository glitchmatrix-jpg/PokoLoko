export type CharacterId = 'poko' | 'loko';
export type ActivityLevel = 'calm' | 'balanced' | 'lively';
export type Mood = 'content' | 'curious' | 'playful' | 'focused' | 'sleepy' | 'socially_warm' | 'saturated' | 'subdued';
export type StableDecisionState = 'stable.idle_front' | 'stable.idle_side' | 'stable.sitting' | 'stable.sleeping';
export type ScreenRegion = 'left' | 'center' | 'right';
export type ActivityId = 'drink' | 'eat' | 'laptop' | 'music' | 'peeking' | 'playing_ball' | 'reading';
export type AmbientPhraseId =
  | 'poko_quiet_breathe'
  | 'poko_notice_left'
  | 'poko_notice_right'
  | 'poko_ear_twitch'
  | 'poko_inspect_desktop'
  | 'loko_quiet_watch'
  | 'loko_attentive_pause';
export type IntentionKind = 'remain_idle' | 'ambient' | 'walk' | 'sleep' | 'wake' | 'activity' | 'social_reaction';

export type PetMind = Readonly<{
  energy: number;
  playfulness: number;
  focus: number;
  sociability: number;
  curiosity: number;
  comfort: number;
  boredom: number;
  recentAttention: number;
  mood: Mood;
  wakeDurationMs: number;
  interruptionLoad: number;
}>;

export type ContextSummary = Readonly<{
  typingActivity: 'none' | 'light' | 'sustained';
  pointerActivity: 'none' | 'light' | 'busy';
  systemIdle: boolean;
  audioActive: boolean;
  fullscreenActive: boolean;
  screenLocked: boolean;
  localTimeBand: 'morning' | 'day' | 'evening' | 'late_night';
  recentUserInteraction: 'none' | 'light' | 'high';
  enabled: boolean;
}>;

export type RecentMemoryId = ActivityId | IntentionKind | AmbientPhraseId;
export type RecentActivity = Readonly<{ id: RecentMemoryId; completedAtMs: number; interrupted: boolean }>;
export type SessionMemory = Readonly<{
  recentActivities: readonly RecentActivity[];
  recentTransitions: readonly string[];
  disturbances: readonly number[];
  recentRegions: readonly ScreenRegion[];
  lastWakeAtMs: number;
  lastSleepAtMs?: number;
  lastInteractionAtMs?: number;
}>;

export type PlannerSettings = Readonly<{
  activityLevel: ActivityLevel;
  quietMode: boolean;
  paused: boolean;
  contextualAwareness: boolean;
}>;

export type PlannerInput = Readonly<{
  character: CharacterId;
  state: StableDecisionState;
  currentRegion: ScreenRegion;
  mind: PetMind;
  context: ContextSummary;
  memory: SessionMemory;
  settings: PlannerSettings;
  nowMs: number;
  legalActivities: readonly ActivityId[];
  activityScoreMultipliers?: Readonly<Partial<Record<ActivityId, number>>>;
  activityDurationOverrides?: Readonly<Partial<Record<ActivityId, readonly [number, number]>>>;
}>;

export type AmbientStep = Readonly<{ animationId: string; durationMs: number; loop?: boolean }>;

export type PetIntention =
  | Readonly<{ kind: 'remain_idle'; durationMs: number }>
  | Readonly<{ kind: 'ambient'; phraseId: AmbientPhraseId; steps: readonly AmbientStep[]; durationMs: number }>
  | Readonly<{ kind: 'walk'; destinationRegion: ScreenRegion; durationMs: number }>
  | Readonly<{ kind: 'sleep'; durationMs: number }>
  | Readonly<{ kind: 'wake'; durationMs: number }>
  | Readonly<{ kind: 'activity'; activityId: ActivityId; durationMs: number }>
  | Readonly<{ kind: 'social_reaction'; reaction: 'warm' | 'subtle' | 'annoyed'; durationMs: number }>;

export type ScoreBreakdown = Readonly<{
  base: number;
  physical: number;
  context: number;
  personality: number;
  drives: number;
  repetition: number;
  cooldown: number;
  activityLevel: number;
  finalScore: number;
  reasons: readonly string[];
}>;

export type CandidateScore = Readonly<{
  key: string;
  intentionFactory: (rng: RandomSource) => PetIntention;
  breakdown: ScoreBreakdown;
}>;

export type PlannerDecision = Readonly<{
  intention: PetIntention | null;
  seedState: number;
  candidates: readonly Readonly<{ key: string; score: number; reasons: readonly string[] }>[];
  reason: string;
}>;

export interface RandomSource {
  nextFloat(): number;
  nextInt(maxExclusive: number): number;
  state(): number;
}

export type MindEvent =
  | Readonly<{ type: 'tick'; elapsedMs: number; context: ContextSummary; activeKind: IntentionKind }>
  | Readonly<{ type: 'activity_completed'; activityId: ActivityId; interrupted: boolean }>
  | Readonly<{ type: 'interaction'; intensity: 'light' | 'high' }>
  | Readonly<{ type: 'woke' }>
  | Readonly<{ type: 'slept'; elapsedMs: number }>
  | Readonly<{ type: 'dragged' }>;
