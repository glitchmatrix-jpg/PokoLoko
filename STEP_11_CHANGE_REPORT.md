# PokoLoko — Step 11 Change Report

## Scope completed

Step 11 adds gait-safe direction changes, start choreography, stop choreography, same-direction retargeting, and direction event wiring without introducing autonomous behavior.

## Implemented

- Added `packages/pet-engine/direction/` with a deterministic `DirectionTurnController`.
- Added explicit phases: idle, walking, waiting for gait boundary, neutral hold, and preparing.
- Opposite-direction requests now wait for the active walk loop boundary before translation stops.
- Missing turn/stop sprites are handled through a documented neutral front-idle hold, not an instant moving mirror.
- Loko uses one non-looping pass of `loko_walk_preparation` before translation.
- Poko starts from the neutral bridge without fabricated preparation frames.
- Added continuous same-direction destination retargeting to `LocomotionEngine` without resetting floating-point position or velocity.
- Renderer reports only loop-boundary frame facts and one-shot completions to the main controller.
- Direction remains authoritative in the main controller; the renderer never chooses it.
- No DOM `scaleX(-1)` mirroring is used.
- Existing approved left/right walk assets and their own anchors are loaded directly.
- Character change, manual stop, replacement destination, display recovery, and shutdown invalidate stale choreography.

## Asset decision

The runtime pack has no approved dedicated turn or stop sequence. Poko has no approved preparation phrase. Loko has `loko_walk_preparation`, which is used as a one-shot phrase despite archival loop metadata. All prop-bearing activities remain outside this controller.

## Automated checks

- Direction-controller pure TypeScript compilation passed under strict and exact-optional rules.
- Step 11 dependency-free validation passed.
- Step 10 locomotion regression validation passed.
- Step 09 animation-runtime regression validation passed.
- Runtime assets: 31 animations and 223 RGBA frames passed.
- Format hygiene passed.

## Native validation deferred

The GitHub Actions Windows EXE after Step 27 must visually approve gait-boundary stopping, neutral holds, Loko preparation, mixed-DPI anchor stability, edge reversal, and repeated opposite requests. These native observations cannot be established by static analysis alone.
