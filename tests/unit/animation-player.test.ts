import { describe, expect, it } from 'vitest';
import { buildPlaybackOrder, frameAtElapsed } from '../../src/diagnostics/animation-lab/player';

describe('animation laboratory player', () => {
  it('builds deterministic ping-pong order without duplicate endpoints', () => expect(buildPlaybackOrder(4, 'ping_pong')).toEqual([0,1,2,3,2,1]));
  it('clamps a one-shot at its final frame', () => expect(frameAtElapsed(5000, 3, 6, 'forward', false)).toEqual({ frameIndex: 2, sequenceIndex: 2, completed: true }));
  it('loops independently of renderer refresh rate', () => expect(frameAtElapsed(1000, 4, 4, 'forward', true).frameIndex).toBe(0));
});
