# PokoLoko — Sleep, Wake, Rest, and Daily Rhythm

## Asset truth

| Character | Entry | Primary sleep loop | Variation | Wake policy |
|---|---|---|---|---|
| Poko | `poko_sleep_transition` | `poko_sleep_loop_02` | `poko_sleep_loop_01` | reverse entry is supported as a provisional wake phrase, followed by a short neutral hold |
| Loko | `loko_sleep_transition` | `loko_sleep_loop` | none | reverse entry remains visually unapproved; use a lying hold followed by neutral recovery |

Neither character has a dedicated authoritative wake animation. The controller therefore does not invent one. Loko specifically does not reverse the sleep-entry sequence automatically.

## Lifecycle

```text
awake
→ REQUEST_SLEEP
→ transition.sleep_entry + one-shot entry animation
→ ANIMATION_COMPLETED
→ stable.sleeping + loop
→ wake trigger
→ waking or wake hold
→ safe neutral recovery
→ stable.idle_front
```

The sleep loop cannot begin before entry completion. Walking, upright reactions, and prop activities are illegal while sleeping. A planner deadline merely requests wake; it never swaps state by itself.

## Character rhythm

Poko sleeps in shorter, less predictable sessions (roughly 95 seconds to 6 minutes before tuning) and uses the quieter loop as default, with the expressive Z-symbol loop as an occasional variation. Loko sleeps in longer, more ritualistic sessions (roughly 4 to 15 minutes before tuning).

These ranges are configuration and must be tuned using long-session native observation. They are not user-facing care requirements.

## Daily rhythm

Late night, low energy, system idle, and quiet context increase sleep eligibility. They never force sleep deterministically. Recent high interaction lowers eligibility, and every wake starts a protection interval preventing immediate re-sleep.

Only coarse local time bands and activity presence are used. No content is inspected.

## Wake triggers

- planner deadline;
- user click;
- drag;
- character switch;
- system resume;
- settings change;
- shutdown.

Dragging is immediate and routes directly into physical recovery. Ordinary clicks use the character wake choreography. Character switch invalidates old sleep generations before the new character appears.

## Suspend and long gaps

Suspend freezes the lifecycle. Resume does not fast-forward every missed frame or deadline. A settled sleeper resumes its sleep loop; an interrupted entry/wake phrase routes through safe recovery. Long elapsed time cannot race multiple transitions.

## Interruption matrix

| Phase | Click | Drag | Character switch | Suspend | Shutdown |
|---|---|---|---|---|---|
| entry | deferred until safe completion, except drag | immediate recovery | immediate recovery | freeze | immediate |
| sleeping | wake request | immediate drag recovery | immediate recovery | preserve sleep | immediate |
| waking | ignore duplicate wake | immediate recovery | immediate recovery | freeze/recover | immediate |
| wake hold | ignore duplicate wake | immediate recovery | immediate recovery | freeze/recover | immediate |

## Native visual closure

The provisional Poko reverse wake and Loko hold-to-neutral route must be reviewed in the Step 07 lab and final Windows EXE. A visually poor route must be quarantined and replaced with approved isolated bridge poses; it must never be hidden with frame resizing or an incompatible crossfade.
