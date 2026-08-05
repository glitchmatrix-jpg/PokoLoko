import { describe, expect, it } from 'vitest';
import { SeededRandom, createInitialMind, createSessionMemory, rememberActivity, rememberDisturbance, rememberRegion, updateMind } from '../../packages/pet-engine/behavior/src/index.js';

describe('behavior, mind, memory, seeded randomness',()=>{
 it('repeats seeded randomness exactly',()=>{
  const a=new SeededRandom(123), b=new SeededRandom(123); expect(Array.from({length:20},()=>a.next())).toEqual(Array.from({length:20},()=>b.next()));
 });
 it('clamps mind values and decays attention',()=>{
  let mind=createInitialMind('poko'); mind=updateMind(mind,{type:'interaction',intensity:'high'}); const raised=mind.recentAttention;
  mind=updateMind(mind,{type:'tick',elapsedMs:300000,activeKind:'remain_idle',context:{typingActivity:'none',pointerActivity:'none',systemIdle:false,audioActive:false,fullscreenActive:false,screenLocked:false,localTimeBand:'day',recentUserInteraction:'none',enabled:false}});
  expect(mind.recentAttention).toBeLessThan(raised); for(const key of ['energy','boredom','curiosity','focus','playfulness','recentAttention','interruptionLoad'] as const) expect(mind[key]).toBeGreaterThanOrEqual(0);
 });
 it('bounds session history and disturbance window',()=>{
  let memory=createSessionMemory(); for(let i=0;i<30;i+=1) memory=rememberActivity(memory,'walk',i); expect(memory.recentActivities).toHaveLength(12);
  for(let i=0;i<20;i+=1) memory=rememberRegion(memory,i%2?'left':'right'); expect(memory.recentRegions).toHaveLength(8);
  memory=rememberDisturbance(memory,0); memory=rememberDisturbance(memory,400000); expect(memory.disturbances).toEqual([400000]);
 });
});
