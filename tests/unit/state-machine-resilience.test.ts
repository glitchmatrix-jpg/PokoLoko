import { describe, expect, it } from 'vitest';
import { PetStateMachine } from '../../packages/pet-engine/state-machine/src/PetStateMachine.js';

describe('state-machine resilience',()=>{
 it('rejects illegal transitions with an inspectable reason',()=>{
  const machine=new PetStateMachine('poko');
  const result=machine.request({requestId:'bad',reason:'test',target:{kind:'activity',activityId:'laptop',propId:'laptop'},monotonicMs:1});
  expect(result.log.accepted).toBe(false); expect(result.log.fallback).toBeTruthy();
 });
 it('ignores stale completion events',()=>{
  const machine=new PetStateMachine('poko');
  const accepted=machine.request({requestId:'boot',reason:'ready',target:{kind:'idle_front'},monotonicMs:1});
  const before=machine.snapshot(); machine.complete({type:'ANIMATION_COMPLETED',generation:accepted.snapshot.generation-1,monotonicMs:2});
  expect(machine.snapshot()).toEqual(before);
 });
 it('character replacement and forced recovery remove props',()=>{
  const machine=new PetStateMachine('loko'); machine.replaceCharacter('poko',10); expect(machine.snapshot().prop.kind).toBe('none');
  machine.forceRecovery('display-loss',20); expect(machine.snapshot().state).toBe('system.recovering'); expect(machine.snapshot().prop.kind).toBe('none');
 });
});
