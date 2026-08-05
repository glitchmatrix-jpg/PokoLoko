# PokoLoko — Locomotion Engine

## Scope

Step 10 adds deterministic horizontal destination movement. It does not add autonomous destination choice, turning choreography, dragging, or behavior planning. Movement can currently be exercised from the tray or typed IPC commands for QA.

## Ownership

- `LocomotionEngine` owns continuous floating-point ground-X, velocity, destination, elapsed movement time, and arrival.
- `StaticPetController` owns the Electron window adapter, current display, authoritative animation selection for the prototype, and event publication.
- `BrowserAnimationDriver` owns sprite-frame progression.
- React displays frames and does not receive movement ticks as React state.

The native window is moved rather than sliding the sprite inside a giant transparent window. This keeps hit testing and desktop obstruction bounded to the existing window while preserving a stable ground anchor.

## Movement model

The engine advances from monotonic delta time:

```text
position += velocity × deltaSeconds
```

Internal position remains floating point. Only the final native `BrowserWindow.setPosition()` call receives rounded coordinates. Rounded window coordinates never feed back into simulation state.

Acceleration is used for gentle starts. Braking speed is constrained by remaining distance:

```text
safeStoppingSpeed = sqrt(2 × deceleration × remainingDistance)
```

This avoids overshoot and prevents the zero-speed-before-arrival stall produced by simplistic braking. The final tick snaps exactly to the destination and sets velocity to zero, so there is no one-pixel oscillation.

## Scheduler gaps

Each locomotion tick caps consumed delta time at 50 ms. If Windows delays a callback for several seconds, Poko or Loko does not suddenly teleport through all missed distance. The simulation resumes smoothly from the last trusted position.

The 16 ms main-process interval is a wake-up mechanism, not the source of movement distance. Delta time remains authoritative.

## Work-area bounds

Destinations are clamped to the valid ground-X range derived from:

- current display work area;
- fixed 128×128 sprite canvas;
- safe integer scale;
- transparent margin;
- animation ground anchor.

The same geometry function places the native window, so locomotion and static grounding cannot disagree about taskbar clearance.

## Events

The engine emits:

- `DESTINATION_REACHED` exactly at stable arrival;
- `SCREEN_EDGE_REACHED` when the clamped destination is a work-area edge;
- `MOVEMENT_INTERRUPTED` once when active movement is canceled.

Every event contains a locomotion generation. Character changes, new destinations, and future drag interruptions prevent stale movement from committing.

## Display topology changes

During movement, display changes recompute the valid range and tick the engine against the refreshed work area. If the destination becomes invalid, it is clamped to a reachable edge. If movement ends during recovery, the controller restores the character's neutral idle asset.

Native Windows testing for monitor removal, mixed DPI, side taskbars, and auto-hidden taskbars remains deferred to the GitHub Actions EXE QA pass after Step 27.

## High-frequency performance

Movement ticks stay in Electron's main process. React receives only:

- animation/presentation changes;
- sparse locomotion lifecycle events.

The renderer is not rerendered for every native position update.

## Current QA controls

The tray exposes a temporary **Movement test** submenu:

- Walk 240 px left;
- Walk 240 px right;
- Stop;
- Calm, Balanced, and Lively pace.

These controls are diagnostic scaffolding and are not the final behavior planner.
