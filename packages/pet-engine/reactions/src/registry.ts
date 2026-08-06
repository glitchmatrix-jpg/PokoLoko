import type { CharacterId, ReactionDefinition, ReactionId, ReactionTrigger } from './types.js';

export const REACTION_REGISTRY: readonly ReactionDefinition[] = [
  {
    id: 'poko_notice', character: 'poko', triggers: ['single_click', 'long_idle', 'surprise'],
    animationId: 'poko_idle_blink', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [450, 800], cooldownMs: 6500, attentionEffect: 0.12, interruption: 'soft',
    emotionalMeaning: 'Quick curious acknowledgement.'
  },
  {
    id: 'poko_warm', character: 'poko', triggers: ['affectionate_repeat_click', 'drag_release', 'activity_success'],
    animationId: 'poko_idle_blink', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [900, 1450], cooldownMs: 9000, attentionEffect: 0.22, interruption: 'soft',
    emotionalMeaning: 'Open, affectionate response without demanding more attention.'
  },
  {
    id: 'poko_overstimulated', character: 'poko', triggers: ['excessive_poking'],
    animationId: 'poko_idle_blink', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [400, 700], cooldownMs: 16000, attentionEffect: -0.08, interruption: 'soft',
    emotionalMeaning: 'Brief overstimulation; input is then ignored during recovery.'
  },
  {
    id: 'poko_proud', character: 'poko', triggers: ['activity_success'],
    animationId: 'poko_idle_blink', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [700, 1100], cooldownMs: 18000, attentionEffect: 0.08, interruption: 'soft',
    emotionalMeaning: 'Small satisfied beat after a completed activity.'
  },
  {
    id: 'poko_contextual_cry', character: 'poko', triggers: ['contextual_sadness'],
    animationId: 'poko_sad_to_crying', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [2200, 3200], cooldownMs: 180000, attentionEffect: -0.12, interruption: 'deferred',
    emotionalMeaning: 'Rare contextual sadness; never random, never caused by user absence.', rare: true, requiresContextReason: true
  },
  {
    id: 'loko_notice', character: 'loko', triggers: ['single_click', 'long_idle', 'surprise'],
    animationId: 'loko_idle_front', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [950, 1450], cooldownMs: 6000, attentionEffect: 0.08, interruption: 'soft',
    emotionalMeaning: 'Quiet acknowledgement with restrained timing.'
  },
  {
    id: 'loko_warm', character: 'loko', triggers: ['affectionate_repeat_click', 'drag_release', 'activity_success'],
    animationId: 'loko_love_reaction', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [1600, 2400], cooldownMs: 18000, attentionEffect: 0.18, interruption: 'deferred',
    emotionalMeaning: 'Rare, deliberate affection.', rare: true
  },
  {
    id: 'loko_overstimulated', character: 'loko', triggers: ['excessive_poking'],
    animationId: 'loko_idle_front', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [1200, 1900], cooldownMs: 24000, attentionEffect: -0.12, interruption: 'soft',
    emotionalMeaning: 'Subtle withdrawal; further poke input is collapsed.'
  },
  {
    id: 'loko_content', character: 'loko', triggers: ['activity_success', 'long_idle'],
    animationId: 'loko_idle_front', legalPostures: ['standing_front'], returnState: 'stable.idle_front',
    durationMs: [1100, 1900], cooldownMs: 15000, attentionEffect: 0.05, interruption: 'soft',
    emotionalMeaning: 'Calm contentment after focused activity.'
  }
] as const;

export const getReaction = (id: ReactionId): ReactionDefinition | undefined => REACTION_REGISTRY.find((item) => item.id === id);
export const reactionsFor = (character: CharacterId, trigger: ReactionTrigger): readonly ReactionDefinition[] =>
  REACTION_REGISTRY.filter((item) => item.character === character && item.triggers.includes(trigger));
