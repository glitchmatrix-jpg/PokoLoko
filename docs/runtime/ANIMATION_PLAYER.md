# PokoLoko Deterministic Animation Runtime

## Purpose

Step 09 introduces sprite playback as an independent deterministic service. It does not decide behavior, locomotion, posture legality, or the next animation. It accepts an immutable playback request from the presentation/domain boundary, advances frames from a monotonic clock, and emits frame/completion facts.

## Package

```text
packages/animation-runtime/
├── package.json
└── src/
    ├── AnimationRuntime.ts
    ├── BrowserAnimationDriver.ts
    ├── timeline.ts
    ├── types.ts
    └── index.ts
```

## Supported playback

- forward;
- reverse;
- ping-pong without duplicated endpoints;
- looping;
- one-shot completion;
- one-frame sequences;
- arbitrary positive FPS values.

## Determinism

`AnimationRuntime` receives an injected monotonic clock. Frame selection is a pure function of accumulated animation time, frame count, FPS, playback mode, and loop policy. Tests use a fake clock; production uses `performance.now()`.

No runtime function calls `Date.now()` or `Math.random()`.

## Completion guarantee

A non-looping animation emits `ANIMATION_COMPLETED` once. Further ticks remain clamped at the terminal frame and cannot duplicate completion. Events include animation ID and generation so the future domain controller can reject stale completions.

## Identical presentation rule

Calling `play()` with the same animation ID, generation, FPS, playback mode, loop setting, and frame count is idempotent. It returns the existing snapshot and does not reset elapsed time. Unrelated React renders therefore cannot restart animation.

## Long frame gaps

A single tick is capped to 250 ms by default. Focus loss, debugger pauses, system stalls, and renderer throttling cannot cause the pet to visibly race through dozens of frames. Suspend and visibility handling reset the clock reference while preserving accumulated animation time.

## Pause and suspend

- `pause()` freezes playback intentionally.
- `resume()` continues from the same accumulated time.
- `suspend()` freezes playback for lifecycle interruption.
- `resumeFromSuspend()` resets the clock baseline and continues without fast-forwarding.

The renderer binds document visibility to suspend/resume. Electron power-session integration can invoke the same API in a later domain lifecycle step.

## Renderer integration

`PetSurface` receives authoritative animation metadata from the main process and passes it to `BrowserAnimationDriver`. The component displays only the current frame path. It does not calculate the next state or queue a successor animation.

One-shot completion is reported through typed IPC as a fact. The current Step 09 shell logs it; Step 12's domain transition controller will become the only consumer allowed to choose what follows.

## Character and asset reload

Character changes increment `animationGeneration`. A new generation restarts safely. `resetForAssetReload()` clears all playback state, increments the generation, removes pending RAF work, and requires an explicit new playback request.

## Loop boundary

Snapshots expose:

- frame index;
- sequence index;
- accumulated elapsed time;
- completed state;
- completion-emitted state;
- loop count;
- loop-boundary flag;
- playing/paused state.

This supports diagnostics and transition markers without coupling playback to React render cadence.

## Explicit non-goals

The animation runtime does not:

- move the Electron window;
- decide walking speed;
- select activities;
- infer posture;
- automatically queue another animation;
- persist state;
- access context or user input.
