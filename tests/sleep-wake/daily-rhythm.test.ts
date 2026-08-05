import { describe, expect, it } from 'vitest';
import { isHourInQuietRange, scoreSleepEligibility } from '../../packages/pet-engine/sleep/src/index.js';

const settings={dailyRhythmEnabled:true,quietHoursEnabled:true,quietHoursStart:23,quietHoursEnd:7} as const;
const base={energy:.2,wakeDurationMs:500_000,timeBand:'late_night',systemIdle:true,quietMode:false,screenLocked:false,recentHighInteraction:false} as const;

describe('daily rhythm',()=>{
 it('supports overnight quiet ranges',()=>{
  expect(isHourInQuietRange(1,23,7)).toBe(true);
  expect(isHourInQuietRange(15,23,7)).toBe(false);
 });
 it('increases likelihood without forcing sleep',()=>{
  const sleepy=scoreSleepEligibility('loko',base,settings,1);
  expect(sleepy.eligible).toBe(true);
  const awake=scoreSleepEligibility('loko',{...base,energy:.9,systemIdle:false,timeBand:'day'},settings,14);
  expect(awake.score).toBeLessThan(sleepy.score);
 });
 it('enforces post-wake protection',()=>{
  const protectedResult=scoreSleepEligibility('poko',{...base,wakeDurationMs:30_000},settings,1);
  expect(protectedResult.eligible).toBe(false);
  expect(protectedResult.reasons[0]).toContain('post-wake');
 });
});
