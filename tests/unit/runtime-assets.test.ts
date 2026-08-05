import { describe, expect, it } from 'vitest';
import manifest from '../../public/assets/runtime/runtime_manifest.json';

describe('runtime asset manifest', () => {
  it('uses absolute public URLs that Vite preserves in development and packaged dist', () => {
    for (const animation of manifest.animations) {
      for (const frame of animation.frames) {
        expect(frame.startsWith('/assets/runtime/')).toBe(true);
        expect(frame.includes('..')).toBe(false);
      }
    }
  });

  it('contains all approved personality activities', () => {
    const ids = new Set(manifest.animations.map((animation) => animation.id));
    for (const id of ['poko_music','poko_playing_ball','poko_peeking','poko_eat','poko_drink','loko_laptop','loko_reading_01','loko_music','loko_playing_ball_01','loko_eat','loko_drink_02']) {
      expect(ids.has(id)).toBe(true);
    }
  });
});
