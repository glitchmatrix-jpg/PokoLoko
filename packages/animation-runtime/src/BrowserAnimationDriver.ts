import { AnimationRuntime } from './AnimationRuntime';
import type { AnimationClockSnapshot, AnimationRuntimeEvent, PlaybackRequest } from './types';

export class BrowserAnimationDriver {
  private rafId: number | null = null;
  private readonly runtime: AnimationRuntime;
  private readonly listeners = new Set<(snapshot: AnimationClockSnapshot) => void>();

  public constructor(onEvent: (event: AnimationRuntimeEvent) => void) {
    this.runtime = new AnimationRuntime({ now: () => performance.now() }, onEvent);
  }

  public play(request: PlaybackRequest): AnimationClockSnapshot {
    const snapshot = this.runtime.play(request);
    this.publish(snapshot);
    this.ensureLoop();
    return snapshot;
  }

  public pause(): void {
    this.publish(this.runtime.pause());
    this.stopLoop();
  }

  public resume(): void {
    this.publish(this.runtime.resume());
    this.ensureLoop();
  }

  public suspend(): void {
    this.publish(this.runtime.suspend());
    this.stopLoop();
  }

  public resumeFromSuspend(): void {
    this.publish(this.runtime.resumeFromSuspend());
    this.ensureLoop();
  }

  public resetForAssetReload(): void {
    this.stopLoop();
    this.runtime.resetForAssetReload();
    this.publish(this.runtime.snapshot());
  }

  public subscribe(listener: (snapshot: AnimationClockSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.runtime.snapshot());
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): AnimationClockSnapshot {
    return this.runtime.snapshot();
  }

  public dispose(): void {
    this.stopLoop();
    this.listeners.clear();
  }

  private ensureLoop(): void {
    if (this.rafId !== null || !this.runtime.snapshot().playing) return;
    const tick = (time: number) => {
      const snapshot = this.runtime.tick(time);
      this.publish(snapshot);
      if (snapshot.playing) this.rafId = requestAnimationFrame(tick);
      else this.rafId = null;
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private publish(snapshot: AnimationClockSnapshot): void {
    for (const listener of this.listeners) listener(snapshot);
  }
}
