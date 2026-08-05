import type { Point, SettlePlan } from './types.js';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function createSettlePlan(
  generation: number,
  from: Point,
  to: Point,
  monotonicMs: number,
  durationMs = 180,
): SettlePlan {
  if (durationMs <= 0 || !Number.isFinite(durationMs)) throw new Error('Settle duration must be positive and finite.');
  return { generation, from, to, startedAtMonotonicMs: monotonicMs, durationMs };
}

export function sampleSettle(plan: SettlePlan, monotonicMs: number): Readonly<{ point: Point; completed: boolean; progress: number }> {
  const raw = Math.max(0, Math.min(1, (monotonicMs - plan.startedAtMonotonicMs) / plan.durationMs));
  const eased = easeOutCubic(raw);
  return {
    point: {
      x: plan.from.x + (plan.to.x - plan.from.x) * eased,
      y: plan.from.y + (plan.to.y - plan.from.y) * eased,
    },
    completed: raw >= 1,
    progress: raw,
  };
}
