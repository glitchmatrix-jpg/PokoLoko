import type { PlaybackMode } from './types';

export function buildPlaybackOrder(frameCount: number, mode: PlaybackMode): number[] {
  if (frameCount <= 0) return [];
  const forward = Array.from({ length: frameCount }, (_, index) => index);
  if (mode === 'reverse') return [...forward].reverse();
  if (mode === 'ping_pong' && frameCount > 2) return [...forward, ...forward.slice(1, -1).reverse()];
  return forward;
}

export function frameAtElapsed(
  elapsedMs: number,
  frameCount: number,
  fps: number,
  mode: PlaybackMode,
  loop: boolean,
): { frameIndex: number; sequenceIndex: number; completed: boolean } {
  const order = buildPlaybackOrder(frameCount, mode);
  if (!order.length) return { frameIndex: 0, sequenceIndex: 0, completed: true };
  const frameDuration = 1000 / Math.max(0.1, fps);
  const raw = Math.floor(Math.max(0, elapsedMs) / frameDuration);
  if (loop) {
    const sequenceIndex = raw % order.length;
    return { frameIndex: order[sequenceIndex] ?? 0, sequenceIndex, completed: false };
  }
  const position = Math.min(raw, order.length - 1);
  return { frameIndex: order[position] ?? 0, sequenceIndex: position, completed: raw >= order.length };
}
