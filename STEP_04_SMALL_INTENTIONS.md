# Step 4 — Small-Intention Behavior System

## Goal

Replace isolated random clips with short, connected, personality-aware behavior phrases.

## New ambient intentions

### Poko

- `poko_quiet_breathe`
- `poko_notice_left`
- `poko_notice_right`
- `poko_ear_twitch`
- `poko_inspect_desktop`

Poko’s notice phrases connect a directional glance, blink, and breathing recovery. The inspection phrase glances in both directions before settling. Breathing is a valid complete behavior rather than filler between spectacles.

### Loko

- `loko_quiet_watch`
- `loko_attentive_pause`

Loko receives longer, quieter holds with lower movement and spectacle pressure.

## Memory and selection rules

- The immediately previous intention cannot repeat when an alternative exists.
- The last eight completed intentions apply diminishing recency penalties.
- Interrupted actions still enter memory, but with a softer penalty.
- Ambient phrases have individual cooldowns.
- Large activities retain long cooldowns and receive an additional spectacle restraint multiplier.
- Walking is more frequent for Poko and more restrained for Loko.
- Quiet, fullscreen, lock, and idle context increase neutral or breathing behavior.
- Session memory now retains 24 decisions instead of 12.

## Runtime sequencing

Ambient phrases are first-class planner intentions. The runtime:

1. blocks the planner while a phrase is active,
2. plays each animation step in order,
3. advances using a completion watchdog timer,
4. records the completed phrase in memory,
5. restores the stable idle presentation,
6. schedules the next decision according to character pacing,
7. cancels and records the phrase if dragging, pausing, reactions, or another invalidation interrupts it.

## Quarantined animation

`poko_idle_look_01` is no longer referenced by normal behavior, ambient integration, activities, reactions, or orchestration. The original asset remains in the pack for provenance and diagnostics only until it is redrawn.

## Validation

Run:

```powershell
npm run validate:step04-intentions
npm run validate:behavior
npm run validate:living-runtime
tsc -p tsconfig.step04-behavior.json
```

The legacy integrated-activities validator still attempts to execute TypeScript from `node_modules`. It therefore requires dependencies to be installed locally. Its asset expectations were updated to the new ambient sprite set.

## Five-minute acceptance test

Observe each character for five minutes on balanced activity:

- no identical idle phrase should play twice consecutively,
- Poko should mostly breathe, glance, twitch, and occasionally wander,
- large Poko activities should feel like events rather than constant noise,
- Loko should spend longer periods watching quietly,
- neither character should repeatedly select the same activity,
- `poko_idle_look_01` must never appear,
- interrupting an ambient phrase must not leave a stale animation or restart it later.
