import { describe, expect, it } from 'vitest';
import { BehaviorPlanner } from '../../packages/pet-engine/behavior/src/planner.js';
import { createInitialMind } from '../../packages/pet-engine/behavior/src/mind.js';
import { createSessionMemory } from '../../packages/pet-engine/behavior/src/memory.js';
import { buildPlannerOverlay } from '../../packages/pet-engine/activities/src/integration.js';

const context = {
  typingActivity: 'sustained' as const,
  pointerActivity: 'light' as const,
  systemIdle: false,
  audioActive: false,
  fullscreenActive: false,
  screenLocked: false,
  localTimeBand: 'day' as const,
  recentUserInteraction: 'none' as const,
  enabled: true,
};

it('feeds weighted legal activities into the planner without commanding a deterministic laptop action', () => {
  const mind = createInitialMind('loko');
  const memory = createSessionMemory(0);
  const overlay = buildPlannerOverlay({
    character: 'loko', nowMs: 1_000_000, state: 'stable.idle_front', posture: 'standing_front', currentRegion: 'center', nearScreenEdge: false,
    activityLevel: 'balanced', quietMode: false, context, mind, history: [],
  });
  const planner = new BehaviorPlanner(42);
  const decision = planner.decide({
    character: 'loko', state: 'stable.idle_front', currentRegion: 'center', mind, context, memory,
    settings: { activityLevel: 'balanced', quietMode: false, paused: false, contextualAwareness: true }, nowMs: 1_000_000,
    legalActivities: overlay.legalActivities, activityScoreMultipliers: overlay.scoreMultipliers, activityDurationOverrides: overlay.durationOverrides,
  });
  const laptop = decision.candidates.find((item) => item.key === 'activity:laptop');
  expect(laptop?.score).toBeGreaterThan(0);
  expect(decision.candidates.length).toBeGreaterThan(1);
});
