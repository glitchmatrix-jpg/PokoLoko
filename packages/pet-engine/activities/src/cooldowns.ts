import type { ActivityDefinition, ActivityId, CharacterId } from './types.js';

export type ActivityCooldownSnapshot = Readonly<{
  activityUntil: Readonly<Record<string, number>>;
  categoryUntil: Readonly<Record<string, number>>;
}>;

export function emptyCooldowns(): ActivityCooldownSnapshot { return { activityUntil: {}, categoryUntil: {} }; }

export function applyActivityCooldown(snapshot: ActivityCooldownSnapshot, definition: ActivityDefinition, nowMs: number, durationMs: number): ActivityCooldownSnapshot {
  const activityKey = `${definition.character}:${definition.id}`;
  const categoryKey = `${definition.character}:${definition.category}`;
  return {
    activityUntil: { ...snapshot.activityUntil, [activityKey]: nowMs + durationMs },
    categoryUntil: { ...snapshot.categoryUntil, [categoryKey]: Math.max(snapshot.categoryUntil[categoryKey] ?? 0, nowMs + definition.cooldownMs.categoryMin) },
  };
}

export function isActivityCoolingDown(snapshot: ActivityCooldownSnapshot, character: CharacterId, activityId: ActivityId, category: ActivityDefinition['category'], nowMs: number): boolean {
  return (snapshot.activityUntil[`${character}:${activityId}`] ?? 0) > nowMs || (snapshot.categoryUntil[`${character}:${category}`] ?? 0) > nowMs;
}
