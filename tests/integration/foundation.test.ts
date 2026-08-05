import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('foundation repository', () => {
  it('contains no legacy animation manifest', () => {
    expect(fs.existsSync(path.resolve('public/assets/animations.json'))).toBe(false);
  });
  it('contains the authoritative application icon', () => {
    expect(fs.statSync(path.resolve('build/pokoloko.ico')).size).toBeGreaterThan(0);
  });
});
