# Behavior Audit

## Current behavior model

The behavior system is a single main-process global state plus one timeout and one movement interval. It is not a state machine despite documentation calling it one.

### Coarse states

`IDLE`, `WALKING_LEFT`, `WALKING_RIGHT`, `SITTING`, `SLEEPING`, `DRAGGED`, `LANDING`, and `INTERACTING`.

There are no explicit states for start/stop walking, turning, standing-to-sitting, sitting-to-standing, sitting-to-sleeping, waking, activity setup/loop/exit, click reaction recovery, pickup, or interruption.

## Decision loop

`scheduleBehavior()` selects a delay from a character-specific idle range and schedules `chooseBehavior()` unless paused or dragged.

`chooseBehavior()` uses a single random roll:

- `< 0.45`: IDLE.
- `< 0.75`: walking.
- `< 0.90`: sitting.
- `< min(0.98, 0.90 + sleepWeight)`: sleeping.
- otherwise: happy reaction.

Poko: speed 75 px/s, idle range 2–5 s, sleep weight 0.07.

Loko: speed 48 px/s, idle range 4–9 s, sleep weight 0.14.

The probability table has a subtle consequence: Poko sleeps in the interval 0.90–0.97 (7%) and reacts in 0.97–1.00 (3%); Loko sleeps in 0.90–0.98 (8%, not the declared 14% because of the hard cap) and reacts in 0.98–1.00 (2%). The `sleepWeight` name therefore misrepresents effective probability for Loko.

## Why it feels robotic

- Decisions depend only on one random number and current coarse state.
- No recent-action memory exists.
- No cooldowns prevent repetition.
- No user-context inputs exist.
- No energy, focus, boredom, curiosity, sociability, comfort, or mood model exists.
- Stable-state durations are fixed narrow ranges.
- Character differentiation is only speed, idle delay, and nominal sleep probability.
- Activities do not exist.
- Destinations are uniform random X coordinates with no environmental or personality meaning.
- Transitional animations are renderer guesses, not domain transitions.

## State/visual desynchronization

### Sleep

Main enters `SLEEPING` and immediately schedules another behavior after 7–14 s. Renderer decides whether to play `sleep_transition` or `sleep_loop` by looking at its previous received behavior. The transition's completion changes only renderer animation. When the main timeout fires, `chooseBehavior()` sets main state directly to `IDLE`; renderer infers `wake`. The main process then schedules another decision 1.2–2.5 s later regardless of whether wake playback has completed.

### Reactions

Main enters `INTERACTING`, sends a separate reaction event, and schedules behavior after 1.8 or 2.2 s. Renderer selects the reaction animation and its local manifest `next` returns to idle when frames finish. Main may still remain `INTERACTING`, or may issue a new behavior before/after renderer completion depending on timing.

### Landing

Main enters `LANDING` and schedules behavior after exactly 850 ms. Renderer animation completion is not reported. If the animation timing or frame count changes, main behavior and visible landing diverge.

### Sitting

`SITTING` maps directly to a looping `sit` animation. There is no entry or exit posture transition. The next main decision can jump directly to walking, sleeping, or idle.

## Pause semantics

Pause clears both timers and forcibly sets state to `IDLE`; it does not preserve the current activity or position in a resumable state. Interactions remain active, but a click while paused enters `INTERACTING`; no behavior timer is scheduled, leaving main state there indefinitely while the renderer locally returns to idle.

## Click behavior

A single click is delayed 240 ms to permit double-click settings. Click timestamps within 1.4 s are retained; at four or more clicks, reaction changes to confused. The list can remain at length ≥4 during continuing clicks, so all subsequent clicks in that rolling window stay confused. There is no reaction queue policy, cooldown, affection/annoyance gradient, posture compatibility, or spam protection beyond replacing timers.

## Character switching

Switching clears timers, persists the character, broadcasts the change, rebuilds tray state, sets `IDLE`, and schedules a new decision after 500 ms. Renderer separately resets animation to idle. Old renderer animation callbacks are not versioned, so a completion from the previous character/definition can theoretically call `setAnimation(next)` after switching.

## Current transition graph

The effective main graph permits almost every random stable state to jump to every other behavior. Renderer-only hidden edges include:

- `SLEEPING` visual transition → sleep loop.
- main `SLEEPING → IDLE` visual inference → wake → idle.
- reaction → manifest next idle.
- landing → manifest next idle.

This is not a safe posture graph.

## Decision

**REPLACE completely.** Preserve none of the scheduler logic. The redesign needs an authoritative event-driven state machine, action planner, contextual scoring, cooldown/memory model, character profiles, and animation-completion events that drive transitions.
