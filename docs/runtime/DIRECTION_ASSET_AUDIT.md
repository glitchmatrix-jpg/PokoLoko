# Direction Asset Audit

## Approved locomotion sequences

- Poko: 9-frame right and 9-frame left cycles, 8 FPS, ground Y 112.
- Loko: 7-frame right and 7-frame left cycles, 8 FPS, ground Y 112.
- Loko preparation: 3 frames at 8 FPS, used as a one-shot runtime phrase despite archival loop metadata.

## Conclusions

- No approved dedicated turn sequence exists.
- No approved dedicated stop sequence exists.
- Neutral front idle is the safest direction-neutral bridge.
- Runtime DOM mirroring is prohibited for the current direction path.
- Only the pre-approved left walk assets are used.
- Activities with books, laptops, food, drinks, balls, notes, or hearts never enter the direction controller.

## Anchor parity

| Sequence | Ground X | Ground Y | Body center X | Body center Y |
|---|---:|---:|---:|---:|
| Poko right | 64 | 112 | 64 | 88 |
| Poko left | 63 | 112 | 63 | 88 |
| Loko right | 64 | 112 | 64 | 90 |
| Loko left | 63 | 112 | 63 | 90 |

The one-pixel X difference is intentional manifest metadata and is handled through anchor-based window geometry rather than recentering.
