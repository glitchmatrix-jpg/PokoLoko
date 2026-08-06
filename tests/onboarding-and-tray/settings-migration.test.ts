import { describe, expect, it } from 'vitest';
import { migrateSettings } from '../../electron/services/settings-store';

describe('Step 22 settings migration', () => {
  it('adds first-run and splash fields to v2 settings without losing preferences', () => {
    const value = migrateSettings({ settingsVersion: 2, selectedCharacter: 'loko', activityLevel: 'calm', sizeScale: 2 });
    expect(value.selectedCharacter).toBe('loko');
    expect(value.activityLevel).toBe('calm');
    expect(value.sizeScale).toBe(2);
    expect(value.onboardingComplete).toBe(false);
    expect(value.splashEnabled).toBe(true);
    expect(value.settingsVersion).toBe(4);
  });

  it('preserves completed onboarding after restart', () => {
    const value = migrateSettings({ settingsVersion: 3, onboardingComplete: true, splashEnabled: false });
    expect(value.onboardingComplete).toBe(true);
    expect(value.splashEnabled).toBe(false);
  });
});
