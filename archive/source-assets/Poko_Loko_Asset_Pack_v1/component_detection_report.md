# Step 2 — Individual Visual Component Detection

This pass uses alpha-connected components only as a starting point. It then identifies likely character-body anchors within each visual row and assigns nearby detached components—such as hearts, notes, tears, sleep symbols, props, or crumbs—to the nearest plausible body frame.

The resulting crops are **composite detection candidates**, not final animation classifications. Frames containing detached elements or unusually small/occluded body components are explicitly marked for manual review.

## Poko

- Detected visual rows: **16**
- Composite character-frame candidates: **192**
- Unassigned detached components retained for classification: **5**
- Indexed map: `reference/poko_indexed_map.png`
- Contact sheet: `reference/poko_contact_sheet.png`

## Loko

- Detected visual rows: **17**
- Composite character-frame candidates: **214**
- Unassigned detached components retained for classification: **0**
- Indexed map: `reference/loko_indexed_map.png`
- Contact sheet: `reference/loko_contact_sheet.png`

## Important interpretation

- Cyan boxes on indexed maps represent full composite frame candidates.
- Gold boxes represent visible detached components that could not be assigned safely during this pass.
- Assigned detached elements remain inside the full composite crop.
- Unassigned elements were preserved rather than discarded; they may later become reusable effects/props or be reassigned after visual sequence analysis.
- No final animation names or chronological ordering have been imposed yet.
- No resizing, smoothing, antialiasing, recoloring, or pixel editing was applied to extracted candidates.