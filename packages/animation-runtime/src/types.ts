export type PlaybackMode = 'forward' | 'reverse' | 'ping_pong';

export type AnimationDefinition = Readonly<{
  id: string;
  frames: readonly string[];
  fps: number;
  playback: PlaybackMode;
  loop: boolean;
}>;

export type AnimationClockSnapshot = Readonly<{
  animationId: string;
  generation: number;
  frameIndex: number;
  sequenceIndex: number;
  elapsedMs: number;
  completed: boolean;
  completionEmitted: boolean;
  loopCount: number;
  loopBoundary: boolean;
  playing: boolean;
  paused: boolean;
}>;

export type AnimationRuntimeEvent =
  | Readonly<{
      type: 'FRAME_CHANGED';
      animationId: string;
      generation: number;
      frameIndex: number;
      elapsedMs: number;
      loopCount: number;
      loopBoundary: boolean;
    }>
  | Readonly<{
      type: 'ANIMATION_COMPLETED';
      animationId: string;
      generation: number;
      frameIndex: number;
      elapsedMs: number;
    }>;

export type PlaybackRequest = Readonly<{
  definition: AnimationDefinition;
  generation: number;
  startFrame?: number;
  startPaused?: boolean;
}>;

export interface MonotonicClock {
  now(): number;
}
