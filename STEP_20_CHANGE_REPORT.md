# PokoLoko — Step 20 Change Report

## Scope completed

Step 20 adds a deterministic social-reaction layer that acknowledges clicks, repeat attention, drag release, activity completion, long idle, surprise, sleep interaction, and rare contextual sadness without bypassing posture, prop, sleep, or transition safety.

## Added

- `packages/pet-engine/reactions/`
- `tests/reactions/`
- `docs/interaction/REACTION_MODEL.md`
- `scripts/validate-reactions.mjs`
- `tsconfig.step20.json`

## Locked decisions

- Poko uses faster, more expressive acknowledgement through approved idle-look/blink assets.
- Loko uses slower neutral acknowledgement and the approved love reaction with a long cooldown.
- Sleeping input requests wake; upright social animation is forbidden while lying.
- Prop-bearing activities request a safe exit before a social reaction.
- Locked transitions defer reactions.
- Click spam is collapsed through a bounded click window, saturation, cooldowns, and ignored-input diagnostics.
- Poko crying is rare, explicitly reason-gated, and never caused by neglect or random chance.
- No unapproved angry, sad, affection, or pickup art was fabricated.
- Reactions return to declared neutral states and carry generation IDs.

## Validation

- 9 reaction definitions verified.
- 5 authoritative runtime animations verified.
- strict standalone TypeScript passed.
- sleep routing, locked-state deferral, activity prop safety, spam collapse, cooldowns, and contextual-sadness gating passed.
- Steps 06–19 dependency-free regressions passed.

## Native review still deferred

The final Windows EXE must visually validate click timing, drag/click disambiguation, sleep stirring, activity-safe reaction exits, rapid input, and long-session emotional pacing.
