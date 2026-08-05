import { describe, expect, it } from 'vitest';
import { SocialInteractionController, createAttentionMemory } from '../../packages/pet-engine/reactions/src/index.js';
import type { ReactionRandomSource, SocialState } from '../../packages/pet-engine/reactions/src/index.js';

class FixedRandom implements ReactionRandomSource {
  constructor(private readonly values: number[] = [0.1, 0.2, 0.3]) {}
  nextFloat(): number { return this.values.shift() ?? 0.1; }
  nextInt(maxExclusive: number): number { return Math.min(maxExclusive - 1, Math.floor(this.nextFloat() * maxExclusive)); }
}

const state = (overrides: Partial<SocialState> = {}): SocialState => ({
  character: 'poko', posture: 'standing_front', stateId: 'stable.idle_front', stateInterruption: 'soft', sleeping: false, ...overrides
});

describe('SocialInteractionController', () => {
  it('selects deterministic Poko click acknowledgement', () => {
    const controller = new SocialInteractionController(new FixedRandom());
    const result = controller.handle(state(), { type: 'click', nowMs: 1000 });
    expect(result.selectedReaction?.id).toBe('poko_notice');
    expect(result.commands[0]?.type).toBe('PLAY_REACTION');
  });

  it('routes sleeping input to wake instead of upright reaction', () => {
    const controller = new SocialInteractionController(new FixedRandom());
    const result = controller.handle(state({ posture: 'lying_sleep', sleeping: true }), { type: 'click', nowMs: 1000 });
    expect(result.commands[0]?.type).toBe('REQUEST_WAKE');
    expect(result.selectedReaction).toBeUndefined();
  });

  it('defers reactions during locked transitions', () => {
    const controller = new SocialInteractionController(new FixedRandom());
    const result = controller.handle(state({ posture: 'transition_locked', stateInterruption: 'locked' }), { type: 'click', nowMs: 1000 });
    expect(result.commands[0]?.type).toBe('DEFER_REACTION');
  });

  it('requests a prop-safe exit during activities', () => {
    const controller = new SocialInteractionController(new FixedRandom());
    const result = controller.handle(state({ posture: 'activity_prop', activeActivity: { id: 'laptop', propVisible: true } }), { type: 'click', nowMs: 1000 });
    expect(result.commands.map((command) => command.type)).toEqual(['REQUEST_ACTIVITY_SAFE_EXIT', 'DEFER_REACTION']);
  });

  it('requires an explicit reason before contextual crying', () => {
    const controller = new SocialInteractionController(new FixedRandom());
    const withoutReason = controller.handle(state(), { type: 'contextual_sadness', nowMs: 1000 });
    expect(withoutReason.selectedReaction).toBeUndefined();
    const withReason = controller.handle(state(), { type: 'contextual_sadness', nowMs: 2000, contextReason: 'rare failed activity recovery' });
    expect(withReason.selectedReaction?.id).toBe('poko_contextual_cry');
  });

  it('collapses spam through escalation and cooldowns', () => {
    const controller = new SocialInteractionController(new FixedRandom(Array(30).fill(0.1)), createAttentionMemory());
    const outputs = [0, 100, 200, 300, 400, 500, 600].map((offset) => controller.handle(state(), { type: 'click', nowMs: 1000 + offset }));
    const played = outputs.flatMap((result) => result.commands).filter((command) => command.type === 'PLAY_REACTION');
    expect(played.length).toBeLessThanOrEqual(3);
    expect(outputs.at(-1)?.memory.saturation).toBeGreaterThan(0);
  });
});
