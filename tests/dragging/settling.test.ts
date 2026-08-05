import { describe, expect, it } from 'vitest';
import { createSettlePlan, sampleSettle } from '../../packages/pet-engine/interaction/src';

describe('drag settlement', () => {
  it('preserves horizontal position when target x is unchanged', () => {
    const plan = createSettlePlan(1, { x: 50, y: 100 }, { x: 50, y: 300 }, 0, 200);
    expect(sampleSettle(plan, 100).point.x).toBe(50);
  });

  it('lands exactly without overshoot', () => {
    const plan = createSettlePlan(1, { x: 10, y: -100 }, { x: 30, y: 400 }, 0, 180);
    const end = sampleSettle(plan, 1000);
    expect(end.completed).toBe(true);
    expect(end.point).toEqual({ x: 30, y: 400 });
  });

  it('uses monotonic progress and remains between endpoints', () => {
    const plan = createSettlePlan(1, { x: -400, y: 50 }, { x: -380, y: 500 }, 100, 200);
    const a = sampleSettle(plan, 120);
    const b = sampleSettle(plan, 200);
    expect(b.progress).toBeGreaterThan(a.progress);
    expect(b.point.y).toBeGreaterThan(a.point.y);
    expect(b.point.y).toBeLessThanOrEqual(500);
  });
});
