import { describe, expect, it } from 'vitest';
import { REACTION_REGISTRY, reactionsFor } from '../../packages/pet-engine/reactions/src/index.js';

describe('reaction registry', () => {
  it('uses only authoritative runtime animations', () => {
    const ids = new Set(REACTION_REGISTRY.map((item) => item.animationId));
    expect(ids).toEqual(new Set(['poko_idle_look_01', 'poko_idle_blink', 'poko_sad_to_crying', 'loko_idle_front', 'loko_love_reaction']));
  });

  it('keeps sadness contextual and rare', () => {
    const crying = REACTION_REGISTRY.find((item) => item.id === 'poko_contextual_cry');
    expect(crying?.rare).toBe(true);
    expect(crying?.requiresContextReason).toBe(true);
    expect(crying?.triggers).toEqual(['contextual_sadness']);
  });

  it('makes character responses visibly distinct', () => {
    expect(reactionsFor('poko', 'single_click')[0]?.animationId).toBe('poko_idle_look_01');
    expect(reactionsFor('loko', 'affectionate_repeat_click')[0]?.animationId).toBe('loko_love_reaction');
  });
});
