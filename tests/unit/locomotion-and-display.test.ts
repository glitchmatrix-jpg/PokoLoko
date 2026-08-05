import { describe, expect, it } from 'vitest';
import { LocomotionEngine } from '../../packages/pet-engine/locomotion/src/LocomotionEngine.js';
import { computeGroundXRange, computeStaticPetGeometry, selectNearestWorkArea } from '../../electron/services/display-grounding.js';
import { createLocomotionProfile } from '../../packages/pet-engine/locomotion/src/profiles.js';

describe('locomotion and display geometry',()=>{
 it('clamps destinations and reaches the legal threshold',()=>{
  const e=new LocomotionEngine(); const profile=createLocomotionProfile('poko','balanced');
  const start=e.start({generation:1,positionX:50,destinationX:999,bounds:{minimumX:0,maximumX:100},profile,monotonicMs:0});
  expect(start.snapshot.destinationX).toBe(100); let result=start;
  for(let t=16;t<=5000 && result.snapshot.active;t+=16) result=e.tick(t,{minimumX:0,maximumX:100});
  expect(result.snapshot.positionX).toBe(100); expect(result.events.some(x=>x.type==='DESTINATION_REACHED')).toBe(true);
 });
 it('retargets direction without coordinate corruption',()=>{
  const e=new LocomotionEngine(); e.start({generation:2,positionX:50,destinationX:90,bounds:{minimumX:0,maximumX:100},profile:createLocomotionProfile('loko','balanced'),monotonicMs:0});
  const r=e.retarget(10,{minimumX:0,maximumX:100},20); expect(r.snapshot.direction).toBe('left'); expect(r.snapshot.destinationX).toBe(10);
 });
 it('keeps the authored anchor grounded on mixed-origin work areas',()=>{
  const area={x:-1920,y:-240,width:1920,height:1200}; const layout={canvasSize:128 as const,scale:2 as const,margin:8,bottomClearance:4,anchor:{x:64,y:116}};
  const geometry=computeStaticPetGeometry(area,layout,-3000); const range=computeGroundXRange(area,layout);
  expect(geometry.groundPoint.x).toBe(range.minimumX); expect(geometry.groundPoint.y).toBe(956);
 });
 it('selects nearest display deterministically',()=>expect(selectNearestWorkArea({x:1200,y:300},[{x:0,y:0,width:1000,height:800},{x:1000,y:0,width:1000,height:800}]).x).toBe(1000));
});
