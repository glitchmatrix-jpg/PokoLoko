# Step 6 — Character Scale Normalization

A canonical perceived body scale was estimated separately for Poko and Loko using ordinary upright IDLE, EMOTIONS, and LOCOMOTION frames.

The fit deliberately ignores each frame's full visible bounding box. Detached effects, props, balls, furniture, sleep symbols, and other non-body elements were not used as scale targets. The largest alpha-connected component was used as a conservative body proxy, followed by robust median measurements across ordinary upright states.

## Canonical body scales

| Character | Fit frames | Canonical body width | Canonical head-to-foot height | Middle 50% height range |
|---|---:|---:|---:|---:|
| Poko | 75 | 41 px | 47 px | 46.0–49.0 px |
| Loko | 71 | 42 px | 46 px | 44.0–47.0 px |

## Normalization decision

**No frame was resampled.** The ordinary upright source artwork is already internally consistent at the pixel level. Applying per-frame scale correction would create more harm than benefit by flattening intentional expression, orientation, squash, crouch, and posture differences.

- Uniform scale factor applied to every frame: `1.0`
- Resampling performed: `none`
- Non-uniform stretching: `none`
- Blur or interpolation introduced: `none`
- Canonical scale is now recorded in every `animation.json`.

## Conservative review-band findings

### Poko

- `P-R02-C04` — body proxy 42×52 px; height ratio 1.106. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `P-R02-C08` — body proxy 43×52 px; height ratio 1.106. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `P-R08-C04` — body proxy 39×53 px; height ratio 1.128. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `P-R08-C08` — body proxy 39×54 px; height ratio 1.149. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.

### Loko

- `L-R06-C04` — body proxy 47×40 px; height ratio 0.870. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `L-R06-C06` — body proxy 46×41 px; height ratio 0.891. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `L-R06-C07` — body proxy 47×41 px; height ratio 0.891. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `L-R07-C13` — body proxy 42×52 px; height ratio 1.130. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `L-R14-C09` — body proxy 40×41 px; height ratio 0.891. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.
- `L-R17-C03` — body proxy 43×39 px; height ratio 0.848. Preserved because the difference appears pose- or expression-driven rather than an accidental scale mismatch.

## Interpretation

Lying, sleeping, sitting, crouching, jumping, and prop-heavy frames were excluded from the upright scale fit. They retain their natural shorter, wider, raised, or displaced silhouettes.

The next alignment stage can place these source-scale-preserved sprites onto consistent canvases and anchors without resizing the character itself.