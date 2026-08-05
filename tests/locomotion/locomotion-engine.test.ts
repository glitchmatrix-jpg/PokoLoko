import { describe, expect, it } from 'vitest';
import { LocomotionEngine, animationFpsForTravelSpeed, createLocomotionProfile } from '../../packages/pet-engine/locomotion/src';

const bounds = { minimumX: -100, maximumX: 900 } as const;

function runToCompletion(engine: LocomotionEngine, deltas: number[]): ReturnType<LocomotionEngine['tick']> {
  let time = 0;
  let result = engine.tick(time, bounds);
  let index = 0;
  for (let guard = 0; guard < 5000 && result.snapshot.active; guard += 1) {
    time += deltas[index % deltas.length]!;
    index += 1;
    result = engine.tick(time, bounds);
  }
  return result;
}

describe('LocomotionEngine', () => {
  it('reaches the same destination across regular and irregular frame pacing', () => {
    const profile = createLocomotionProfile('poko', 'balanced');
    const regular = new LocomotionEngine();
    regular.start({ generation: 1, positionX: 100, destinationX: 600, bounds, profile, monotonicMs: 0 });
    const regularResult = runToCompletion(regular, [16]);

    const irregular = new LocomotionEngine();
    irregular.start({ generation: 1, positionX: 100, destinationX: 600, bounds, profile, monotonicMs: 0 });
    const irregularResult = runToCompletion(irregular, [7, 31, 12, 19, 48]);

    expect(regularResult.snapshot.active).toBe(false);
    expect(irregularResult.snapshot.active).toBe(false);
    expect(regularResult.snapshot.positionX).toBe(600);
    expect(irregularResult.snapshot.positionX).toBe(600);
  });

  it('clamps an unreachable destination and emits edge then destination', () => {
    const engine = new LocomotionEngine();
    engine.start({ generation: 4, positionX: 100, destinationX: 5000, bounds, profile: createLocomotionProfile('loko', 'lively'), monotonicMs: 0 });
    const result = runToCompletion(engine, [16]);
    expect(result.snapshot.positionX).toBe(bounds.maximumX);
    expect(result.events.map((event) => event.type)).toEqual(['SCREEN_EDGE_REACHED', 'DESTINATION_REACHED']);
  });

  it('stops exactly once without one-pixel destination oscillation', () => {
    const engine = new LocomotionEngine();
    engine.start({ generation: 7, positionX: 0, destinationX: 100, bounds, profile: createLocomotionProfile('poko', 'calm'), monotonicMs: 0 });
    const result = runToCompletion(engine, [16]);
    const after = engine.tick(result.snapshot.elapsedMs + 100, bounds);
    expect(result.snapshot.positionX).toBe(100);
    expect(result.snapshot.velocityX).toBe(0);
    expect(after.events).toHaveLength(0);
    expect(after.snapshot.positionX).toBe(100);
  });

  it('caps a long scheduler gap rather than racing through missed distance', () => {
    const engine = new LocomotionEngine();
    const profile = createLocomotionProfile('poko', 'balanced');
    engine.start({ generation: 1, positionX: 0, destinationX: 800, bounds, profile, monotonicMs: 0 });
    const result = engine.tick(5000, bounds);
    expect(result.snapshot.positionX).toBeLessThan(10);
  });

  it('interrupts active movement once', () => {
    const engine = new LocomotionEngine();
    engine.start({ generation: 3, positionX: 0, destinationX: 300, bounds, profile: createLocomotionProfile('loko', 'balanced'), monotonicMs: 0 });
    engine.tick(100, bounds);
    const first = engine.interrupt('drag-start', 101);
    const second = engine.interrupt('drag-start', 102);
    expect(first?.events[0]?.type).toBe('MOVEMENT_INTERRUPTED');
    expect(second).toBeNull();
  });
});

describe('walk cadence tuning', () => {
  it('scales authored FPS with movement speed inside safe bounds', () => {
    expect(animationFpsForTravelSpeed(8, 45, 45)).toBe(8);
    expect(animationFpsForTravelSpeed(8, 22.5, 45)).toBe(4);
    expect(animationFpsForTravelSpeed(8, 90, 45)).toBe(12);
  });
});

describe('LocomotionEngine retargeting', () => {
  it('preserves continuous position while updating a same-direction destination', () => {
    const engine = new LocomotionEngine();
    engine.start({
      generation: 3,
      positionX: 100,
      destinationX: 500,
      bounds: { minimumX: 0, maximumX: 1000 },
      profile: {
        maximumSpeedPxPerSecond: 50,
        accelerationPxPerSecondSquared: 200,
        decelerationPxPerSecondSquared: 250,
        arrivalThresholdPx: 0.5,
        maximumDeltaMs: 100,
      },
      monotonicMs: 0,
    });
    const moved = engine.tick(100, { minimumX: 0, maximumX: 1000 }).snapshot;
    const retargeted = engine.retarget(700, { minimumX: 0, maximumX: 1000 }, 100).snapshot;
    expect(retargeted.positionX).toBe(moved.positionX);
    expect(retargeted.destinationX).toBe(700);
    expect(retargeted.active).toBe(true);
    expect(retargeted.direction).toBe('right');
  });
});
