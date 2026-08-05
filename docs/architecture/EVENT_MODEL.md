# PokoLoko — Event Model

## Event envelope

```ts
type EventEnvelope<TType extends string, TPayload> = {
  eventId: string;
  type: TType;
  payload: TPayload;
  source: "animation" | "locomotion" | "interaction" | "context" | "electron" | "settings" | "domain";
  monotonicMs: number;
  generation?: number;
  correlationId?: string;
};
```

Events are immutable and processed serially by the domain event queue.

## Required events

### Animation
- `ANIMATION_STARTED`
- `ANIMATION_MARKER_REACHED`
- `ANIMATION_LOOP_COMPLETED`
- `ANIMATION_COMPLETED`
- `ANIMATION_ASSET_FAILED`

Payload includes animation ID, playback generation, frame index, and marker name where applicable.

### Locomotion
- `LOCOMOTION_STARTED`
- `POSITION_UPDATED` (internal/high-frequency, not always IPC)
- `DESTINATION_REACHED`
- `SCREEN_EDGE_REACHED`
- `MOVEMENT_INTERRUPTED`
- `DISPLAY_BOUNDARY_CHANGED`

### Interaction
- `HOVER_STARTED`
- `HOVER_ENDED`
- `USER_CLICKED`
- `USER_DOUBLE_CLICKED`
- `REPEATED_CLICK_THRESHOLD`
- `DRAG_STARTED`
- `DRAG_MOVED`
- `DRAG_ENDED`
- `RIGHT_CLICKED`

### Context
- `CONTEXT_CHANGED`
- `SYSTEM_IDLE_CHANGED`
- `AUDIO_ACTIVITY_CHANGED`
- `FULLSCREEN_CHANGED`
- `LOCK_CHANGED`
- `SYSTEM_RESUMED`

Context payloads are coarse booleans/bands only.

### Domain/time
- `STATE_DEADLINE_REACHED`
- `BEHAVIOR_PLAN_DUE`
- `SLEEP_TIMER_ELAPSED`
- `COOLDOWN_EXPIRED`
- `RECOVERY_COMPLETED`

Deadlines are scheduled through a central monotonic scheduler, not chained arbitrary `setTimeout` calls.

### System/settings
- `CHARACTER_CHANGED`
- `DISPLAY_CHANGED`
- `DISPLAY_REMOVED`
- `SETTINGS_CHANGED`
- `PAUSE_REQUESTED`
- `RESUME_REQUESTED`
- `SUSPEND_REQUESTED`
- `SHUTDOWN_REQUESTED`
- `RENDERER_READY`
- `RENDERER_FAILED`

## Command model

Events describe facts. Commands request work:

```ts
type AnimationCommand =
  | { kind: "play"; animationId: string; generation: number; startFrame?: number }
  | { kind: "stop"; generation: number };

type MovementCommand =
  | { kind: "move_to"; destination: Point; speedProfileId: string; generation: number }
  | { kind: "stop"; generation: number };

type PresentationCommand = {
  kind: "present";
  presentation: PetPresentation;
};
```

Subsystems return events; they do not silently mutate domain truth.

## Event ordering

1. User/system events have priority over ordinary planning events.
2. Immediate interruption invalidates current activity/movement generations before new work begins.
3. Completion events from invalidated generations are ignored.
4. Events at equal timestamps use deterministic source priority:
   - shutdown/suspend;
   - drag;
   - display removal;
   - character/settings;
   - animation/locomotion completion;
   - context;
   - planner deadline.

## Idempotency

Completion and lifecycle events are idempotent by `(type, generation, correlationId)`. Duplicate events are logged and ignored.

## Stale async protection

Character switch, drag start, pause, suspend, and shutdown increment relevant generation counters. Any delayed callback carrying an old generation cannot alter the new state.

## Event log

Diagnostics retain a bounded ring buffer with:
- last 500 events;
- decision/rejection reason;
- generation;
- state before/after;
- no raw input content.

Production logging redacts paths and stores no context history beyond troubleshooting limits.
