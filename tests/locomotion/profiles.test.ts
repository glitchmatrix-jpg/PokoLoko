import { describe, expect, it } from 'vitest';
import { createLocomotionProfile } from '../../packages/pet-engine/locomotion/src';

describe('character movement profiles', () => {
  it('keeps each activity level ordered and Poko slightly quicker', () => {
    for (const character of ['poko', 'loko'] as const) {
      const calm = createLocomotionProfile(character, 'calm').maximumSpeedPxPerSecond;
      const balanced = createLocomotionProfile(character, 'balanced').maximumSpeedPxPerSecond;
      const lively = createLocomotionProfile(character, 'lively').maximumSpeedPxPerSecond;
      expect(calm).toBeLessThan(balanced);
      expect(balanced).toBeLessThan(lively);
    }
    expect(createLocomotionProfile('poko', 'balanced').maximumSpeedPxPerSecond)
      .toBeGreaterThan(createLocomotionProfile('loko', 'balanced').maximumSpeedPxPerSecond);
  });
});
