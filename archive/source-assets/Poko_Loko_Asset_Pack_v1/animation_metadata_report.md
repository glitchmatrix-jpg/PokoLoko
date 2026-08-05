# Step 10 — Animation Metadata

Standardized `animation.json` metadata in **57** animation directories.

## Metadata now included

- stable animation ID, character, category, state, and direction;
- source frame IDs and runtime PNG frame list;
- frame count and fixed canvas dimensions;
- recommended FPS and FPS range;
- loop flag and playback mode;
- final-to-first loop seam validation;
- canonical ground/body-center anchors;
- movement behavior and recommended CSS speed;
- allowed transition sources and destinations;
- recommended next state for one-shot animations;
- mirroring provenance;
- confidence and known issues;
- retained technical normalization and per-frame anchor details.

## Playback summary

- `forward`: **54** animations
- `ping_pong`: **3** animations

## Loop validation

- Imperfect forward-loop seams detected: **3**
- Idle, sleep, reading, laptop, food, drink, and music loops with weak seams were switched to `ping_pong` where safer.
- Other imperfect loops remain forward but are explicitly marked for review.
- One-shot reactions and transitions use `loop: false` and identify a recommended next state.

## Validation

- Metadata files updated: **57**
- Structural issues detected: **0**

## Imperfect loop seams

- `loko_eat` — playback `ping_pong`
- `poko_sleep_loop_01` — playback `ping_pong`
- `poko_sleep_loop_01` — playback `ping_pong`