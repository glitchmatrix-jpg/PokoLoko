export type CharacterId = 'poko' | 'loko';
export type ReactionTrigger =
  | 'single_click'
  | 'affectionate_repeat_click'
  | 'excessive_poking'
  | 'wake_interaction'
  | 'drag_release'
  | 'long_idle'
  | 'activity_success'
  | 'surprise'
  | 'contextual_sadness';
export type ReactionId =
  | 'poko_notice'
  | 'poko_warm'
  | 'poko_overstimulated'
  | 'poko_proud'
  | 'poko_contextual_cry'
  | 'loko_notice'
  | 'loko_warm'
  | 'loko_overstimulated'
  | 'loko_content';
export type PostureTag =
  | 'standing_front'
  | 'standing_side'
  | 'sitting'
  | 'lying_sleep'
  | 'activity_prop'
  | 'transition_locked';
export type ReactionInterruption = 'immediate' | 'soft' | 'deferred' | 'locked';

export type ReactionDefinition = Readonly<{
  id: ReactionId;
  character: CharacterId;
  triggers: readonly ReactionTrigger[];
  animationId: string;
  legalPostures: readonly PostureTag[];
  returnState: 'stable.idle_front' | 'stable.idle_side' | 'stable.sitting';
  durationMs: readonly [number, number];
  cooldownMs: number;
  attentionEffect: number;
  interruption: ReactionInterruption;
  emotionalMeaning: string;
  rare?: boolean;
  requiresContextReason?: boolean;
}>;

export type SocialState = Readonly<{
  character: CharacterId;
  posture: PostureTag;
  stateId: string;
  stateInterruption: ReactionInterruption;
  sleeping: boolean;
  activeActivity?: { id: string; propVisible: boolean; safeMarker?: boolean };
}>;

export type SocialInput = Readonly<{
  type: 'click' | 'double_click' | 'drag_release' | 'long_idle' | 'activity_success' | 'surprise' | 'contextual_sadness';
  nowMs: number;
  pointerId?: number;
  contextReason?: string;
}>;

export type AttentionMemory = Readonly<{
  clickTimesMs: readonly number[];
  lastReactionAtMs?: number;
  lastReactionId?: ReactionId;
  recentAttention: number;
  saturation: number;
  cooldowns: Readonly<Record<string, number>>;
}>;

export type ReactionCommand =
  | Readonly<{ type: 'PLAY_REACTION'; reactionId: ReactionId; animationId: string; generation: number; returnState: ReactionDefinition['returnState']; durationMs: number }>
  | Readonly<{ type: 'REQUEST_WAKE'; reason: string; generation: number }>
  | Readonly<{ type: 'DEFER_REACTION'; trigger: ReactionTrigger; reason: string; generation: number }>
  | Readonly<{ type: 'REQUEST_ACTIVITY_SAFE_EXIT'; reason: string; generation: number }>
  | Readonly<{ type: 'REACTION_IGNORED'; reason: string; generation: number }>
  | Readonly<{ type: 'DIAGNOSTIC'; message: string; generation: number }>;

export type ReactionResult = Readonly<{
  memory: AttentionMemory;
  commands: readonly ReactionCommand[];
  selectedReaction?: ReactionDefinition;
}>;

export interface ReactionRandomSource {
  nextFloat(): number;
  nextInt(maxExclusive: number): number;
}
