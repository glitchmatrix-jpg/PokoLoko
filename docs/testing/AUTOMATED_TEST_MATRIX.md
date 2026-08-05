# PokoLoko Automated Test Matrix

## Determinism policy

All behavioral tests use seeded random sources, manual clocks, Vitest fake timers, or deterministic event queues. Tests must not use real-time `sleep`, polling delays, network access, the system clock, or animation-frame timing as an assertion mechanism.

| Area | Unit coverage | Integration coverage | Regression gate |
|---|---|---|---|
| Runtime assets | manifest schema, files, RGBA frames, anchors, animation IDs | packaged asset smoke | missing files report exact animation/path |
| Animation | forward/reverse/ping-pong, endpoints, one-shot completion, pause/resume, catch-up bound | runtime animation events | deterministic frame snapshots |
| State machine | legality, routes, completion, stale generations, rejection reasons, recovery | walk/activity/sleep interruption | no invalid posture or prop state |
| Locomotion/display | acceleration, thresholds, retarget, bounds, edge events, grounding, mixed-origin displays | movement completion, drag/display recovery | no off-work-area destination |
| Behavior | scoring, personality profiles, cooldowns, repetition, mind updates, bounded memory, seed replay | autonomous orchestration | identical seed gives identical sequence |
| Activities | phase progression, prop appearance/removal, safe markers, cancellation, cooldown | activity entry/loop/exit and drag | no prop leakage |
| Context/privacy | debounce, hysteresis, recent interaction, disabled reset | fullscreen/lock restraint | disabled sensing emits no active signal |
| Settings/persistence | schema, migration, invalid values, atomic persistence contract | restart restoration | defaults keep context and sound off |
| Social/sleep | spam collapse, posture gates, wake routing, recovery | sleep interrupted by click/drag | no upright reaction while asleep |
| Diagnostics | bounded traces, validated replay, command contracts | seeded reproduction | production default remains disabled |

## Critical integration scenarios

- idle → walk → stop → idle
- idle → sit/settle → sleep → wake → idle
- activity entry → setup → loop → exit
- walking interrupted by drag
- sleep interrupted by drag or wake interaction
- character switch during activity/animation
- display change during locomotion
- pause and resume
- fullscreen/lock/suspend restraint and resume
- restart restoration and schema migration

## CI release gate

Ubuntu and Windows run formatting, typecheck, lint, deterministic tests, build, and package smoke. Windows additionally creates the unpacked Electron package. Test retries are disabled; a flaky test is a failing test and must be fixed rather than hidden.

Native visual inspection remains a separate release requirement because deterministic code tests cannot prove transparent-window rendering, DWM frame pacing, tray appearance, or subjective animation continuity.
