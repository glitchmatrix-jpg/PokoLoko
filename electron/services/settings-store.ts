import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

export const CURRENT_SETTINGS_VERSION = 3 as const;

const contextSchema = z.object({
  enabled: z.boolean().default(false),
  typingPresence: z.boolean().default(false),
  mouseActivity: z.boolean().default(true),
  systemIdle: z.boolean().default(true),
  timeOfDay: z.boolean().default(true),
  audioState: z.boolean().default(false),
  fullscreenState: z.boolean().default(true),
  lockAndResume: z.boolean().default(true),
  recentPetInteraction: z.boolean().default(true),
});

export const settingsSchema = z.object({
  settingsVersion: z.literal(CURRENT_SETTINGS_VERSION).default(CURRENT_SETTINGS_VERSION),
  selectedCharacter: z.enum(['poko', 'loko']).default('poko'),
  sizeScale: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  activityLevel: z.enum(['calm', 'balanced', 'lively']).default('balanced'),
  walkingSpeed: z.enum(['calm', 'balanced', 'lively']).default('balanced'),
  paused: z.boolean().default(false),
  quietMode: z.boolean().default(false),
  alwaysOnTop: z.boolean().default(true),
  soundEnabled: z.boolean().default(false),
  launchAtStartup: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  fullscreenBehavior: z.enum(['quiet', 'hide', 'unchanged']).default('quiet'),
  diagnosticsEnabled: z.boolean().default(false),
  onboardingComplete: z.boolean().default(false),
  splashEnabled: z.boolean().default(true),
  contextAwareness: contextSchema.default({
    enabled: false,
    typingPresence: false,
    mouseActivity: true,
    systemIdle: true,
    timeOfDay: true,
    audioState: false,
    fullscreenState: true,
    lockAndResume: true,
    recentPetInteraction: true,
  }),
});

export type AppSettings = z.infer<typeof settingsSchema>;

export function defaultSettings(): AppSettings {
  return settingsSchema.parse({});
}

export function migrateSettings(raw: unknown): AppSettings {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const version = typeof source.settingsVersion === 'number' ? source.settingsVersion : 1;
  if (version <= 2) {
    return settingsSchema.parse({
      ...source,
      settingsVersion: CURRENT_SETTINGS_VERSION,
      walkingSpeed: source.walkingSpeed ?? source.activityLevel ?? 'balanced',
      launchAtStartup: source.launchAtStartup ?? false,
      reducedMotion: source.reducedMotion ?? false,
      fullscreenBehavior: source.fullscreenBehavior ?? 'quiet',
      onboardingComplete: source.onboardingComplete ?? false,
      splashEnabled: source.splashEnabled ?? true,
    });
  }
  return settingsSchema.parse(source);
}

export class SettingsStore {
  private value: AppSettings = defaultSettings();
  private readonly filePath: string;

  public constructor() {
    this.filePath = path.join(app.getPath('userData'), 'settings.json');
  }

  public load(): AppSettings {
    try {
      if (!fs.existsSync(this.filePath)) return this.value;
      this.value = migrateSettings(JSON.parse(fs.readFileSync(this.filePath, 'utf8')));
      this.persist();
    } catch {
      this.value = defaultSettings();
      this.persist();
    }
    return this.value;
  }

  public get(): AppSettings {
    return this.value;
  }

  public update(patch: Partial<AppSettings>): AppSettings {
    this.value = settingsSchema.parse({ ...this.value, ...patch, settingsVersion: CURRENT_SETTINGS_VERSION });
    this.persist();
    return this.value;
  }

  public reset(): AppSettings {
    this.value = defaultSettings();
    this.persist();
    return this.value;
  }

  private persist(): void {
    const temporary = `${this.filePath}.tmp`;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(temporary, JSON.stringify(this.value, null, 2));
    fs.renameSync(temporary, this.filePath);
  }
}

