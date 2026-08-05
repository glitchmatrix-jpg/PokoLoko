# PokoLoko — Error and Recovery Model

## Recovery principle

The app should fail toward a visible, grounded, neutral companion—not toward a blank window, incompatible pose, phantom prop, runaway timer, or crash loop.

## Missing asset

### Detection
- startup registry validation;
- renderer image-load error;
- animation frame path failure.

### Recovery
1. stop affected playback generation;
2. log asset ID and source path;
3. select character-safe neutral fallback animation;
4. preserve ground anchor and position;
5. disable the broken activity for the session;
6. notify diagnostics/settings non-intrusively.

If the neutral fallback is missing, show a branded recoverable error window and pause the pet.

## Invalid state request

- reject transition;
- log current state, requested intention, and legality reason;
- remain in current stable state or route to neutral recovery;
- planner receives a temporary penalty for the rejected candidate;
- development builds may throw after logging; production does not crash.

## Stale async event

Any completion with a stale generation is ignored. It cannot alter state, props, movement, or character. Diagnostics count stale events to expose leaks.

## Display removal/change

1. freeze locomotion;
2. refresh display snapshots;
3. choose nearest valid work area;
4. clamp safe ground position;
5. invalidate destination;
6. clear edge-peeking state if its edge no longer exists;
7. settle in neutral posture;
8. resume planning only after placement succeeds.

## System suspend

- enter suspended lifecycle;
- freeze monotonic simulation;
- invalidate ordinary deadlines;
- stop audio;
- preserve safe recovery snapshot;
- do not fast-forward missed activity on resume.

## Resume

1. refresh display/work area;
2. refresh renderer/window health;
3. clear stale context;
4. restore neutral compatible posture at safe position;
5. apply a gentle resume/curiosity bias;
6. restart planning after a short bounded hold.

## Renderer crash or reload

- Electron keeps domain snapshot;
- stop movement and audio;
- mark presentation unavailable;
- recreate renderer with bounded retries;
- on ready, publish a fresh full snapshot;
- do not replay stale animation completion events;
- after repeated failure, pause and expose recovery action.

## Window movement failure

- stop locomotion;
- compare requested and actual window rect;
- clamp/retry once;
- if still failing, enter recovery and keep window reachable;
- never continue accumulating invisible world displacement.

## Settings corruption

- validate persisted JSON against schema;
- retain valid fields;
- replace invalid fields with defaults;
- back up corrupt file;
- publish repaired authoritative snapshot.

## Character switch failure

- keep current character active until target’s first neutral frame loads;
- never show a missing-frame flash;
- if target fails, cancel switch and report error;
- invalidate pending events only after switch commit or restore previous generations safely.

## Context sensor failure

Context is optional. Disable failing sensor, clear its weights, and continue with personality/mind/session behavior. Never block the pet.

## Audio failure

Mute failing cue/controller for the session. Visual behavior continues unchanged.

## Shutdown

- enter `shutting_down`;
- invalidate all generations;
- stop schedulers, locomotion, context sampling, audio;
- persist settings and safe position atomically;
- destroy tray/windows;
- reject late events.

## Recovery observability

Every recovery records:
- reason;
- triggering event;
- state before;
- chosen safe state;
- generations invalidated;
- success/failure;
- no private content.
