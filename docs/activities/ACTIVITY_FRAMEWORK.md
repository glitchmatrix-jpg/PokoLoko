# PokoLoko — Rich Activity Framework

## Purpose

Activities are not animation swaps. Each activity is an authored experience with legal entry, posture routing, setup, prop continuity, main phrase, optional variation, interruption policy, safe exit, recovery, cooldown, and hidden-mind effects.

The behavior planner may request an activity only at a safe decision point. The legal state machine validates the request. `ActivityController` then executes the approved choreography through commands to the transition, animation, locomotion, prop, and deadline systems. It never moves the pet or chooses frames directly.

## Lifecycle

```text
request
→ legal state/posture check
→ transition.activity_entry
→ entry choreography
→ setup and prop appearance
→ activity.<id>
→ main loop / one-shot phrase
→ optional micro-variation
→ safe interruption boundary or natural end
→ transition.activity_exit
→ prop removal
→ compatible neutral posture
→ cooldown and mind/session update
```

## Approved activity vocabulary

### Poko
- drink
- eat
- music
- peeking
- playing ball

### Loko
- drink
- eat
- laptop
- music
- peeking
- playing ball
- reading

The framework supports all approved asset-backed activities. It does not expose unsupported archival poses to the planner.

## Responsibilities

### Behavior planner
Scores a legal activity and requests an intention. It does not play an animation.

### State machine
Protects legal state and posture transitions.

### Activity controller
Owns the current `ActivitySession`, phase, prop visibility, loop count, safe-marker status, pending interruption, and activity generation.

### Transition composer
Executes neutral holds, posture routes, direction changes, and recovery chains.

### Animation runtime
Plays the requested activity phrase and emits markers, loop boundaries, and completion facts.

### Diagnostics
Shows the active activity, phase, animation, prop state, loop progress, safe marker, and pending interruption.

## Determinism

Durations, loop counts, and optional variations use an injected random source. Tests use a fixed seed. No activity code calls `Math.random()`.

## Interruption behavior

- **IMMEDIATE:** drag, character switch, display loss, shutdown. Cancel deadlines, invalidate the activity, clear the prop through documented recovery, and route to a safe state.
- **SOFT:** ordinary quieting or reaction request. Exit at the nearest short phrase boundary.
- **DEFERRED:** prop-bearing activities. Record the request and wait for a page-rest, ball-rest, sub-scene, or loop boundary.
- **LOCKED:** short entry, setup, exit, and recovery spans finish unless an immediate interruption occurs.

## No timer spaghetti

The controller produces typed commands and accepts typed events. A central scheduler owns deadlines. No activity creates chained arbitrary `setTimeout` calls.

## Adding an activity

1. Confirm the animation is approved in the runtime asset policy.
2. Add one immutable `ActivityDefinition` with character-specific metadata.
3. Declare legal state and posture entries.
4. Define destination needs.
5. Define every lifecycle phase and safe marker.
6. Define prop ownership and recovery.
7. Define interruption levels.
8. Define cooldown and mind effects.
9. Add registry and synthetic lifecycle tests.
10. Review the complete chain in the Animation Laboratory and native EXE before enabling planner eligibility.

Activity IDs are stable public domain identifiers. Replacing frames does not rename the activity. Breaking semantic changes require a new ID or manifest migration.
