import { describe, expect, it } from 'vitest';
import { PetStateMachine } from '../../packages/pet-engine/state-machine/src/index.js';

const req = (target: Parameters<PetStateMachine['request']>[0]['target'], time: number, id='r') => ({requestId:id,target,reason:'test',monotonicMs:time});

describe('PetStateMachine', () => {
  it('boots through an explicit idle state', () => {
    const m = new PetStateMachine('poko');
    expect(m.request(req({kind:'idle'}, 1)).snapshot.state).toBe('stable.idle_front');
  });

  it('routes front idle to walking through neutral side and walk-start transitions', () => {
    const m = new PetStateMachine('poko');
    m.request(req({kind:'idle'},1));
    const start=m.request(req({kind:'walk',direction:'right'},2));
    expect(start.log.route).toEqual(['transition.neutral_bridge','stable.idle_side','transition.walk_start','movement.walking']);
    let s=m.complete({type:'ANIMATION_COMPLETED',generation:start.snapshot.generation,monotonicMs:3});
    expect(s.state).toBe('transition.walk_start');
    s=m.complete({type:'ANIMATION_COMPLETED',generation:start.snapshot.generation,monotonicMs:4});
    expect(s.state).toBe('movement.walking');
  });

  it('ignores stale one-shot completions', () => {
    const m = new PetStateMachine('loko');
    m.request(req({kind:'idle'},1));
    const r=m.request(req({kind:'sleep'},2));
    const stale=m.complete({type:'ANIMATION_COMPLETED',generation:r.snapshot.generation-1,monotonicMs:3});
    expect(stale.state).toBe(r.snapshot.state);
  });

  it('forces prop-bearing activity through a safe exit before locomotion', () => {
    const m=new PetStateMachine('loko');
    m.request(req({kind:'idle'},1));
    const a=m.request(req({kind:'activity',activityId:'laptop',propId:'laptop'},2));
    let s=m.complete({type:'ANIMATION_COMPLETED',generation:a.snapshot.generation,monotonicMs:3});
    expect(s.state).toBe('activity.laptop');
    const walk=m.request(req({kind:'walk',direction:'right'},4));
    expect(walk.log.route[0]).toBe('transition.activity_exit');
    expect(walk.log.fallback).toBe('activity-prop-safe-exit');
  });

  it('rejects ordinary requests while a locked transition is active', () => {
    const m=new PetStateMachine('poko');
    m.request(req({kind:'idle'},1));
    m.request(req({kind:'sleep'},2));
    const rejected=m.request(req({kind:'walk',direction:'left'},3));
    expect(rejected.log.accepted).toBe(false);
    expect(rejected.log.fallback).toBe('locked-transition-must-complete');
  });

  it('allows immediate drag interruption and invalidates previous generation', () => {
    const m=new PetStateMachine('poko');
    m.request(req({kind:'idle'},1));
    const sleep=m.request(req({kind:'sleep'},2));
    const drag=m.request(req({kind:'drag'},3));
    expect(drag.snapshot.state).toBe('interaction.dragged');
    expect(drag.snapshot.generation).toBeGreaterThan(sleep.snapshot.generation);
    const stale=m.complete({type:'ANIMATION_COMPLETED',generation:sleep.snapshot.generation,monotonicMs:4});
    expect(stale.state).toBe('interaction.dragged');
  });

  it('recovers from drag through physical recovery completion', () => {
    const m=new PetStateMachine('loko');
    m.request(req({kind:'idle'},1));
    const drag=m.request(req({kind:'drag'},2));
    let state=m.complete({type:'DRAG_ENDED',generation:drag.snapshot.generation,monotonicMs:3});
    expect(state.state).toBe('transition.recovering');
    state=m.complete({type:'RECOVERY_COMPLETED',generation:drag.snapshot.generation,monotonicMs:4});
    expect(state.state).toBe('stable.idle_front');
  });

});
