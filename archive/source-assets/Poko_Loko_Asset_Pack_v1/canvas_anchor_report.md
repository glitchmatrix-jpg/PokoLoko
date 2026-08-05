# Step 7 — Canvas and Anchor Normalization

All constructed animation frames were rebuilt on a shared transparent **128×128** canvas.

## Canvas decision

- Largest source composite encountered: **75×72 px**
- Selected canvas: **128×128 px**
- Shared across Poko and Loko: **yes**
- Uniform scaling applied: **none**
- Resampling: **none**
- Frames touching the normalized canvas border: **0**

A 96×96 canvas would leave insufficient safety margin for several prop-heavy, effect-heavy, and furniture-interaction poses. A 128×128 canvas preserves source scale and provides stable shared coordinates without bloating the runtime excessively.

## Canonical anchors

- Origin: `(0, 0)`
- Canonical body center x: `64`
- Canonical ground y: `112`

Ordinary frames are positioned from the detected character-body component, not the total visible bounding box. Detached hearts, notes, sleep symbols, balls, books, laptops, furniture, and similar elements therefore do not pull the character away from its anchor.

For sitting, crouching, and lying frames, the same physical ground line is used while natural body height and width changes are preserved.

## Safety shifts

- Frames requiring a minimal canvas-extents safety shift: **0**

A safety shift translates the full composite only when an effect or prop would otherwise exceed the 128×128 canvas. It never rescales or stretches the sprite. The exact adjustment is recorded per frame.

## Metadata

Each normalized `animation.json` now stores:

- origin;
- canonical canvas dimensions;
- body center;
- ground anchor;
- contact anchor;
- heuristic interaction/prop anchor where a detached reusable component exists;
- per-frame placement offset;
- any safety shift;
- explicit confirmation that full visible bounds were not used for body centering.