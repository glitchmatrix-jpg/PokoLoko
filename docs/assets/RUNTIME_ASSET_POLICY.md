# PokoLoko — Runtime Asset Policy

## Scope

The archival `Poko_Loko_Asset_Pack_v1` remains the authoritative visual archive and is not copied wholesale into the application. Step 06 ships only the **31 Step-01-approved normalized animations (223 PNG frames)** required for foundational movement, ambient life, contextual activities, spontaneous play, social reactions, and sleep.

## Source-of-truth chain

1. Archival ZIP checksum: `020337a053554e08a8af796ea35b0732e4820b77b9c02f4ab5a9c78838134a55`.
2. Step 01 `ASSET_DECISIONS.json` decides runtime eligibility.
3. Normalized 128×128 animation directories provide frame pixels and anchor metadata.
4. `public/assets/runtime/runtime_manifest.json` is runtime metadata truth.
5. `runtime_registry.ts` is generated from that JSON and must not be hand-edited.

## Included

- all 31 approved animations;
- 223 authoritative normalized RGBA PNG frames;
- Poko and Loko locomotion, idle, sleep, activities, and social reactions;
- two approved mirrored walk sequences;
- numerical anchors, per-frame anchors, posture, prop, interruption, transition, confidence, and checksum metadata.

## Excluded

- preview GIF/PNG files;
- checkerboard alignment previews;
- detection candidates;
- raw sheets;
- duplicate reports and CSVs;
- all 218 isolated poses until the Animation Laboratory explicitly approves specific bridge keys;
- unsupported or semantically ambiguous material.

Exclusion from runtime does not delete or reject archival material. It prevents ambiguity from leaking into planning logic.

## Stable IDs and migration

Animation IDs are public runtime contracts. A replacement must retain the ID only when posture, direction, prop ownership, and semantic action remain compatible. Pixel/frame changes require:

1. source archive or patch provenance;
2. manifest version bump;
3. regenerated frame checksums;
4. 128×128 RGBA validation;
5. visual inspection in the Animation Laboratory;
6. loop and transition reapproval;
7. packaged-path smoke test.

Breaking semantics require a new ID and a major runtime-manifest version bump. IDs are never silently renamed.

## Mirroring

Only source-pack sequences marked `generated_by_mirroring` are shipped as mirrored animations. Runtime code may not mirror arbitrary composite props, effects, or asymmetric actions.

## Path policy

Manifest frame URLs use `/assets/runtime/...` for Vite development and renderer loading. Native startup validation converts those URLs through `packagedAssetPath`, which resolves to `public` in development and `dist` in packaged builds. Vite copies `public/assets/runtime` into `dist/assets/runtime` unchanged.

## Integrity checks

`npm run validate:assets` verifies:

- path existence;
- PNG signature and decompression;
- RGBA 8-bit color type;
- 128×128 dimensions;
- nonblank alpha occupancy;
- frame count;
- source SHA-256;
- mirrored metadata;
- manifest totals and unique IDs.

Development startup also checks that the manifest and every referenced frame are readable. Failures name the animation and missing frame instead of producing a blank pet.

## Planner boundary

The behavior planner may query only approved registry entries. Audit confidence, unsupported isolated poses, detection candidates, and archival filenames never become candidate actions directly.
