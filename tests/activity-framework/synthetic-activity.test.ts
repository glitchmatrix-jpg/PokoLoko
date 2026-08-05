import { describe, expect, it } from 'vitest';
import { ActivityController, SeededActivityRandom } from '../../packages/pet-engine/activities/src/index.js';

describe('synthetic lifecycle behavior using approved music activity', () => {
  it('same seed produces the same bounded duration', () => {
    const request = { requestId: 'x', character: 'poko' as const, activityId: 'music' as const, currentState: 'stable.idle_front', currentPosture: 'standing_front', nowMs: 100 };
    const a = new ActivityController(new SeededActivityRandom(123)).start(request).session;
    const b = new ActivityController(new SeededActivityRandom(123)).start(request).session;
    expect(a?.plannedEndAtMs).toBe(b?.plannedEndAtMs);
  });

  it('duration elapse waits for loop boundary', () => {
    const c = new ActivityController(new SeededActivityRandom(123));
    const s = c.start({ requestId: 'x', character: 'poko', activityId: 'music', currentState: 'stable.idle_front', currentPosture: 'standing_front', nowMs: 0 }).session!;
    c.handle({ type: 'STATE_READY', state: 'activity.music', generation: s.generation, nowMs: 1 });
    c.handle({ type: 'ANIMATION_COMPLETED', animationId: 'setup', generation: s.generation, nowMs: 2 });
    const waiting = c.handle({ type: 'DURATION_ELAPSED', generation: s.generation, nowMs: 20_000 });
    expect(waiting.session?.phase).toBe('loop');
    const exit = c.handle({ type: 'LOOP_BOUNDARY', animationId: 'poko_music', generation: s.generation, nowMs: 20_100 });
    expect(exit.session?.phase).toBe('exit');
  });
});
