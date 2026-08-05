import { describe, expect, it } from 'vitest';
import { AnimationRuntime, type AnimationRuntimeEvent, type MonotonicClock } from '../../packages/animation-runtime/src';

class FakeClock implements MonotonicClock {
  public value = 0;
  public now(): number { return this.value; }
  public advance(ms: number): void { this.value += ms; }
}

const oneShot = {
  id: 'one-shot',
  frames: ['a', 'b', 'c'],
  fps: 10,
  playback: 'forward' as const,
  loop: false,
};

const loop = {
  id: 'loop',
  frames: ['a', 'b', 'c', 'd'],
  fps: 4,
  playback: 'forward' as const,
  loop: true,
};

describe('AnimationRuntime', () => {
  it('emits one-shot completion once and only once', () => {
    const clock = new FakeClock();
    const events: AnimationRuntimeEvent[] = [];
    const runtime = new AnimationRuntime(clock, (event) => events.push(event));
    runtime.play({ definition: oneShot, generation: 2 });
    clock.advance(400);
    runtime.tick();
    clock.advance(400);
    runtime.tick();
    runtime.tick();
    expect(events.filter((event) => event.type === 'ANIMATION_COMPLETED')).toHaveLength(1);
    expect(runtime.snapshot()).toMatchObject({ completed: true, frameIndex: 2, generation: 2 });
  });

  it('does not restart an identical presentation', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined);
    runtime.play({ definition: loop, generation: 1 });
    clock.advance(500);
    runtime.tick();
    const before = runtime.snapshot();
    const after = runtime.play({ definition: loop, generation: 1 });
    expect(after.elapsedMs).toBe(before.elapsedMs);
    expect(after.frameIndex).toBe(before.frameIndex);
  });

  it('restarts when frame content changes despite an identical ID and frame count', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined);
    runtime.play({ definition: loop, generation: 1 });
    clock.advance(500);
    runtime.tick();
    const restarted = runtime.play({ definition: { ...loop, frames: ['w', 'x', 'y', 'z'] }, generation: 1 });
    expect(restarted.elapsedMs).toBe(0);
    expect(restarted.frameIndex).toBe(0);
  });

  it('caps long frame-gap catch-up', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined, 250);
    runtime.play({ definition: loop, generation: 1 });
    clock.advance(60_000);
    const snapshot = runtime.tick();
    expect(snapshot.elapsedMs).toBe(250);
    expect(snapshot.frameIndex).toBe(1);
  });

  it('pause and resume do not accumulate paused wall time', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined);
    runtime.play({ definition: loop, generation: 1 });
    clock.advance(250);
    runtime.tick();
    runtime.pause();
    clock.advance(10_000);
    runtime.tick();
    expect(runtime.snapshot().frameIndex).toBe(1);
    runtime.resume();
    clock.advance(250);
    runtime.tick();
    expect(runtime.snapshot().frameIndex).toBe(2);
  });

  it('suspend and resume recover predictably', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined);
    runtime.play({ definition: loop, generation: 1 });
    clock.advance(250);
    runtime.tick();
    runtime.suspend();
    clock.advance(30_000);
    runtime.resumeFromSuspend();
    clock.advance(250);
    runtime.tick();
    expect(runtime.snapshot()).toMatchObject({ frameIndex: 2, loopCount: 0, playing: true });
  });

  it('resets safely for character or asset reload', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined);
    runtime.play({ definition: loop, generation: 4 });
    runtime.resetForAssetReload();
    expect(runtime.snapshot()).toMatchObject({ animationId: '', frameIndex: 0, playing: false, generation: 5 });
    runtime.play({ definition: oneShot, generation: 6 });
    expect(runtime.snapshot()).toMatchObject({ animationId: 'one-shot', generation: 6, frameIndex: 0 });
  });

  it('supports deterministic ping-pong endpoints', () => {
    const clock = new FakeClock();
    const runtime = new AnimationRuntime(clock, () => undefined, 10_000);
    runtime.play({ definition: { ...loop, id: 'ping', playback: 'ping_pong', fps: 10 }, generation: 1 });
    const expected = [1, 2, 3, 2, 1, 0];
    for (const frameIndex of expected) {
      clock.advance(100);
      expect(runtime.tick().frameIndex).toBe(frameIndex);
    }
  });
});
