import { sampleTimeline } from './timeline';
import type {
  AnimationClockSnapshot,
  AnimationDefinition,
  AnimationRuntimeEvent,
  MonotonicClock,
  PlaybackRequest,
} from './types';

const DEFAULT_MAX_CATCH_UP_MS = 250;

export class AnimationRuntime {
  private definition: AnimationDefinition | null = null;
  private generation = 0;
  private accumulatedMs = 0;
  private lastClockMs: number | null = null;
  private paused = true;
  private suspended = false;
  private completed = false;
  private completionEmitted = false;
  private frameIndex = 0;
  private sequenceIndex = 0;
  private loopCount = 0;
  private loopBoundary = false;

  public constructor(
    private readonly clock: MonotonicClock,
    private readonly emit: (event: AnimationRuntimeEvent) => void,
    private readonly maxCatchUpMs = DEFAULT_MAX_CATCH_UP_MS,
  ) {
    if (!Number.isFinite(maxCatchUpMs) || maxCatchUpMs <= 0) {
      throw new Error('maxCatchUpMs must be a positive finite number.');
    }
  }

  public play(request: PlaybackRequest): AnimationClockSnapshot {
    this.validateDefinition(request.definition);

    const identical =
      this.definition?.id === request.definition.id &&
      this.generation === request.generation &&
      this.definition.fps === request.definition.fps &&
      this.definition.playback === request.definition.playback &&
      this.definition.loop === request.definition.loop &&
      this.definition.frames.length === request.definition.frames.length &&
      this.definition.frames.every((frame, index) => frame === request.definition.frames[index]) &&
      (request.startFrame ?? 0) === 0 &&
      (request.startPaused ?? false) === this.paused;

    if (identical) return this.snapshot();

    this.definition = request.definition;
    this.generation = request.generation;
    this.accumulatedMs = this.elapsedForStartFrame(request.definition, request.startFrame ?? 0);
    this.lastClockMs = this.clock.now();
    this.paused = request.startPaused ?? false;
    this.suspended = false;
    this.completed = false;
    this.completionEmitted = false;
    this.loopCount = 0;
    this.loopBoundary = false;
    this.applySample(true);
    return this.snapshot();
  }

  public tick(nowMs = this.clock.now()): AnimationClockSnapshot {
    if (!this.definition || this.paused || this.suspended || this.completed) {
      this.lastClockMs = nowMs;
      return this.snapshot();
    }

    if (this.lastClockMs === null) this.lastClockMs = nowMs;
    const rawDelta = Math.max(0, nowMs - this.lastClockMs);
    this.lastClockMs = nowMs;
    const boundedDelta = Math.min(rawDelta, this.maxCatchUpMs);
    this.accumulatedMs += boundedDelta;
    this.applySample(false);
    return this.snapshot();
  }

  public pause(): AnimationClockSnapshot {
    if (!this.definition || this.paused) return this.snapshot();
    this.tick();
    this.paused = true;
    return this.snapshot();
  }

  public resume(): AnimationClockSnapshot {
    if (!this.definition || !this.paused) return this.snapshot();
    this.lastClockMs = this.clock.now();
    this.paused = false;
    return this.snapshot();
  }

  public suspend(): AnimationClockSnapshot {
    if (!this.definition || this.suspended) return this.snapshot();
    this.tick();
    this.suspended = true;
    this.lastClockMs = null;
    return this.snapshot();
  }

  public resumeFromSuspend(): AnimationClockSnapshot {
    if (!this.definition || !this.suspended) return this.snapshot();
    this.suspended = false;
    this.lastClockMs = this.clock.now();
    return this.snapshot();
  }

  public stop(): AnimationClockSnapshot {
    this.paused = true;
    this.completed = true;
    this.lastClockMs = null;
    return this.snapshot();
  }

  public resetForAssetReload(): void {
    this.definition = null;
    this.generation += 1;
    this.accumulatedMs = 0;
    this.lastClockMs = null;
    this.paused = true;
    this.suspended = false;
    this.completed = false;
    this.completionEmitted = false;
    this.frameIndex = 0;
    this.sequenceIndex = 0;
    this.loopCount = 0;
    this.loopBoundary = false;
  }

  public snapshot(): AnimationClockSnapshot {
    return {
      animationId: this.definition?.id ?? '',
      generation: this.generation,
      frameIndex: this.frameIndex,
      sequenceIndex: this.sequenceIndex,
      elapsedMs: this.accumulatedMs,
      completed: this.completed,
      completionEmitted: this.completionEmitted,
      loopCount: this.loopCount,
      loopBoundary: this.loopBoundary,
      playing: Boolean(this.definition) && !this.paused && !this.suspended && !this.completed,
      paused: this.paused || this.suspended,
    };
  }

  private applySample(forceFrameEvent: boolean): void {
    if (!this.definition) return;
    const previousFrame = this.frameIndex;
    const previousLoopCount = this.loopCount;
    const sample = sampleTimeline(
      this.accumulatedMs,
      this.definition.frames.length,
      this.definition.fps,
      this.definition.playback,
      this.definition.loop,
    );

    this.frameIndex = sample.frameIndex;
    this.sequenceIndex = sample.sequenceIndex;
    this.loopCount = sample.loopCount;
    this.loopBoundary = sample.loopBoundary && sample.loopCount > previousLoopCount;
    this.completed = sample.completed;

    if (forceFrameEvent || previousFrame !== this.frameIndex || this.loopBoundary) {
      this.emit({
        type: 'FRAME_CHANGED',
        animationId: this.definition.id,
        generation: this.generation,
        frameIndex: this.frameIndex,
        elapsedMs: this.accumulatedMs,
        loopCount: this.loopCount,
        loopBoundary: this.loopBoundary,
      });
    }

    if (this.completed && !this.definition.loop && !this.completionEmitted) {
      this.completionEmitted = true;
      this.emit({
        type: 'ANIMATION_COMPLETED',
        animationId: this.definition.id,
        generation: this.generation,
        frameIndex: this.frameIndex,
        elapsedMs: this.accumulatedMs,
      });
    }
  }

  private elapsedForStartFrame(definition: AnimationDefinition, requestedFrame: number): number {
    const clamped = Math.max(0, Math.min(definition.frames.length - 1, Math.floor(requestedFrame)));
    const duration = 1000 / definition.fps;
    if (definition.playback === 'reverse') return (definition.frames.length - 1 - clamped) * duration;
    return clamped * duration;
  }

  private validateDefinition(definition: AnimationDefinition): void {
    if (!definition.id) throw new Error('Animation ID is required.');
    if (definition.frames.length === 0) throw new Error(`Animation ${definition.id} has no frames.`);
    if (!Number.isFinite(definition.fps) || definition.fps <= 0) {
      throw new Error(`Animation ${definition.id} has invalid FPS ${definition.fps}.`);
    }
  }
}
