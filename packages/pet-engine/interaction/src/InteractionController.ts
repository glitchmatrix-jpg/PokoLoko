import type {
  GestureProfile,
  InteractionAction,
  InteractionResult,
  InteractionSnapshot,
  PointerInput,
  Point,
  Rect,
} from './types.js';

const DEFAULT_PROFILE: GestureProfile = {
  dragThresholdPx: 6,
  clickMaxDurationMs: 280,
  doubleClickWindowMs: 360,
  doubleClickDistancePx: 12,
};

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function finitePoint(point: Point, label: string): void {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new Error(`${label} must contain finite coordinates.`);
  }
}

export class InteractionController {
  private snapshotValue: InteractionSnapshot = { phase: 'idle', generation: 0 };
  private sessionCounter = 0;

  public constructor(private readonly profile: GestureProfile = DEFAULT_PROFILE) {
    if (profile.dragThresholdPx < 0 || profile.clickMaxDurationMs < 0 || profile.doubleClickWindowMs < 0) {
      throw new Error('Gesture timing and distance values must be non-negative.');
    }
  }

  public snapshot(): InteractionSnapshot {
    return this.snapshotValue;
  }

  public pointerDown(input: PointerInput, windowBounds: Rect): InteractionResult {
    finitePoint(input.screen, 'pointerDown.screen');
    if (input.button !== 0 || this.snapshotValue.phase !== 'idle') {
      return { snapshot: this.snapshotValue, actions: [] };
    }
    this.snapshotValue = {
      ...this.snapshotValue,
      phase: 'pressed',
      generation: this.snapshotValue.generation + 1,
      activePointerId: input.pointerId,
      pressOrigin: input.screen,
      pressStartedAtMonotonicMs: input.monotonicMs,
      drag: undefined,
    };
    return { snapshot: this.snapshotValue, actions: [{ type: 'POINTER_CAPTURED', pointerId: input.pointerId }] };
  }

  public pointerMove(input: PointerInput, windowBounds: Rect): InteractionResult {
    finitePoint(input.screen, 'pointerMove.screen');
    const current = this.snapshotValue;
    if (current.activePointerId !== input.pointerId) return { snapshot: current, actions: [] };

    if (current.phase === 'pressed' && current.pressOrigin) {
      if (distance(current.pressOrigin, input.screen) < this.profile.dragThresholdPx) {
        return { snapshot: current, actions: [] };
      }
      const session = {
        id: `drag-${current.generation}-${++this.sessionCounter}`,
        pointerId: input.pointerId,
        startedAtMonotonicMs: input.monotonicMs,
        pointerOrigin: current.pressOrigin,
        latestPointer: input.screen,
        windowOrigin: { x: windowBounds.x, y: windowBounds.y },
        grabOffset: { x: current.pressOrigin.x - windowBounds.x, y: current.pressOrigin.y - windowBounds.y },
      } as const;
      this.snapshotValue = { ...current, phase: 'dragging', drag: session };
      return {
        snapshot: this.snapshotValue,
        actions: [
          { type: 'DRAG_STARTED', session },
          {
            type: 'DRAG_MOVED',
            session,
            windowTopLeft: { x: input.screen.x - session.grabOffset.x, y: input.screen.y - session.grabOffset.y },
          },
        ],
      };
    }

    if (current.phase === 'dragging' && current.drag) {
      const session = { ...current.drag, latestPointer: input.screen };
      this.snapshotValue = { ...current, drag: session };
      return {
        snapshot: this.snapshotValue,
        actions: [{
          type: 'DRAG_MOVED',
          session,
          windowTopLeft: { x: input.screen.x - session.grabOffset.x, y: input.screen.y - session.grabOffset.y },
        }],
      };
    }

    return { snapshot: current, actions: [] };
  }

  public pointerUp(input: PointerInput, windowBounds: Rect): InteractionResult {
    finitePoint(input.screen, 'pointerUp.screen');
    const current = this.snapshotValue;
    if (current.activePointerId !== input.pointerId) return { snapshot: current, actions: [] };
    const actions: InteractionAction[] = [];

    if (current.phase === 'dragging' && current.drag) {
      const session = { ...current.drag, latestPointer: input.screen };
      actions.push({
        type: 'DRAG_ENDED',
        session,
        releasePoint: input.screen,
        windowTopLeft: { x: input.screen.x - session.grabOffset.x, y: input.screen.y - session.grabOffset.y },
      });
    } else if (current.phase === 'pressed' && current.pressOrigin && current.pressStartedAtMonotonicMs !== undefined) {
      const elapsed = input.monotonicMs - current.pressStartedAtMonotonicMs;
      const moved = distance(current.pressOrigin, input.screen);
      if (elapsed <= this.profile.clickMaxDurationMs && moved < this.profile.dragThresholdPx) {
        const previous = current.lastClick;
        const isDouble = Boolean(
          previous &&
          input.monotonicMs - previous.monotonicMs <= this.profile.doubleClickWindowMs &&
          distance(previous.point, input.screen) <= this.profile.doubleClickDistancePx,
        );
        actions.push(isDouble ? { type: 'DOUBLE_CLICKED', point: input.screen } : { type: 'CLICKED', point: input.screen });
        this.snapshotValue = {
          phase: 'idle',
          generation: current.generation,
          lastClick: isDouble ? undefined : { point: input.screen, monotonicMs: input.monotonicMs },
        };
        return { snapshot: this.snapshotValue, actions };
      }
    }

    this.snapshotValue = {
      phase: 'idle',
      generation: current.generation,
      ...(current.lastClick ? { lastClick: current.lastClick } : {}),
    };
    return { snapshot: this.snapshotValue, actions };
  }

  public cancel(reason: string): InteractionResult {
    const current = this.snapshotValue;
    if (current.phase === 'idle') return { snapshot: current, actions: [] };
    this.snapshotValue = {
      phase: 'idle',
      generation: current.generation + 1,
      ...(current.lastClick ? { lastClick: current.lastClick } : {}),
    };
    return { snapshot: this.snapshotValue, actions: [{ type: 'POINTER_CANCELED', reason }] };
  }
}
