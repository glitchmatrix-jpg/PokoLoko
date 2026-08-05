# Extraction Report

## Step 3 — Indexed maps and frame registry

Two annotated indexed maps were created:

- `reference/poko_indexed_map.png`
- `reference/loko_indexed_map.png`

Frame IDs follow the required pattern:

- Poko: `P-R##-C##`
- Loko: `L-R##-C##`

Rows were detected visually from alpha-visible horizontal bands. Within each row, candidates were ordered strictly from left to right by visible bounding-box x-coordinate.

A total of **406** candidate frames were indexed:

- **192 Poko**
- **214 Loko**

The machine-readable registry records source crop bounds, visible-pixel bounds, row/order, tentative pose family, tentative sequence family, confidence, detached-component count, and notes.

Tentative pose and sequence labels are deliberately broad. They are navigation metadata for the next classification stage, not final animation claims.

## Step 4 — Semantic classification

All indexed frames were visually classified into conservative semantic families. Each frame now records a category, pose label, tentative sequence, continuity assessment, confidence level, and notes.

Crucially, row adjacency was not treated as proof of animation. Frames are separated into `plausible_sequence`, `isolated_variants`, and `uncertain_sequence` classes. Only the first class is eligible for direct animation construction without additional ordering review.

## Step 5 — Sequence construction

Constructed **26** candidate animations from only those frame groups previously judged to have plausible temporal continuity. Source order was retained unless clear motion evidence required a change; no unsupported reorder was imposed. Exact duplicates, near-duplicates, suspected abrupt transitions, playback mode, loop behavior, and FPS guidance are recorded in each `animation.json`.

All uncertain and isolated valid sprites were preserved under each character's `miscellaneous/isolated_poses/` directory.

## Step 6 — Character scale normalization

Canonical upright body scales were estimated independently for Poko and Loko using robust anatomical body proxies from idle, emotional, and locomotion frames. Full-frame bounds were not used because effects and props corrupt those measurements.

No frame was resized. The source artwork already shows stable perceived character scale, while the few frames outside a conservative ±10% height band represent intentional pose or expression changes. Every animation manifest now records the character's canonical body scale and an explicit uniform scale factor of `1.0`.

## Step 7 — Canvas and anchor normalization

All constructed animation frames were placed on a common transparent **128×128** canvas shared by Poko and Loko. Character placement uses the body proxy and anatomical ground contact rather than the total visible bounding box. The canonical target is body center x = **64** and ground y = **112**.

No frame was resized or resampled. Detached effects and props do not influence body centering. Minimal translation-only safety shifts were used where necessary to keep full composites inside the canvas; every shift is recorded per frame.

## Step 8 — Left and right directions

Directional locomotion was manually audited before mirroring. Poko's directional walk and Loko's seven-frame directional walk were classified as right-facing and received clearly marked `walk_left` derivatives. Loko's three-frame front-facing preparation group was retained unchanged and was not mirrored.

Mirrored assets preserve the originals, use a horizontal pixel flip without resampling, and include `generated_by_mirroring: true`. Anchor x-coordinates were transformed to the mirrored 128×128 coordinate space.

## Step 9 — File naming and previews

All **57** animation directories were standardized to lowercase snake_case naming and continuous zero-padded PNG frame names. Every animation directory now contains `preview.png`, `preview.gif`, and `animation.json`.

GIF previews were generated without resizing or interpolation and use binary transparency where supported. Because GIF cannot retain full semi-transparent alpha, it is explicitly marked as preview-only; PNG frames remain the runtime assets.

## Step 10 — Animation metadata

All **57** animation directories now use a consistent production metadata schema. Each `animation.json` records state, direction, source frame IDs, PNG runtime frames, canvas dimensions, FPS guidance, playback behavior, anchors, movement metadata, valid transitions, mirroring provenance, confidence, and known issues.

Final-to-first loop seams were evaluated numerically against internal frame-to-frame motion. Weak idle or activity loops were switched to ping-pong where appropriate; imperfect forward loops are explicitly flagged rather than silently accepted.

## Step 11 — Global manifests

Created the global package manifest, per-character manifests, and developer registries. The package contains **31 normalized runtime animations**, **218 isolated poses**, and **406 accepted source character frames** from **406 detected candidates**.

All runtime paths use relative POSIX-style forward slashes. `developer/animation_registry.ts` is typed and directly importable by an Electron/React/TypeScript application.

## Step 12 — Safe transition graph

Created per-character transition graphs using only existing animation IDs. Sleep, lying, prop-heavy activity, and locomotion states are protected from abrupt cross-state jumps. Missing bridge animations are handled by explicit runtime hold recommendations and neutral-idle routing rather than fabricated visual frames.

The transition graph is stored in both JSON and TypeScript and is embedded into each character manifest and each normalized `animation.json`.

## Step 13 — Quality assurance

Automated QA validated **223 runtime PNG frames** across **31 authoritative normalized animations**. Checks covered format, alpha support, canvas size, clipping, blank/corrupt frames, duplicate names, background opacity, edge contact, white fringe, body-scale outliers, ground-anchor stability, centroid shifts, perceptual differences, and loop seams.

Outliers were flagged for manual inspection rather than deleted. Full details are available in `qa_report.md` and `qa_manifest.json`.

## Step 14 — Contact sheets and previews

Created final normalized contact sheets for Poko and Loko, showing every accepted normalized source frame at 1:1 scale with frame ID, assigned animation, and frame number. Documentation-only checkerboards and fixed body-center/ground guides make alignment stability visible.

All **31** authoritative animations now include a transparent `preview.gif` and a documentation-only `preview_alignment.gif`. Runtime assets remain PNG frames.

## Step 15 — README

Created the package README with the final directory structure, 128×128 canvas system, anchors, normalization policy, naming conventions, animation categories, loading examples, state-transition guidance, mirrored-frame provenance, limitations, and instructions for adding future animations.

The README explicitly distinguishes sprite-frame playback from physical locomotion: walking frames animate the character image, while the application must independently update the sprite or Electron window X coordinate.
