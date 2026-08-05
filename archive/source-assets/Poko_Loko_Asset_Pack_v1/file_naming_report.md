# Step 9 — File Naming and Preview Packaging

Processed **57** animation directories.

## Naming rules enforced

- Runtime-facing directories use lowercase snake_case.
- Frame PNGs use continuous zero-padded names: `frame_000.png`, `frame_001.png`, and so on.
- Every animation directory contains `preview.png`, `preview.gif`, and `animation.json`.
- Runtime assets remain PNG frame files. GIF files are previews only.

## Preview GIF policy

- GIF previews were generated without resizing or interpolation.
- Frame pixels are taken directly from the normalized PNG canvases.
- Transparent pixels use a dedicated transparent GIF palette index.
- GIF supports binary transparency only, so it cannot reproduce the PNG frames' full semi-transparent edge alpha.
- The original PNG frames remain authoritative for runtime rendering.

## Results

- Animation directories updated: **57**
- Preview GIFs created: **57**
- Directories renamed: **0**
- Frame files renamed: **0**
- Naming or packaging validation issues: **0**
- Processing errors: **0**