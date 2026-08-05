# PokoLoko — Step 13 Change Report

## Scope completed

Step 13 adds authoritative direct manipulation without introducing autonomous behavior. The pet can now be clicked, double-clicked, picked up from visible pixels, moved across the virtual desktop, and settled back to the current display floor through deterministic recovery.

## Major implementation decisions

- Alpha-aware renderer hit testing remains the gate for pointer-down.
- Main-process `InteractionController` owns click/drag classification and drag sessions.
- Drag starts only after a six-pixel threshold.
- Pointer capture preserves movement when the cursor leaves the pet window.
- Locomotion and turn choreography are interrupted immediately at pickup.
- The legal state machine enters `interaction.dragged` with a new generation.
- The current animation frame freezes during pickup because no universal safe pickup sprite exists.
- Native window movement uses screen coordinates and a preserved grab offset.
- Cross-monitor and negative coordinates are allowed during active dragging.
- Release selects the nearest display and computes the floor from its work area.
- Horizontal position is retained unless reachability requires clamping.
- Poko and Loko use subtly different landing durations.
- Physical settlement emits `RECOVERY_COMPLETED`; stale callbacks cannot restore old behavior.
- Click, double-click, and drag are distinct gestures.

## Files added

- `packages/pet-engine/interaction/`
- `tests/dragging/interaction-controller.test.ts`
- `tests/dragging/settling.test.ts`
- `docs/interaction/DRAGGING_AND_RECOVERY.md`
- `scripts/validate-dragging.mjs`

## Files changed

- `electron/main/static-pet-controller.ts`
- `electron/main/main.ts`
- `electron/preload/contracts.ts`
- `src/surfaces/PetSurface.tsx`
- state-machine drag route and recovery completion metadata
- state-machine regression tests
- `package.json`

## Native validation deferred

The agreed GitHub Actions EXE pass after Step 27 must still visually test Windows pointer capture, DWM movement, mixed DPI, taskbars, monitor removal, suspend, and prop-bearing interruption. These are not claimed as natively proven in this environment.
