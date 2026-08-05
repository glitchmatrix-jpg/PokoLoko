import { describe, expect, it } from 'vitest';
import { ActivityController, SeededActivityRandom, getActivityDefinition, getCharacterActivities } from '../../packages/pet-engine/activities/src/index.js';

describe('activity framework', () => {
  it('rejects unsupported character activities', () => {
    const controller = new ActivityController(new SeededActivityRandom(1));
    const result = controller.start({ requestId: 'a', character: 'poko', activityId: 'laptop', currentState: 'stable.idle_front', currentPosture: 'standing_front', nowMs: 0 });
    expect(result.session).toBeNull();
    expect(result.commands[0]?.type).toBe('DIAGNOSTIC');
  });

  it('enters setup, loop, and exits a one-shot activity only after completion', () => {
    const controller = new ActivityController(new SeededActivityRandom(3));
    const started = controller.start({ requestId: 'ball', character: 'poko', activityId: 'playing_ball', currentState: 'stable.idle_front', currentPosture: 'standing_front', nowMs: 0 });
    const g = started.session!.generation;
    const setup = controller.handle({ type: 'STATE_READY', state: 'activity.playing_ball', generation: g, nowMs: 10 });
    expect(setup.session?.phase).toBe('setup');
    const loop = controller.handle({ type: 'ANIMATION_COMPLETED', animationId: 'setup', generation: g, nowMs: 20 });
    expect(loop.session?.phase).toBe('loop');
    const exit = controller.handle({ type: 'ANIMATION_COMPLETED', animationId: 'poko_playing_ball', generation: g, nowMs: 2000 });
    expect(exit.session?.phase).toBe('exit');
  });

  it('defers soft/deferred interruption until safe boundary', () => {
    const controller = new ActivityController(new SeededActivityRandom(8));
    const started = controller.start({ requestId: 'read', character: 'loko', activityId: 'reading', currentState: 'stable.sitting', currentPosture: 'sitting', nowMs: 0 });
    const g = started.session!.generation;
    controller.handle({ type: 'STATE_READY', state: 'activity.reading', generation: g, nowMs: 1 });
    controller.handle({ type: 'ANIMATION_COMPLETED', animationId: 'setup', generation: g, nowMs: 2 });
    const deferred = controller.handle({ type: 'INTERRUPT', reason: 'fullscreen_quiet', generation: g, nowMs: 3 });
    expect(deferred.session?.phase).toBe('loop');
    expect(deferred.session?.pendingInterruption?.reason).toBe('fullscreen_quiet');
    const exiting = controller.handle({ type: 'ANIMATION_MARKER', animationId: 'loko_reading_01', marker: 'page_rest', generation: g, nowMs: 4 });
    expect(exiting.session?.phase).toBe('exit');
  });

  it('drag immediately invalidates an activity and clears its prop', () => {
    const controller = new ActivityController(new SeededActivityRandom(5));
    const started = controller.start({ requestId: 'laptop', character: 'loko', activityId: 'laptop', currentState: 'stable.sitting', currentPosture: 'sitting', nowMs: 0 });
    const g = started.session!.generation;
    controller.handle({ type: 'STATE_READY', state: 'activity.laptop', generation: g, nowMs: 1 });
    controller.handle({ type: 'ANIMATION_COMPLETED', animationId: 'setup', generation: g, nowMs: 2 });
    const recovery = controller.handle({ type: 'INTERRUPT', reason: 'drag', generation: g, nowMs: 3 });
    expect(recovery.session?.phase).toBe('recovery');
    expect(recovery.session?.propVisible).toBe(false);
    expect(recovery.commands.some((x) => x.type === 'SET_PROP' && x.action === 'remove')).toBe(true);
  });

  it('ignores stale activity events', () => {
    const controller = new ActivityController(new SeededActivityRandom(5));
    const started = controller.start({ requestId: 'music', character: 'poko', activityId: 'music', currentState: 'stable.idle_front', currentPosture: 'standing_front', nowMs: 0 });
    const result = controller.handle({ type: 'ANIMATION_COMPLETED', animationId: 'poko_music', generation: started.session!.generation - 1, nowMs: 1 });
    expect(result.session?.phase).toBe('entry');
    expect(result.commands[0]?.type).toBe('DIAGNOSTIC');
  });

  it('registry contains all approved personality activities', () => {
    expect(getCharacterActivities('poko').map((x) => x.id).sort()).toEqual(['drink', 'eat', 'music', 'peeking', 'playing_ball']);
    expect(getCharacterActivities('loko').map((x) => x.id).sort()).toEqual(['drink', 'eat', 'laptop', 'music', 'peeking', 'playing_ball', 'reading']);
    expect(getActivityDefinition('loko', 'laptop')?.prop.ownership).toBe('composite_frame');
  });
});
