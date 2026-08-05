import { describe, expect, it } from 'vitest';
import { SleepLifecycleController } from '../../packages/pet-engine/sleep/src/index.js';

describe('SleepLifecycleController', () => {
  it('waits for entry completion before starting sleep loop', () => {
    const controller = new SleepLifecycleController('poko', 0);
    const start = controller.handle({ type:'REQUEST_SLEEP', trigger:'planner', monotonicMs:1_000, plannedDurationMs:120_000 });
    expect(start.snapshot.phase).toBe('entry');
    expect(start.commands.some(c => c.kind==='play_animation' && c.animationId==='poko_sleep_transition')).toBe(true);
    const before = controller.handle({ type:'SLEEP_DEADLINE_REACHED', generation:start.snapshot.generation, monotonicMs:2_000 });
    expect(before.ignoredReason).toContain('sleeping phase');
    const loop = controller.handle({ type:'ANIMATION_COMPLETED', animationId:'poko_sleep_transition', generation:start.snapshot.generation, monotonicMs:2_400 });
    expect(loop.snapshot.phase).toBe('sleeping');
    expect(loop.commands.some(c => c.kind==='play_animation' && c.animationId==='poko_sleep_loop_02' && c.loop)).toBe(true);
  });

  it('ignores stale entry completion', () => {
    const controller = new SleepLifecycleController('loko', 0);
    const start = controller.handle({ type:'REQUEST_SLEEP', trigger:'planner', monotonicMs:10, plannedDurationMs:300_000 });
    const stale = controller.handle({ type:'ANIMATION_COMPLETED', animationId:'loko_sleep_transition', generation:start.snapshot.generation-1, monotonicMs:20 });
    expect(stale.snapshot.phase).toBe('entry');
    expect(stale.ignoredReason).toContain('stale');
  });

  it('uses Poko reverse entry wake and completes only after hold', () => {
    const c = new SleepLifecycleController('poko');
    const s = c.handle({type:'REQUEST_SLEEP',trigger:'planner',monotonicMs:0,plannedDurationMs:100_000});
    c.handle({type:'ANIMATION_COMPLETED',animationId:'poko_sleep_transition',generation:s.snapshot.generation,monotonicMs:1_500});
    const wake = c.handle({type:'REQUEST_WAKE',trigger:'user_click',monotonicMs:20_000});
    expect(wake.snapshot.phase).toBe('waking');
    expect(wake.commands.some(x=>x.kind==='play_animation' && x.playback==='reverse')).toBe(true);
    const hold = c.handle({type:'ANIMATION_COMPLETED',animationId:'poko_sleep_transition',generation:wake.snapshot.generation,monotonicMs:21_500});
    expect(hold.snapshot.phase).toBe('wake_hold');
    const done = c.handle({type:'HOLD_COMPLETED',generation:wake.snapshot.generation,monotonicMs:21_700});
    expect(done.snapshot.phase).toBe('awake');
    expect(done.commands.some(x=>x.kind==='enable_locomotion')).toBe(true);
  });

  it('uses Loko lying hold rather than unvalidated reverse', () => {
    const c = new SleepLifecycleController('loko');
    const s = c.handle({type:'REQUEST_SLEEP',trigger:'planner',monotonicMs:0,plannedDurationMs:300_000});
    c.handle({type:'ANIMATION_COMPLETED',animationId:'loko_sleep_transition',generation:s.snapshot.generation,monotonicMs:1_000});
    const wake = c.handle({type:'REQUEST_WAKE',trigger:'planner',monotonicMs:50_000});
    expect(wake.snapshot.phase).toBe('wake_hold');
    expect(wake.commands.some(x=>x.kind==='hold_frame' && x.animationId==='loko_sleep_loop')).toBe(true);
    expect(wake.commands.some(x=>x.kind==='play_animation' && x.playback==='reverse')).toBe(false);
  });

  it('drag interrupts sleep immediately without upright reaction', () => {
    const c = new SleepLifecycleController('poko');
    const s = c.handle({type:'REQUEST_SLEEP',trigger:'planner',monotonicMs:0,plannedDurationMs:100_000});
    c.handle({type:'ANIMATION_COMPLETED',animationId:'poko_sleep_transition',generation:s.snapshot.generation,monotonicMs:1_000});
    const drag = c.handle({type:'DRAG_STARTED',monotonicMs:2_000});
    expect(drag.snapshot.phase).toBe('recovery');
    expect(drag.commands.some(x=>x.kind==='request_state' && x.target==='drag')).toBe(true);
    expect(drag.commands.some(x=>x.kind==='enable_locomotion')).toBe(false);
  });

  it('suspend/resume preserves settled sleep without catch-up racing', () => {
    const c = new SleepLifecycleController('loko');
    const s = c.handle({type:'REQUEST_SLEEP',trigger:'planner',monotonicMs:0,plannedDurationMs:300_000});
    c.handle({type:'ANIMATION_COMPLETED',animationId:'loko_sleep_transition',generation:s.snapshot.generation,monotonicMs:1_000});
    c.handle({type:'SUSPEND',monotonicMs:2_000});
    const resumed = c.handle({type:'SYSTEM_RESUMED',monotonicMs:8_000_000});
    expect(resumed.snapshot.phase).toBe('sleeping');
    expect(resumed.commands).toHaveLength(1);
    expect(resumed.commands[0]?.kind).toBe('play_animation');
  });
});
