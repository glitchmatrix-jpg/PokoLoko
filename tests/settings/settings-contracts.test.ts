import { describe, expect, it } from 'vitest';
import { publicSettingsSchema, windowCommandSchema } from '../../electron/preload/contracts';

describe('settings IPC contracts', () => {
  it('accepts every product-facing setting', () => {
    const value = publicSettingsSchema.parse({
      selectedCharacter: 'poko', sizeScale: 1, activityLevel: 'balanced', walkingSpeed: 'calm',
      paused: false, quietMode: false, alwaysOnTop: true, soundEnabled: false,
      launchAtStartup: true, reducedMotion: true, fullscreenBehavior: 'hide', diagnosticsEnabled: false,
      onboardingComplete: false, splashEnabled: true,
      contextAwareness: { enabled: false, typingPresence: false, mouseActivity: true, systemIdle: true, timeOfDay: true, audioState: false, fullscreenState: true, lockAndResume: true, recentPetInteraction: true },
    });
    expect(value.fullscreenBehavior).toBe('hide');
  });

  it('keeps reset and privacy commands narrow', () => {
    expect(windowCommandSchema.parse({ type: 'reset_settings_defaults' }).type).toBe('reset_settings_defaults');
    expect(windowCommandSchema.parse({ type: 'reset_character_behavior', character: 'loko' }).type).toBe('reset_character_behavior');
    expect(() => windowCommandSchema.parse({ type: 'set_launch_at_startup', enabled: 'yes' })).toThrow();
  });
});
