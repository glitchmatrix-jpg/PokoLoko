import { describe, expect, it } from 'vitest';
import { settingsSchema } from '../../electron/services/settings-store';

describe('settings schema', () => {
  it('creates safe defaults', () => expect(settingsSchema.parse({})).toMatchObject({ selectedCharacter: 'poko', paused: false }));
  it('rejects unknown characters', () => expect(() => settingsSchema.parse({ selectedCharacter: 'ghost' })).toThrow());
});
