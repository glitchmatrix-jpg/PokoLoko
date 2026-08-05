# PokoLoko — Diagnostic Mode

## Purpose

Diagnostic Mode makes state, animation, movement, personality, context, activities, props, planner scores, and recent events inspectable without waiting for autonomous behavior. It is a developer and QA surface, not part of the companion fantasy.

## Availability

- Development builds: available from the tray.
- Packaged builds: hidden unless **Settings → Advanced → Diagnostics** is explicitly enabled.
- The diagnostic surface polls at 4 Hz only while open. Closing it removes the polling interval, so hidden diagnostics add no UI rendering loop.
- The runtime retains one bounded 500-event ring buffer. It contains coarse state and command data, never typed text, keys, clipboard contents, screenshots, URLs, window titles, messages, or documents.

## Inspection

The panel displays:

- current and previous living-runtime mode;
- legal state-machine state and generation;
- animation ID, frame, FPS, direction, playback and canvas anchor;
- window position, display, work area and scale factor;
- movement state, speed and destination;
- PetMind values and mood;
- coarse context state;
- activity phase, prop visibility and pending interruption;
- sleep phase;
- next planning deadline;
- ranked planner candidates and reasons;
- recent trace events and state-transition rejection records.

The Animation Laboratory remains available under a disclosure for frame stepping, playback overrides, transition-chain review, mirrored comparisons and anchor overlays.

## Controls

Diagnostic commands can force idle, movement, sleep, wake, approved activities, social reactions, character switching, pause, movement stop, drag completion, display recovery, mind values and deterministic seed. Commands enter through typed IPC and use the same production controllers; the UI cannot mutate renderer state directly.

Unsupported activity/character combinations are rejected by the activity registry rather than faked.

## Trace export and replay

**Export trace** writes a versioned JSON file containing the bounded event history and replayable diagnostic commands. **Replay trace** validates the format, restores its seed and replays at most 200 recorded diagnostic commands. Raw pointer motion and private context are not replayed.

A trace is intended for bug reproduction:

1. set a seed;
2. trigger the issue;
3. export the trace;
4. reset the runtime;
5. replay the trace;
6. compare state generations, rejection reasons and presentation.

## Safety

- generation tokens still reject stale animation, movement and activity completions;
- forced actions still pass through production legality and activity checks;
- no debug command can resize an individual frame or bypass anchors;
- trace replay has bounded event count and delay;
- shutdown and character switching invalidate pending diagnostic work.
