# PokoLoko — Step 18 Change Report

## Scope completed

Step 18 adds a reusable rich-activity framework on top of the Step 17 repository. It models activity execution as explicit data and deterministic controller events rather than animation swaps or chained timers.

## Implemented

- immutable activity schema and character-specific registry;
- 12 approved character/activity definitions covering 13 runtime activity animations;
- lifecycle phases: entry, setup, loop, variation, exit, recovery, completion/cancellation;
- legal entry state and posture checks;
- optional destination policies for comfortable regions and real desktop edges;
- seeded duration and loop-count selection;
- explicit composite-prop ownership and cleanup;
- immediate, soft, deferred, and locked interruption behavior;
- safe interruption for drag, character switch, pause, fullscreen quiet, display loss, and shutdown;
- stale generation rejection;
- cooldown helpers and mood-effect metadata;
- diagnostic panel for activity phase, animation, prop, loop, marker, and interruption state;
- synthetic and real-activity tests;
- documentation for framework and prop lifecycle.

## Approved activity coverage

Poko: drink, eat, music, peeking, playing ball.

Loko: drink, eat, laptop, music, peeking, playing ball, reading.

Rest and emotional routines use the same lifecycle structure when integrated with their approved sleep/social-reaction controllers. No unsupported archival pose was promoted into runtime merely to inflate the activity count.

## Safety decisions

The source props are composite-frame artwork. They are represented logically but never falsely separated. Ordinary cancellation waits for safe markers; drag, character switch, display loss, and shutdown enter deterministic recovery and invalidate stale activity work.

## Validation

- Step 18 structural validator passed.
- Standalone strict TypeScript compilation passed for the activity package.
- Compiled runtime scenarios passed for deferred reading exit and immediate ball-play drag recovery.
- Steps 06–17 dependency-free regression validators passed.
- Runtime manifest coverage passed for all referenced animations.

## Native validation status

As agreed, Electron/Windows visual validation remains deferred until the GitHub Actions EXE is produced after Step 27. The final EXE must visually approve full entry/exit chains, prop-safe markers, edge alignment, fullscreen quieting, and interruptions.
