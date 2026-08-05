# PokoLoko — Step 09 Change Report

## Scope completed

Step 09 adds an independent deterministic animation runtime and connects the static desktop renderer to authoritative multi-frame playback. No behavior planner, locomotion, autonomous transition selection, or activity scheduling was introduced.

## Added

- `packages/animation-runtime/` with a monotonic, generation-aware runtime;
- forward, reverse, ping-pong, loop, and one-shot modes;
- exactly-once `ANIMATION_COMPLETED` emission;
- idempotent identical playback requests;
- explicit pause/resume and suspend/resume behavior;
- a 250 ms default catch-up cap for long renderer gaps;
- frame index, sequence index, elapsed time, loop count, loop boundary, completion, and playing snapshots;
- browser RAF driver separated from the pure runtime;
- typed completion reporting through preload IPC;
- renderer integration using the runtime asset manifest animation metadata;
- deterministic unit tests for timeline and runtime behavior;
- dependency-free static and behavioral validation;
- `docs/runtime/ANIMATION_PLAYER.md`.

## Architectural compliance

- Playback policy is not owned by React renders.
- The renderer displays runtime output and does not select a successor animation.
- Locomotion remains absent and separate.
- Behavior remains absent and separate.
- Character changes use a new animation generation.
- Long hidden/suspended periods do not fast-forward visibly.
- No `setTimeout` chain, `Date.now()`, or `Math.random()` was introduced into animation playback.

## Validation completed in this environment

Passed:

- runtime asset validation: 31 animations, 223 RGBA frames;
- animation laboratory static validation;
- static renderer validation;
- Step 09 runtime structure and behavioral smoke validation;
- Node syntax validation for the new validation script;
- ZIP integrity validation.

## Native/toolchain closure still pending

The inherited npm-registry blocker remains unresolved in this environment, so the following were not falsely claimed as passed:

- `npm ci`;
- strict TypeScript compilation;
- ESLint/Prettier/Vitest execution;
- Vite/Electron production build;
- live Windows playback timing under load;
- focus-loss and power suspend/resume inside Electron;
- packaged runtime launch.

Step 09 must remain behind its stop condition until those checks pass on the target Windows environment.
