# PokoLoko — Step 06 Change Report

## Implemented

- Converted Step 01 decisions into a compact runtime set.
- Shipped all 31 approved animations and 223 normalized PNG frames.
- Preserved 128×128 RGBA canvases and numerical/per-frame anchors.
- Added posture, prop, transition, interruption, movement, confidence, source-frame, mirroring, and checksum metadata.
- Generated a typed static registry from JSON truth.
- Added dependency-free deep PNG/checksum validation.
- Added development-mode startup path/readability validation.
- Added Vite development/packaged path-policy tests.
- Kept the archival asset pack and all isolated poses outside runtime.

## Deliberate exclusions

No isolated pose is shipped yet because Step 01 marked bridge selection as requiring Animation Laboratory curation. This prevents ambiguous keys from becoming planner-visible before Step 07.

## Validation performed here

- all runtime PNGs opened with Pillow as RGBA;
- all canvases are 128×128;
- every frame has both transparent and visible pixels;
- all source/runtime checksums match;
- all 31 animation IDs are unique;
- all frame paths resolve;
- all generated mirrored entries declare source metadata;
- Node dependency-free validator passes;
- ZIP integrity passes.

## Environment limitation

The Step 05 npm-registry blocker remains external to this repository. Therefore full npm install, TypeScript compilation, Vite build, Electron launch, and packaged Windows smoke tests still require the documented Windows closure procedure. Step 06 does not falsely claim those native checks passed in this container.
