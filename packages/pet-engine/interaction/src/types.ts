export type Point = Readonly<{ x: number; y: number }>;
export type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;

export type PointerPhase = 'idle' | 'pressed' | 'dragging';

export type PointerInput = Readonly<{
  pointerId: number;
  screen: Point;
  monotonicMs: number;
  button: number;
}>;

export type GestureProfile = Readonly<{
  dragThresholdPx: number;
  clickMaxDurationMs: number;
  doubleClickWindowMs: number;
  doubleClickDistancePx: number;
}>;

export type DragSession = Readonly<{
  id: string;
  pointerId: number;
  startedAtMonotonicMs: number;
  pointerOrigin: Point;
  latestPointer: Point;
  windowOrigin: Point;
  grabOffset: Point;
}>;

export type InteractionSnapshot = Readonly<{
  phase: PointerPhase;
  generation: number;
  activePointerId?: number;
  pressOrigin?: Point;
  pressStartedAtMonotonicMs?: number;
  drag?: DragSession;
  lastClick?: Readonly<{ point: Point; monotonicMs: number }>;
}>;

export type InteractionAction =
  | Readonly<{ type: 'POINTER_CAPTURED'; pointerId: number }>
  | Readonly<{ type: 'CLICKED'; point: Point }>
  | Readonly<{ type: 'DOUBLE_CLICKED'; point: Point }>
  | Readonly<{ type: 'DRAG_STARTED'; session: DragSession }>
  | Readonly<{ type: 'DRAG_MOVED'; session: DragSession; windowTopLeft: Point }>
  | Readonly<{ type: 'DRAG_ENDED'; session: DragSession; windowTopLeft: Point; releasePoint: Point }>
  | Readonly<{ type: 'POINTER_CANCELED'; reason: string }>;

export type InteractionResult = Readonly<{
  snapshot: InteractionSnapshot;
  actions: readonly InteractionAction[];
}>;

export type SettlePlan = Readonly<{
  generation: number;
  startedAtMonotonicMs: number;
  durationMs: number;
  from: Point;
  to: Point;
}>;
