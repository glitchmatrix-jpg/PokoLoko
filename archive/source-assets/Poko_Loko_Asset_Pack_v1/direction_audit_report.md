# Step 8 — Left and Right Direction Audit

Locomotion candidates were visually audited before any mirrored derivatives were generated.

## Audit results

| Character | Source sequence | Classification | Mirrored? | Output |
|---|---|---|---|---|
| Loko | `locomotion_side_01` | neutral_transition | no | `normalized/loko/locomotion/walk_preparation` |
| Loko | `locomotion_side_02` | right | yes | `normalized/loko/locomotion/walk_right`<br>`normalized/loko/locomotion/walk_left` |
| Poko | `locomotion_side` | right | yes | `normalized/poko/locomotion/walk_right`<br>`normalized/poko/locomotion/walk_left` |

## Decisions

- Poko's directional locomotion source was classified as right-facing and received a mirrored `walk_left` derivative.
- Loko's seven-frame directional locomotion source was classified as right-facing and received a mirrored `walk_left` derivative.
- Loko's three-frame front-facing weight-shift group was retained as `walk_preparation` and was not mirrored.
- No text, meaning-bearing symbol, held prop, directional effect, or asymmetric shadow was present in the mirrored walk sources.
- Original normalized sequences and untouched source sheets remain preserved.
- Mirrored PNGs were created with a horizontal pixel flip only. No interpolation or resampling occurred.

## Metadata

Every generated left-facing animation contains:

```json
"generated_by_mirroring": true,
"direction": "left",
"mirrored_from": "<character>_walk_right"
```

All anchor x-coordinates were transformed using:

`x_mirrored = canvas_width - 1 - x_original`