# Step 4 — Semantic Sprite Classification

Every indexed composite candidate was inspected through the generated contact sheets and assigned a conservative semantic classification.

## Classification policy

- Adjacency in a source row is not sufficient evidence of animation continuity.
- `plausible_sequence` means the frames show a believable temporal progression.
- `isolated_variants` means related poses exist but should not be auto-played as one animation.
- `uncertain_sequence` means the family is recognizable but ordering or continuity is not yet safe.
- No missing category was fabricated.

## Frame totals by category

| Character | Category | Frames |
|---|---|---:|
| Loko | ACTIVITIES | 91 |
| Loko | EMOTIONS | 40 |
| Loko | IDLE | 21 |
| Loko | LOCOMOTION | 10 |
| Loko | POSTURE_TRANSITIONS | 43 |
| Loko | SLEEP | 9 |
| Poko | ACTIVITIES | 76 |
| Poko | EMOTIONS | 49 |
| Poko | IDLE | 17 |
| Poko | LOCOMOTION | 9 |
| Poko | POSTURE_TRANSITIONS | 30 |
| Poko | SLEEP | 11 |

## Continuity assessment

| Character | Assessment | Frames |
|---|---|---:|
| Loko | `isolated_variants` | 33 |
| Loko | `plausible_sequence` | 97 |
| Loko | `uncertain_sequence` | 84 |
| Poko | `isolated_variants` | 36 |
| Poko | `plausible_sequence` | 95 |
| Poko | `uncertain_sequence` | 61 |

## High-confidence activity families

Both characters contain visually coherent candidate families for sleeping, eating, drinking, music/dance, laptop use, reading, ball/object play, and peeking/furniture interaction. These are still candidates until frame ordering and anchor normalization are validated.

## Important cautions

- Side-facing locomotion is visually plausible but exact loop order still requires animation playback review.
- Lowering, sitting, rolling, and lying rows frequently contain branching transitions rather than one long sequence.
- Emotion rows often contain several related isolated reactions, not a single chronological animation.
- Props and detached effects remain part of their composite frames; reusable separation is handled independently.