# PokoLoko — Interruption Rules

## Levels

### IMMEDIATE
Current work is canceled now. Generations are invalidated and deterministic recovery begins.

Triggers:
- drag start;
- shutdown;
- display removal that makes current location invalid;
- critical renderer/window failure.

### SOFT
Action may exit at the next declared safe marker or short phrase boundary.

Typical triggers:
- ordinary click reaction;
- quiet/fullscreen activation;
- context change;
- user pause request when no safety issue exists.

### DEFERRED
Event is stored until activity reaches a prop-safe or posture-safe exit point.

Typical cases:
- reading while book is visible;
- laptop use before a close/neutral frame;
- eating/drinking before prop-safe frame;
- ball play before stable contact frame.

### LOCKED
A short transition section must finish unless an immediate system/user-drag interruption occurs.

Typical cases:
- sleep transition;
- critical orientation bridge;
- landing/settling micro-transition;
- prop appearance/disappearance marker span.

## State matrix

| State/activity | Drag | Click | Character switch | Pause | Fullscreen/quiet | Display change | Suspend/shutdown |
|---|---|---|---|---|---|---|---|
| Idle | immediate | social reaction | immediate recovery | soft/immediate | soft | immediate if invalid | immediate |
| Walking | immediate | soft stop then reaction | immediate | soft stop | soft stop | reroute or immediate | immediate |
| Turning | immediate | deferred | immediate | deferred | deferred | immediate if invalid | immediate |
| Sleep transition | immediate recovery | deferred/ignored | immediate | deferred | no change | immediate if invalid | immediate |
| Sleep loop | immediate wake/drag recovery | soft wake | immediate | soft freeze | remain asleep | relocate via recovery | immediate |
| Laptop/reading | immediate prop cancel recovery | deferred safe marker | immediate | deferred | deferred exit | immediate if invalid | immediate |
| Food/drink | immediate prop cancel recovery | deferred | immediate | deferred | deferred exit | immediate if invalid | immediate |
| Ball/music | immediate | soft phrase boundary | immediate | soft | soft exit | immediate if invalid | immediate |
| Social reaction | immediate | saturate/ignore | immediate | soft | soft | immediate if invalid | immediate |
| Dragged | already active | ignored | queued or immediate replace | immediate release+pause | no effect | recompute target display | immediate |

## Recovery principles

1. Cancel locomotion before visual recovery.
2. Clear or neutralize props deterministically.
3. Do not resume an activity from an unknown frame after immediate interruption.
4. Route to the nearest compatible neutral posture.
5. Preserve horizontal position where safe.
6. Increment generations so stale completions cannot resume canceled work.
7. Record interruption outcome in session memory to avoid immediate repetition.

## Composite prop handling

Because current props/effects remain in composite frames, immediate interruption cannot fade a separate prop layer. The renderer therefore switches only through a documented prop-free recovery frame or a brief hidden/neutral reset if no safe frame exists. This is explicitly preferable to carrying a phantom book, laptop, cup, or ball into locomotion.

## Character switching

Character switch:
- cancels planner deadlines;
- stops locomotion;
- invalidates animation/activity generations;
- clears props;
- selects a compatible neutral posture;
- recalculates anchors;
- publishes the new character only after its first frame is ready.

## Suspend/resume

Suspend freezes clocks and invalidates external deadlines. Resume refreshes displays and context, then recovers to a safe neutral state rather than fast-forwarding missed animations.
