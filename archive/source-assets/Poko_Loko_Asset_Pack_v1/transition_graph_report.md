# Step 12 — Safe Transition Graph

A safe state-transition graph was created for both characters using only existing animation assets.

## Core rules

- Sleep never transitions directly to walking.
- Lying or sleeping poses never transition directly to upright reactions.
- Prop-based activities return to idle before locomotion.
- Direction reversal routes through an idle/stop hold rather than flipping mid-cycle.
- One-shot reactions return to idle.
- No visual transition frames were fabricated.
- When no explicit bridge exists, runtime should hold the final frame briefly and route through a neutral idle.

## Counts

| Character | Allowed transitions | Explicitly forbidden transitions |
|---|---:|---:|
| Poko | 52 | 38 |
| Loko | 39 | 69 |

## Runtime bridge strategies

- `short_hold`: briefly hold the current pose before switching.
- `intermediate_idle_hold`: route through a neutral idle because no dedicated bridge exists.
- `stop_hold`: finish the current walk cycle before returning to idle.
- `prop_introduction_hold`: pause before a prop appears.
- `prop_removal_hold`: pause before a prop disappears.
- `wake_hold_then_idle`: remain on the final sleep frame before returning to idle when no wake animation exists.