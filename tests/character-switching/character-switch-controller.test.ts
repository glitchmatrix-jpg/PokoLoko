import { describe, expect, it } from 'vitest';
import { CharacterSwitchController, type CharacterProfileBundle } from '../../packages/pet-engine/character-switch/src/index.js';

type Bundle = CharacterProfileBundle<{ id: string }, { name: string }, { energy: number }, { recent: string[] }>;
const bundle=(character:'poko'|'loko'):Bundle=>({character,asset:{id:`${character}-idle`},behaviorProfile:{name:character},initialMind:{energy:character==='poko'?0.8:0.7},sessionMemory:{recent:[]},neutralPosture:'idle_front'});

describe('CharacterSwitchController',()=>{
  it('commits only after the target profile is loaded',async()=>{
    const c=new CharacterSwitchController<Bundle>('poko',{load:async character=>bundle(character)},bundle('poko'));
    const result=await c.request({character:'loko',monotonicMs:10,reason:'settings'});
    expect(result.accepted).toBe(true);
    expect(result.snapshot.character).toBe('loko');
    expect(result.snapshot.bundle?.behaviorProfile.name).toBe('loko');
    expect(result.commands.at(-1)?.kind).toBe('commit_character');
  });

  it('ignores a stale slower load when a newer switch wins',async()=>{
    let resolvePoko!: (value:Bundle)=>void;
    const c=new CharacterSwitchController<Bundle>('poko',{load:character=>character==='loko'?Promise.resolve(bundle('loko')):new Promise(r=>{resolvePoko=r;})},bundle('poko'));
    const toPoko=c.request({character:'loko',monotonicMs:1,reason:'settings'});
    await toPoko;
    const stale=c.request({character:'poko',monotonicMs:2,reason:'settings'});
    const latest=c.request({character:'loko',monotonicMs:3,reason:'tray'});
    resolvePoko(bundle('poko'));
    const [staleResult,latestResult]=await Promise.all([stale,latest]);
    expect(staleResult.accepted).toBe(false);
    expect(latestResult.snapshot.character).toBe('loko');
  });

  it('isolates generations and rejects old-character events',async()=>{
    const c=new CharacterSwitchController<Bundle>('poko',{load:async character=>bundle(character)},bundle('poko'));
    const before=c.snapshot();
    const result=await c.request({character:'loko',monotonicMs:5,reason:'tray'});
    expect(c.acceptsEvent('poko',before.generation)).toBe(false);
    expect(c.acceptsEvent('loko',result.snapshot.generation)).toBe(true);
  });

  it('keeps the previous character when target loading fails',async()=>{
    const c=new CharacterSwitchController<Bundle>('poko',{load:async()=>{throw new Error('missing idle frame');}},bundle('poko'));
    const result=await c.request({character:'loko',monotonicMs:5,reason:'settings'});
    expect(result.accepted).toBe(false);
    expect(result.snapshot.character).toBe('poko');
    expect(result.snapshot.phase).toBe('failed');
  });
});
