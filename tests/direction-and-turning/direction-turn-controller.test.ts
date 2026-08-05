import { describe, expect, it } from 'vitest';
import { DirectionTurnController } from '../../packages/pet-engine/direction/src';

describe('DirectionTurnController', () => {
  it('starts translation immediately when already facing the requested direction', () => {
    const controller = new DirectionTurnController('right', { neutralHoldMs: 120, hasPreparation: false });
    const result = controller.requestMove('right', 400, false, 1000);
    expect(result.actions).toEqual([
      { type: 'START_TRANSLATION', direction: 'right', destinationX: 400, generation: 1 },
    ]);
    expect(result.snapshot.phase).toBe('walking');
  });

  it('waits for a gait boundary before reversing while moving', () => {
    const controller = new DirectionTurnController('right', { neutralHoldMs: 120, hasPreparation: false });
    controller.markWalking('right');
    const request = controller.requestMove('left', 100, true, 1000);
    expect(request.snapshot.phase).toBe('waiting_gait_boundary');
    expect(request.actions[0]?.type).toBe('WAIT_FOR_GAIT_BOUNDARY');

    const boundary = controller.onGaitBoundary(1100);
    expect(boundary.actions.map((action) => action.type)).toEqual(['STOP_TRANSLATION', 'PLAY_NEUTRAL_HOLD']);
    expect(boundary.snapshot.phase).toBe('neutral_hold');

    expect(controller.tick(1219).actions).toHaveLength(0);
    const turn = controller.tick(1220);
    expect(turn.actions).toEqual([
      { type: 'COMMIT_DIRECTION', direction: 'left', generation: 1 },
      { type: 'START_TRANSLATION', direction: 'left', destinationX: 100, generation: 1 },
    ]);
  });

  it('uses preparation before Loko begins translation', () => {
    const controller = new DirectionTurnController('right', { neutralHoldMs: 180, hasPreparation: true });
    const request = controller.requestMove('right', 500, false, 2000);
    expect(request.actions[0]?.type).toBe('PLAY_PREPARATION');
    expect(request.snapshot.phase).toBe('preparing');

    const completed = controller.onPreparationCompleted();
    expect(completed.actions).toEqual([
      { type: 'START_TRANSLATION', direction: 'right', destinationX: 500, generation: 1 },
    ]);
  });

  it('retargets without restarting when direction remains unchanged', () => {
    const controller = new DirectionTurnController('left', { neutralHoldMs: 120, hasPreparation: false });
    controller.markWalking('left');
    const result = controller.requestMove('left', -200, true, 3000);
    expect(result.actions[0]).toEqual({
      type: 'RETARGET_TRANSLATION',
      direction: 'left',
      destinationX: -200,
      generation: 1,
    });
  });

  it('invalidates pending choreography when interrupted', () => {
    const controller = new DirectionTurnController('right', { neutralHoldMs: 120, hasPreparation: false });
    controller.requestMove('left', 100, false, 0);
    const before = controller.snapshot().generation;
    controller.interrupt();
    expect(controller.snapshot().phase).toBe('idle');
    expect(controller.snapshot().generation).toBe(before + 1);
    expect(controller.tick(500).actions).toHaveLength(0);
  });
});
