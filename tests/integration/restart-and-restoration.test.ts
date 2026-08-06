import { describe, expect, it } from 'vitest';
import { defaultSettings, migrateSettings, settingsSchema } from '../../electron/services/settings-store.js';
describe('restart restoration contracts',()=>{
 it('restores valid persisted selections after upgrade',()=>{const restored=migrateSettings({settingsVersion:1,selectedCharacter:'loko',sizeScale:3,activityLevel:'calm',alwaysOnTop:false});expect(restored.selectedCharacter).toBe('loko');expect(restored.walkingSpeed).toBe('calm');expect(restored.settingsVersion).toBe(4);});
 it('rejects corrupt values and defaults remain safe',()=>{expect(settingsSchema.safeParse({...defaultSettings(),sizeScale:99}).success).toBe(false);expect(defaultSettings().contextAwareness.enabled).toBe(false);expect(defaultSettings().soundEnabled).toBe(false);});
});
