# Window and Movement Audit

## Proven native behaviors

The source demonstrates correct use of several Electron APIs:

- transparent frameless `BrowserWindow`;
- hidden taskbar entry;
- always-on-top level `floating`;
- `showInactive()` startup;
- work-area-based floor calculation;
- display matching for movement;
- nearest-display selection during drag;
- display-change and display-removal repositioning;
- tray-owned app lifetime.

These are reusable design references, not modules to transplant unchanged.

## Coordinate model

The current system conflates four coordinate spaces:

1. Screen coordinates from pointer events (`event.screenX/Y`).
2. Native pet-window top-left coordinates.
3. The 180 × 180 renderer stage.
4. A 128 × 128 sprite image bottom-centered with CSS.

No numerical animation anchors are used. The actual character ground point varies invisibly inside the 128 × 128 image, but the window floor is calculated from the full 180 px window. The sprite receives 4 px bottom padding, so visual ground is offset from native work-area ground by CSS rather than explicit metadata.

## Locomotion

`startWalking()`:

1. Selects the display matching current window bounds.
2. Chooses a uniform random target X within the display work area, accounting for full 180 px window width.
3. Chooses left/right coarse state.
4. Starts a 16 ms `setInterval`.
5. Uses elapsed wall-clock time with a maximum delta of 50 ms.
6. Reads integer native bounds every tick.
7. Computes a floating step but sends a rounded X position.
8. Recalculates floor Y from the display matching the current window each tick.
9. Stops exactly at target and jumps to `IDLE`.

### Movement defects

- Internal position is not retained as floating point; every tick starts from rounded native bounds, causing quantization and speed irregularity, especially at 48 px/s.
- Native `setPosition()` at ~60 Hz can be expensive and may stutter depending on Windows compositor behavior.
- No acceleration, deceleration, start, stop, or turn choreography.
- Target is scoped to one display and cannot naturally cross monitors.
- Target is based on window width, not visible-pet bounds or anchor.
- Direction cannot change during a walk except interruption.
- Screen-edge and destination events are not modeled separately.
- The walk animation FPS has no relationship to physical speed or stride.
- A display topology change clamps the window but does not cancel/replan the current target closure.
- `floorY()` may switch displays based on a window straddling displays, producing vertical jumps.

## Work-area and taskbar handling

`floorY()` uses `display.workArea`, which is the correct baseline for avoiding the taskbar. `BOTTOM_GAP` is zero. The visible sprite is not aligned to a manifest ground anchor, so avoiding native overlap does not guarantee perceptual grounding.

The display listeners handle `display-metrics-changed` and `display-removed`, but not `display-added`. Metrics changes always snap the pet to the floor even if it was intentionally being dragged above the floor. Listeners are not removed, which is acceptable for the single app lifetime but unsuitable for modular controllers/tests.

## Dragging trace

1. Renderer records pointer-down screen coordinates and captures the pointer.
2. At 6 px displacement, renderer sends `drag:start` with the original pointer-down point.
3. Main clears timers, computes offset from current native top-left, and sets `DRAGGED`.
4. Renderer sends every pointer move over IPC.
5. Main chooses display nearest the pointer, clamps the entire 180 × 180 window to that display work area, and calls `setPosition()`.
6. On release/cancel, renderer sends `drag:end`.
7. Main snaps native window to floor, sets `LANDING`, and starts an 850 ms behavior timer.

### Drag defects

- The entire 180 × 180 transparent stage receives pointer input; hit testing is not based on visible alpha or a tight body mask.
- Drag start uses the original pointer-down point after threshold crossing, which can create an offset discontinuity if the native window moved for another reason.
- Pointer move IPC is unthrottled and unsequenced.
- No drag session ID prevents stale move/end events.
- Clamping to the nearest pointer display can cause a jump at monitor boundaries.
- Release always snaps vertically to floor; there is no visible falling/settling travel.
- `LANDING` completion is fixed-time, not animation-driven.
- Dragging during renderer-only transitions has no authoritative cancellation/recovery semantics.
- A pointer cancel calls `drag:end`, which is reasonable, but renderer/main state can diverge if IPC delivery fails.

## Always-on-top and full-screen behavior

The pet is visible on all workspaces with `visibleOnFullScreen: true`. This may be intrusive over games, movies, presentations, and full-screen work. There is no quiet/fullscreen policy. `alwaysOnTop` toggles the native level but does not change all-workspace/fullscreen visibility.

## Window focus and click blocking

The pet window is focusable. Clicking it can take focus from the user's active application. `showInactive()` prevents startup focus theft only. The full transparent window can intercept clicks in its 180 × 180 rectangle. There is no click-through outside visible pixels and no dynamic window resizing/masking.

## Decision

- Native API choices: **KEEP as reference**.
- Current movement loop: **REPLACE**.
- Current drag protocol: **REPLACE**.
- Current window geometry/ground model: **REPLACE**.
- Current full-screen visibility policy: **REPLACE** with optional quiet behavior.
