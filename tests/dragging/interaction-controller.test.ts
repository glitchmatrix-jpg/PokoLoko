import { describe, expect, it } from 'vitest';
import { InteractionController } from '../../packages/pet-engine/interaction/src';

const bounds = { x: 100, y: 200, width: 160, height: 160 };
const input = (x: number, y: number, monotonicMs: number, pointerId = 1) => ({
  pointerId,
  screen: { x, y },
  monotonicMs,
  button: 0,
});

describe('InteractionController', () => {
  it('distinguishes a click from a drag', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 220, 0), bounds);
    const moved = controller.pointerMove(input(123, 223, 50), bounds);
    expect(moved.actions).toHaveLength(0);
    const released = controller.pointerUp(input(123, 223, 100), bounds);
    expect(released.actions[0]?.type).toBe('CLICKED');
  });

  it('starts drag only after threshold and preserves grab offset', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 230, 0), bounds);
    const result = controller.pointerMove(input(140, 260, 40), bounds);
    expect(result.actions.map((action) => action.type)).toEqual(['DRAG_STARTED', 'DRAG_MOVED']);
    const moved = result.actions[1];
    expect(moved?.type).toBe('DRAG_MOVED');
    if (moved?.type === 'DRAG_MOVED') expect(moved.windowTopLeft).toEqual({ x: 120, y: 230 });
  });

  it('keeps the window attached during cross-monitor coordinates', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 230, 0), bounds);
    controller.pointerMove(input(140, 260, 40), bounds);
    const result = controller.pointerMove(input(-400, 500, 80), bounds);
    const moved = result.actions[0];
    expect(moved?.type).toBe('DRAG_MOVED');
    if (moved?.type === 'DRAG_MOVED') expect(moved.windowTopLeft).toEqual({ x: -420, y: 470 });
  });

  it('emits one drag end and returns idle', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 230, 0), bounds);
    controller.pointerMove(input(140, 260, 40), bounds);
    const result = controller.pointerUp(input(200, 300, 90), bounds);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0]?.type).toBe('DRAG_ENDED');
    expect(result.snapshot.phase).toBe('idle');
  });

  it('recognizes a bounded double click', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 220, 0), bounds);
    controller.pointerUp(input(120, 220, 80), bounds);
    controller.pointerDown(input(122, 221, 200), bounds);
    const result = controller.pointerUp(input(122, 221, 260), bounds);
    expect(result.actions[0]?.type).toBe('DOUBLE_CLICKED');
  });

  it('ignores a second pointer while one is active', () => {
    const controller = new InteractionController();
    controller.pointerDown(input(120, 220, 0, 1), bounds);
    const result = controller.pointerMove(input(200, 300, 30, 2), bounds);
    expect(result.actions).toHaveLength(0);
    expect(result.snapshot.activePointerId).toBe(1);
  });
});
