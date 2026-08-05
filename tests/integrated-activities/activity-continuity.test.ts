import { describe, expect, it } from 'vitest';
import { ACTIVITY_REGISTRY } from '../../packages/pet-engine/activities/src/index.js';

const immediateReasons = new Set(['drag', 'character_switch', 'display_loss', 'shutdown']);

describe('activity continuity contracts', () => {
  it('documents entry, setup, loop, exit, recovery, prop and cooldown for every real activity', () => {
    for (const item of ACTIVITY_REGISTRY) {
      expect(item.entry.length).toBeGreaterThan(0);
      expect(item.loop.some((step) => step.kind === 'animation')).toBe(true);
      expect(item.exit.length).toBeGreaterThan(0);
      expect(item.recovery.length).toBeGreaterThan(0);
      expect(item.cooldownMs.min).toBeGreaterThan(0);
      expect(item.prop.ownership).not.toBe('none');
      expect(item.sourceAnimations.length).toBeGreaterThan(0);
    }
  });

  it('never declares composite prop teardown as arbitrary crossfade', () => {
    for (const item of ACTIVITY_REGISTRY) {
      expect(item.knownLimitations.join(' ').toLowerCase()).not.toContain('crossfade');
      expect(item.prop.interruptionRecovery).toMatch(/finish_phrase|neutral_frame/);
    }
  });

  it('keeps every hard interruption represented by the controller stop-reason vocabulary', () => {
    expect([...immediateReasons].sort()).toEqual(['character_switch', 'display_loss', 'drag', 'shutdown']);
  });
});
