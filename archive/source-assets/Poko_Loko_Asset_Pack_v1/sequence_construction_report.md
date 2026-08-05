# Step 5 — Sequence Construction

Constructed **26** animation candidates from frames previously marked `plausible_sequence`.

Source order was preserved by default. No sequence was reordered without clear motion evidence; no such forced reorder was applied in this pass.

## Policy

- Exact duplicates are identified by pixel hash.
- Near-duplicates and possible abrupt jumps are flagged using pixel-difference analysis on a common bottom-centered canvas.
- No fabricated frames, interpolation, smoothing, or AI generation was used.
- Uncertain and isolated frames were retained under `miscellaneous/isolated_poses/`.
- Sequence folders contain normalized PNG frames, `preview.png`, and `animation.json`.

## Constructed sequences

| Character | Sequence | Frames | Playback | FPS | Confidence | Abrupt jump flagged |
|---|---|---:|---|---:|---|---|
| Loko | `drink_02` | 7 | loop | 6 | high | no |
| Loko | `eat` | 9 | loop | 6 | high | no |
| Loko | `idle_front` | 8 | loop | 3 | high | no |
| Loko | `laptop` | 12 | loop | 4 | medium | yes |
| Loko | `locomotion_side_01` | 3 | loop | 8 | medium | no |
| Loko | `locomotion_side_02` | 7 | loop | 8 | medium | no |
| Loko | `love_reaction` | 8 | once | 6 | medium | yes |
| Loko | `music` | 11 | loop | 8 | high | no |
| Loko | `peeking_01` | 3 | once | 6 | high | no |
| Loko | `peeking_02` | 5 | once | 6 | high | no |
| Loko | `playing_ball_01` | 7 | once | 8 | high | no |
| Loko | `reading_01` | 5 | loop | 4 | high | no |
| Loko | `sleep_loop` | 3 | ping_pong | 3 | high | no |
| Loko | `sleep_transition` | 6 | once | 6 | high | no |
| Poko | `drink` | 8 | loop | 6 | high | no |
| Poko | `eat` | 11 | loop | 6 | medium | yes |
| Poko | `idle_blink` | 2 | ping_pong | 6 | high | no |
| Poko | `idle_look_01` | 2 | ping_pong | 4 | high | no |
| Poko | `locomotion_side` | 9 | loop | 8 | medium | no |
| Poko | `music` | 12 | loop | 8 | high | no |
| Poko | `peeking` | 12 | once | 6 | medium | yes |
| Poko | `playing_ball` | 11 | once | 8 | high | no |
| Poko | `sad_to_crying` | 8 | once | 6 | high | no |
| Poko | `sleep_loop_01` | 7 | ping_pong | 3 | high | no |
| Poko | `sleep_loop_02` | 4 | ping_pong | 3 | high | no |
| Poko | `sleep_transition` | 8 | once | 6 | high | no |

## Retained isolated or uncertain poses

- Poko: **98**
- Loko: **120**

## Important limitation

Pixel-difference flags are QA signals, not semantic truth. A large difference may be intentional in a one-shot reaction, while a visually awkward transition can sometimes have a modest numeric difference. Playback review remains necessary before final production approval.