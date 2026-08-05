import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({ app: { getPath: () => '/tmp/pokoloko-settings-test' } }));

import { CURRENT_SETTINGS_VERSION, defaultSettings, migrateSettings, settingsSchema } from '../../electron/services/settings-store';

describe('settings schema and migrations', () => {
  it('creates safe Step 21 defaults', () => {
    const value = defaultSettings();
    expect(value.settingsVersion).toBe(CURRENT_SETTINGS_VERSION);
    expect(value.sizeScale).toBe(1);
    expect(value.activityLevel).toBe('balanced');
    expect(value.walkingSpeed).toBe('balanced');
    expect(value.contextAwareness.enabled).toBe(false);
    expect(value.fullscreenBehavior).toBe('quiet');
  });

  it('migrates legacy settings without losing user choices', () => {
    const value = migrateSettings({ selectedCharacter: 'loko', sizeScale: 2, activityLevel: 'lively', alwaysOnTop: false });
    expect(value.selectedCharacter).toBe('loko');
    expect(value.sizeScale).toBe(2);
    expect(value.walkingSpeed).toBe('lively');
    expect(value.alwaysOnTop).toBe(false);
    expect(value.settingsVersion).toBe(2);
  });

  it('rejects unsafe values', () => {
    expect(() => settingsSchema.parse({ sizeScale: 4 })).toThrow();
    expect(() => settingsSchema.parse({ fullscreenBehavior: 'spy' })).toThrow();
  });
});
