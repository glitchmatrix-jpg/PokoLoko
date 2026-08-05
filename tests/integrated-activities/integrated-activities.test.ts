import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_REGISTRY,
  AMBIENT_ROUTINES,
  evaluateIntegratedActivity,
  getApprovedIntegratedActivities,
  getIntegratedActivityPolicy,
  buildPlannerOverlay,
} from '../../packages/pet-engine/activities/src/index.js';

const base = {
  nowMs: 2_000_000,
  state: 'stable.idle_front',
  posture: 'standing_front',
  currentRegion: 'center' as const,
  nearScreenEdge: false,
  activityLevel: 'balanced' as const,
  quietMode: false,
  context: {
    enabled: true,
    typingActivity: 'none' as const,
    pointerActivity: 'light' as const,
    systemIdle: false,
    audioActive: false,
    fullscreenActive: false,
    screenLocked: false,
    recentUserInteraction: 'none' as const,
  },
  mind: { energy: .75, playfulness: .7, focus: .6, curiosity: .7, comfort: .7, boredom: .35 },
  history: [],
};

describe('integrated activity catalog', () => {
  it('covers every approved activity definition with explicit integration policy', () => {
    for (const definition of ACTIVITY_REGISTRY) {
      expect(getIntegratedActivityPolicy(definition.character, definition.id)?.availability).toBe('approved');
    }
  });

  it('keeps unsupported Poko laptop and reading unavailable instead of fabricating assets', () => {
    expect(getIntegratedActivityPolicy('poko', 'laptop')?.availability).toBe('unsupported_for_character');
    expect(getIntegratedActivityPolicy('poko', 'reading')?.availability).toBe('unsupported_for_character');
    expect(getApprovedIntegratedActivities('poko').some((item) => item.id === 'laptop')).toBe(false);
  });

  it('uses typing as a probability multiplier rather than a deterministic command', () => {
    const quiet = evaluateIntegratedActivity({ ...base, character: 'loko' as const, activityId: 'laptop' as const });
    const typing = evaluateIntegratedActivity({
      ...base,
      character: 'loko' as const,
      activityId: 'laptop' as const,
      context: { ...base.context, typingActivity: 'sustained' as const },
    });
    expect(quiet.eligible).toBe(true);
    expect(typing.eligible).toBe(true);
    expect(typing.scoreMultiplier).toBeGreaterThan(quiet.scoreMultiplier);
  });

  it('keeps Loko play rare relative to Poko play', () => {
    const poko = evaluateIntegratedActivity({ ...base, character: 'poko' as const, activityId: 'playing_ball' as const });
    const loko = evaluateIntegratedActivity({ ...base, character: 'loko' as const, activityId: 'playing_ball' as const });
    expect(poko.scoreMultiplier).toBeGreaterThan(loko.scoreMultiplier * 2);
  });

  it('requires a real edge for peeking', () => {
    const blocked = evaluateIntegratedActivity({ ...base, character: 'poko' as const, activityId: 'peeking' as const });
    const allowed = evaluateIntegratedActivity({ ...base, character: 'poko' as const, activityId: 'peeking' as const, nearScreenEdge: true });
    expect(blocked.eligible).toBe(false);
    expect(allowed.eligible).toBe(true);
  });

  it('applies minimum-gap and hourly caps', () => {
    const policy = getIntegratedActivityPolicy('poko', 'music')!;
    const recent = evaluateIntegratedActivity({
      ...base,
      character: 'poko' as const,
      activityId: 'music' as const,
      history: [{ character: 'poko' as const, activityId: 'music' as const, completedAtMs: base.nowMs - policy.frequencyCap.minimumGapMs + 1, interrupted: false }],
    });
    expect(recent.eligible).toBe(false);
  });

  it('defines ambient vocabulary for both characters', () => {
    expect(AMBIENT_ROUTINES.some((item) => item.character === 'poko' && item.animationId === 'poko_idle_blink')).toBe(true);
    expect(AMBIENT_ROUTINES.some((item) => item.character === 'loko' && item.animationId === 'loko_idle_front')).toBe(true);
  });


  it('builds a planner overlay without bypassing legal state and posture checks', () => {
    const overlay = buildPlannerOverlay({ ...base, character: 'loko' as const, context: { ...base.context, typingActivity: 'sustained' as const } });
    expect(overlay.legalActivities).toContain('laptop');
    expect(overlay.scoreMultipliers.laptop).toBeGreaterThan(1);
    expect(overlay.durationOverrides.laptop).toEqual([14_000, 42_000]);
  });
});
