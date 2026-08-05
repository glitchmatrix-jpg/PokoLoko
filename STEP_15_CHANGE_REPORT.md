# PokoLoko — Step 15 Change Report

## Scope completed

Step 15 adds a deterministic sleep/wake lifecycle controller, character-specific sleep profiles, content-blind daily-rhythm scoring, suspend/resume protection, drag interruption recovery, and tests/documentation. No autonomous personality expansion beyond sleep/rest was introduced.

## Asset decisions

- Poko enters sleep with `poko_sleep_transition` and uses `poko_sleep_loop_02` as the primary quiet loop. `poko_sleep_loop_01` remains an occasional expressive variation.
- Poko provisionally wakes by reversing the entry animation, then holding a compatible neutral frame. This route remains subject to final native visual approval.
- Loko enters sleep with `loko_sleep_transition` and uses `loko_sleep_loop`.
- Loko does **not** reverse its entry animation because the asset audit did not approve that as a natural wake. It uses a lying hold followed by neutral recovery.
- No dedicated wake artwork was fabricated.

## Correctness guarantees

- Sleep loop begins only after `ANIMATION_COMPLETED` for the entry animation.
- Sleep deadlines request wake; they cannot directly swap the state or sprite.
- Locomotion is disabled during entry, sleep, waking, and immediate recovery.
- Drag immediately invalidates sleep choreography and enters physical recovery.
- Generation IDs reject stale animation completions and stale deadlines.
- Suspend does not fast-forward missed frames or deadlines.
- Stable sleep resumes its loop after system resume; incomplete phrases recover safely.
- Character switch and shutdown invalidate the old lifecycle.

## Daily rhythm

Sleep eligibility is influenced by energy, wake duration, local time band, system idle, quiet mode, and recent interaction. Late hours increase likelihood but never force sleep. A character-specific post-wake protection interval prevents immediate re-sleep.

## Validation performed

- dependency-free structural validation passed;
- strict standalone TypeScript compilation passed;
- compiled runtime scenarios passed for Poko entry/wake, Loko hold recovery, and rhythm scoring;
- five authoritative sleep assets were verified in the runtime manifest;
- tests cover stale completions, deadline ordering, drag interruption, suspend/resume, quiet-hour ranges, and post-wake protection.

## Native closure still required

The final Windows EXE must visually approve Poko's reverse wake, Loko's hold-to-neutral recovery, sleep-loop seams, click wake, drag-from-sleep, suspend/resume, and long-session timing. An unconvincing visual wake route must be quarantined and replaced with approved isolated bridge poses.
