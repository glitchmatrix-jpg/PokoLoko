import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { AppSettings } from './types.js';

const defaults: AppSettings = {
  pet: 'poko',
  alwaysOnTop: true,
  paused: false,
};

function isSettings(value: unknown): value is Partial<AppSettings> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AppSettings>;
  return (
    (candidate.pet === undefined || candidate.pet === 'poko' || candidate.pet === 'loko') &&
    (candidate.alwaysOnTop === undefined || typeof candidate.alwaysOnTop === 'boolean') &&
    (candidate.paused === undefined || typeof candidate.paused === 'boolean')
  );
}

export class Store {
  private file = '';
  private data: AppSettings = { ...defaults };

  init(): void {
    this.file = path.join(app.getPath('userData'), 'settings.json');
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data = isSettings(parsed) ? { ...defaults, ...parsed } : { ...defaults };
    } catch {
      this.data = { ...defaults };
    }
    this.save();
  }

  get(): AppSettings {
    return { ...this.data };
  }

  set(patch: Partial<AppSettings>): AppSettings {
    this.data = { ...this.data, ...patch };
    this.save();
    return this.get();
  }

  private save(): void {
    if (!this.file) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(temp, this.file);
  }
}
