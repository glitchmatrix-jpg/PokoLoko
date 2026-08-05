import { describe, expect, it } from 'vitest';
import { createCharacterProfileBundle } from '../../packages/pet-engine/character-switch/src/index.js';

describe('character profile isolation',()=>{
  it('creates fresh mind and session memory for each character switch',()=>{
    const poko=createCharacterProfileBundle('poko',{id:'poko'},100);
    const loko=createCharacterProfileBundle('loko',{id:'loko'},200);
    expect(poko.character).toBe('poko');
    expect(loko.character).toBe('loko');
    expect(poko.initialMind).not.toEqual(loko.initialMind);
    expect(poko.sessionMemory).not.toBe(loko.sessionMemory);
    expect(poko.sessionMemory.lastWakeAtMs).toBe(100);
    expect(loko.sessionMemory.lastWakeAtMs).toBe(200);
  });
});
