import { describe, expect, it } from 'vitest';
import { AnimationRuntime } from '../../packages/animation-runtime/src/AnimationRuntime.js';
import { buildPlaybackOrder, sampleTimeline } from '../../packages/animation-runtime/src/timeline.js';
import { ManualClock } from '../support/ManualClock.js';

describe('animation deterministic coverage',()=>{
 it('does not duplicate ping-pong endpoints',()=>expect(buildPlaybackOrder(4,'ping_pong')).toEqual([0,1,2,3,2,1]));
 it('completes one-shot exactly once',()=>{
  const clock=new ManualClock(); const events:any[]=[]; const rt=new AnimationRuntime(clock, e=>events.push(e));
  rt.play({definition:{id:'once',frames:['a','b','c'],fps:10,playback:'forward',loop:false},generation:7});
  clock.advance(400); rt.tick(); clock.advance(400); rt.tick();
  expect(events.filter(e=>e.type==='ANIMATION_COMPLETED')).toHaveLength(1); expect(rt.snapshot().completed).toBe(true);
 });
 it('pause and resume exclude paused wall time',()=>{
  const clock=new ManualClock(); const rt=new AnimationRuntime(clock,()=>undefined);
  rt.play({definition:{id:'loop',frames:['a','b'],fps:10,playback:'forward',loop:true},generation:1});
  clock.advance(100); rt.tick(); rt.pause(); clock.advance(5000); rt.tick(); expect(rt.snapshot().frameIndex).toBe(1);
  rt.resume(); clock.advance(100); rt.tick(); expect(rt.snapshot().frameIndex).toBe(0);
 });
 it('bounds large deltas',()=>{
  const clock=new ManualClock(); const rt=new AnimationRuntime(clock,()=>undefined,250);
  rt.play({definition:{id:'bounded',frames:['a','b','c','d'],fps:10,playback:'forward',loop:true},generation:1});
  clock.advance(10000); rt.tick(); expect(rt.snapshot().elapsedMs).toBe(250);
 });
 it('samples reverse and endpoint completion deterministically',()=>{
  expect(sampleTimeline(0,3,10,'reverse',false).frameIndex).toBe(2);
  expect(sampleTimeline(300,3,10,'reverse',false).completed).toBe(true);
 });
});
