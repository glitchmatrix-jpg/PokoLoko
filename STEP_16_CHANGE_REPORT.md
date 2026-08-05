# PokoLoko — Step 16 Change Report

## Implemented

- Atomic neutral-idle character switching.
- Target asset/profile preloading before presentation commit.
- Switch generation and presentation generation guards.
- Cancellation commands for planner, activity, locomotion, animation, and props.
- Fresh Poko/Loko behavior mind and session memory bundles.
- Ground-X preservation and target-anchor geometry recomputation.
- Persistence only after a successful committed switch.
- Failure behavior that leaves the existing character active.
- Unit tests for stale racing loads, profile isolation, event acceptance, and failure recovery.

## Choreography

The current implementation keeps the existing character visible until the target neutral frame is loaded, then commits in one presentation update. No fade is required for correctness. Native visual review after the GitHub Actions EXE will decide whether a very short fade improves emotional continuity without creating blur.

## Deferred native evidence

Windows EXE review remains required for blank-frame flash, mixed-DPI grounding, tray/settings synchronization, rapid repeated switching, and switching during every major state.
