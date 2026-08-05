import { describe, expect, it } from 'vitest';
import { windowCommandSchema } from '../../electron/preload/contracts';

describe('Step 22 native-shell commands', () => {
  it('validates onboarding completion without private content', () => {
    expect(windowCommandSchema.parse({ type: 'complete_onboarding', character: 'poko', activityLevel: 'balanced', contextEnabled: false })).toEqual({
      type: 'complete_onboarding', character: 'poko', activityLevel: 'balanced', contextEnabled: false,
    });
  });

  it('supports splash, current-screen movement, and restart commands', () => {
    expect(windowCommandSchema.parse({ type: 'splash_complete' }).type).toBe('splash_complete');
    expect(windowCommandSchema.parse({ type: 'move_pet_to_current_screen' }).type).toBe('move_pet_to_current_screen');
    expect(windowCommandSchema.parse({ type: 'restart_companion' }).type).toBe('restart_companion');
  });
});
