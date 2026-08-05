import { describe, expect, it } from 'vitest';
import { buildPlaybackOrder, frameDurationMs, sampleTimeline } from '../../packages/animation-runtime/src';

describe('animation timeline', () => {
  it('builds forward, reverse and ping-pong orders deterministically', () => {
    expect(buildPlaybackOrder(4, 'forward')).toEqual([0, 1, 2, 3]);
    expect(buildPlaybackOrder(4, 'reverse')).toEqual([3, 2, 1, 0]);
    expect(buildPlaybackOrder(4, 'ping_pong')).toEqual([0, 1, 2, 3, 2, 1]);
  });

  it('does not duplicate endpoints in ping-pong mode', () => {
    expect(buildPlaybackOrder(3, 'ping_pong')).toEqual([0, 1, 2, 1]);
    expect(buildPlaybackOrder(2, 'ping_pong')).toEqual([0, 1]);
    expect(buildPlaybackOrder(1, 'ping_pong')).toEqual([0]);
  });

  it('supports unusual FPS values', () => {
    expect(frameDurationMs(2.5)).toBe(400);
    expect(sampleTimeline(799, 4, 2.5, 'forward', false).frameIndex).toBe(1);
    expect(sampleTimeline(800, 4, 2.5, 'forward', false).frameIndex).toBe(2);
  });

  it('clamps a one-shot at its terminal frame', () => {
    expect(sampleTimeline(5_000, 3, 6, 'forward', false)).toMatchObject({ frameIndex: 2, completed: true });
    expect(sampleTimeline(5_000, 3, 6, 'reverse', false)).toMatchObject({ frameIndex: 0, completed: true });
  });

  it('reports loop boundaries', () => {
    expect(sampleTimeline(999, 4, 4, 'forward', true)).toMatchObject({ frameIndex: 3, loopCount: 0, loopBoundary: false });
    expect(sampleTimeline(1_000, 4, 4, 'forward', true)).toMatchObject({ frameIndex: 0, loopCount: 1, loopBoundary: true });
  });

  it('handles one-frame animations without instability', () => {
    expect(sampleTimeline(0, 1, 12, 'forward', true)).toMatchObject({ frameIndex: 0, completed: false });
    expect(sampleTimeline(10_000, 1, 12, 'forward', false)).toMatchObject({ frameIndex: 0, completed: true });
  });
});
