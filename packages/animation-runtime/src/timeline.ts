import type { PlaybackMode } from './types';

export function buildPlaybackOrder(frameCount: number, mode: PlaybackMode): number[] {
  if (!Number.isInteger(frameCount) || frameCount <= 0) return [];
  const forward = Array.from({ length: frameCount }, (_, index) => index);
  if (mode === 'reverse') return forward.reverse();
  if (mode === 'ping_pong' && frameCount > 2) {
    return [...forward, ...forward.slice(1, -1).reverse()];
  }
  return forward;
}

export function frameDurationMs(fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error(`Animation FPS must be positive; received ${fps}.`);
  return 1000 / fps;
}

export type TimelineSample = Readonly<{
  frameIndex: number;
  sequenceIndex: number;
  completed: boolean;
  loopCount: number;
  loopBoundary: boolean;
}>;

export function sampleTimeline(
  elapsedMs: number,
  frameCount: number,
  fps: number,
  mode: PlaybackMode,
  loop: boolean,
): TimelineSample {
  const order = buildPlaybackOrder(frameCount, mode);
  if (order.length === 0) {
    return { frameIndex: 0, sequenceIndex: 0, completed: true, loopCount: 0, loopBoundary: false };
  }

  const duration = frameDurationMs(fps);
  const rawStep = Math.floor(Math.max(0, elapsedMs) / duration);

  if (loop) {
    const sequenceIndex = rawStep % order.length;
    const loopCount = Math.floor(rawStep / order.length);
    return {
      frameIndex: order[sequenceIndex] ?? order[0] ?? 0,
      sequenceIndex,
      completed: false,
      loopCount,
      loopBoundary: rawStep > 0 && sequenceIndex === 0,
    };
  }

  const sequenceIndex = Math.min(rawStep, order.length - 1);
  return {
    frameIndex: order[sequenceIndex] ?? order[order.length - 1] ?? 0,
    sequenceIndex,
    completed: rawStep >= order.length,
    loopCount: 0,
    loopBoundary: false,
  };
}
