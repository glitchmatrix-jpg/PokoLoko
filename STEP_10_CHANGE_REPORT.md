# PokoLoko — Step 10 Change Report

## Scope completed

Step 10 adds a dedicated, deterministic horizontal locomotion engine and integrates it with the real Electron pet window. It does not add autonomous destination choice, turning choreography, dragging, or personality planning.

## Implemented

- Continuous floating-point position with integer rounding only at native window application.
- Delta-time movement independent of sprite animation FPS.
- Poko/Loko calm, balanced, and lively speed profiles.
- Controlled acceleration and braking-limited arrival.
- Exact destination snap with zero terminal velocity and no oscillation.
- Long-gap delta cap to prevent visible catch-up racing.
- Current-display work-area clamping using manifest ground anchors.
- Taskbar-safe window placement through the same grounding geometry as Step 08.
- `DESTINATION_REACHED`, `SCREEN_EDGE_REACHED`, and `MOVEMENT_INTERRUPTED` events.
- Locomotion generation and request guards for stale destination loads.
- High-frequency native movement in Electron main, outside React state updates.
- Walk-cycle selection by character and direction.
- Initial foot-cadence calibration from authored 8 FPS / 45 px/s metadata.
- Typed preload IPC for movement commands and lifecycle events.
- Temporary tray movement controls for later EXE QA.
- Unit tests and a dependency-free reference validator.

## Architecture decisions

The native window moves. The sprite remains fixed inside its bounded transparent window. This avoids creating a large click-blocking renderer surface and keeps desktop hit behavior aligned with the visible companion.

The locomotion engine owns ground-X, velocity, destination, and physical completion only. It does not choose destinations or animation frames. The controller adapts physical snapshots to Electron window coordinates and selects the approved left/right walk assets.

## Validation completed in this environment

- Locomotion package strict TypeScript check passed with the available system TypeScript compiler.
- Step 10 dependency-free locomotion validation passed.
- Runtime asset validation passed: 31 animations / 223 RGBA frames.
- Step 09 animation runtime validation passed.
- Step 08 static renderer validation passed.
- Consolidated Stages 01–09 static validation passed.
- Formatting hygiene check passed.

## Native validation deferred

As agreed, the Windows EXE will be built with GitHub Actions after Step 27. The following remain pending until that build:

- visible native movement under DWM;
- cadence/foot-slide video review;
- actual CPU sampling during continuous movement;
- mixed-DPI and negative-coordinate monitor movement;
- live display removal during travel;
- side and auto-hidden taskbar behavior;
- packaged ASAR path behavior;
- installer launch.

No native-only result is represented as passed.
