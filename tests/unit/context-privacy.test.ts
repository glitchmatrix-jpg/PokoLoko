import { describe, expect, it } from 'vitest';
import { BooleanHysteresis } from '../../packages/pet-engine/context/src/hysteresis.js';
import { ContextSensor } from '../../packages/pet-engine/context/src/ContextSensor.js';

describe('context privacy and hysteresis',()=>{
 it('uses separate enter and exit thresholds',()=>{const h=new BooleanHysteresis(2,3); expect(h.update(true)).toBe(false); expect(h.update(true)).toBe(true); expect(h.update(false)).toBe(true); expect(h.update(false)).toBe(true); expect(h.update(false)).toBe(false);});
 it('clears all ephemeral information immediately when disabled',()=>{
  let now=100; const provider={sample:()=>({wallClockHour:12,cursor:{x:10,y:10},systemIdleSeconds:90,fullscreenActive:true}),availability:()=>({typingPresence:'disabled' as const,mouseActivity:'available' as const,systemIdle:'available' as const,timeOfDay:'available' as const,audioState:'disabled' as const,fullscreenState:'available' as const,lockAndResume:'available' as const,recentPetInteraction:'available' as const})};
  const sensor=new ContextSensor(provider,{monotonicMs:()=>now},{enabled:true}); sensor.notePetInteraction(); const off=sensor.updateSettings({enabled:false}); expect(off.enabled).toBe(false); expect(off.recentPetInteraction).toBe('none'); expect(Object.values(off.availability).every(v=>v==='disabled')).toBe(true);
 });
});
