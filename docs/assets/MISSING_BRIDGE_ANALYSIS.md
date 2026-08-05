# Missing Bridge Analysis

## Critical missing bridges

| Gap | Affected assets | Runtime treatment | Support level |
|---|---|---|---|
| Front standing → side walking | Both characters | Short neutral hold, orientation frame where available, then start walk on a foot-contact key. Loko may use `walk_preparation`/`locomotion_side_01`; Poko needs a neutral hold plus direction swap. | Supported with choreography |
| Side walking → front idle | Both | Decelerate, stop on contact frame, short side hold, then front idle. Avoid instant flip mid-stride. | Supported with choreography |
| Standing → seated/low prop posture | Most food, drink, reading, laptop assets | Use compatible isolated low pose if lab-approved; otherwise a brief neutral hold and prop setup with no geometric rescaling. | Requires lab curation |
| Prop pickup / prop put-down | Laptop, books, food, cups, balls | Treat prop as activity-owned state. Use safe first/last authored frames and setup/cleanup holds. Do not pop props during locomotion. | Partially supported |
| Sleep → wake | Both | Test reverse sleep transition. If reverse reads poorly, use lying hold → drowsy isolated pose → neutral low/front pose. | Requires lab validation |
| Sitting → standing | Both | Candidate isolated poses may provide keys, but no authoritative sequence exists. | Requires curation; unsupported until proven |
| Poko explicit turn | Poko walking | Stop, hold, mirror/change direction, resume. No dedicated turn frames. | Supported without animated turn |
| Loko explicit turn | Loko walking | `locomotion_side_01` may work as orientation bridge; otherwise same stop/hold policy. | Requires lab validation |
| Edge peek → free desktop | Peeking activities | Withdraw fully below/behind edge, remove ledge context, then respawn/restore at grounded neutral position. | Supported with choreography |
| Ball activity cleanup | Both ball activities | Finish at ball-rest frame. Either keep ball as a temporary world object or remove only during a short neutral hold. | Supported with explicit policy |

## Unsupported direct transitions

The following must never occur directly:

- sleep loop → walking;
- lying → laptop/reading/eating;
- prop-held activity → unrelated prop-held activity;
- edge-peeking → free walk without withdrawal;
- crying/love climax → side locomotion in the next frame;
- front idle → mirrored side walk while the window is already moving.

## Permitted bridge mechanisms

1. Authored transition animation.
2. Curated isolated pose key, after visual validation.
3. Neutral posture routing.
4. Short hold at a compatible key frame.
5. Runtime delay while preserving the same frame.
6. Direction change only while stationary.

Crossfading, free interpolation, arbitrary scaling, and fabricated in-between pixel art are not approved bridge mechanisms.
