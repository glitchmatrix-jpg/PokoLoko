import type { ActivityId, CharacterId } from './types.js';

export type CharacterBehaviorProfile = Readonly<{
  character: CharacterId;
  baseline: Readonly<Record<'energy'|'playfulness'|'focus'|'sociability'|'curiosity'|'comfort'|'boredom'|'recentAttention', number>>;
  intentionWeights: Readonly<Record<'idle'|'walk'|'sleep'|'social', number>>;
  activityWeights: Readonly<Record<ActivityId, number>>;
  durationScale: number;
  movementNovelty: number;
  interactionSaturation: number;
}>;

export const CHARACTER_PROFILES: Readonly<Record<CharacterId, CharacterBehaviorProfile>> = {
  poko: {
    character: 'poko',
    baseline: { energy:.78, playfulness:.78, focus:.36, sociability:.76, curiosity:.82, comfort:.62, boredom:.22, recentAttention:0 },
    intentionWeights: { idle:.86, walk:1.35, sleep:.82, social:1.28 },
    activityWeights: { drink:.8, eat:.92, laptop:.78, music:1.35, peeking:1.32, playing_ball:1.5, reading:.48 },
    durationScale: .88,
    movementNovelty: 1.3,
    interactionSaturation: .78,
  },
  loko: {
    character: 'loko',
    baseline: { energy:.69, playfulness:.39, focus:.79, sociability:.54, curiosity:.58, comfort:.8, boredom:.17, recentAttention:0 },
    intentionWeights: { idle:1.18, walk:.82, sleep:1.08, social:.78 },
    activityWeights: { drink:.9, eat:.84, laptop:1.48, music:.9, peeking:.66, playing_ball:.48, reading:1.55 },
    durationScale: 1.22,
    movementNovelty: .72,
    interactionSaturation: 1.32,
  }
};
