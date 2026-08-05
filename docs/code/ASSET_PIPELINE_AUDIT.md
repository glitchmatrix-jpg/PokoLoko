# Asset Pipeline Audit

## Current pipeline

The current application ships a hand-authored `public/assets/animations.json` with 12 required animation groups per character and 265 referenced PNG frames:

- Poko: 135 frames.
- Loko: 130 frames.
- 24 animation definitions total.

Every definition contains only:

- FPS;
- loop boolean;
- next animation name;
- the literal anchor string `bottom-center`;
- relative frame paths.

The renderer imports this JSON at build time. `useSpriteAnimation` resolves each path against `document.baseURI`. In development the public directory is served at the Vite root; in production Vite copies public assets to `dist`, and `base: './'` supports package-relative `file://` URLs.

## Main-process manifest route

`readAnimationManifest()` resolves `assets/animations.json` from `public` in development or `dist` in production. It is exposed through the unused `animations:get` handler. The renderer does not use this route and instead bundles/imports the JSON directly. This is duplicate asset-access architecture.

## Validation

`scripts/validate-assets.mjs` successfully passed in the audit environment:

`Asset validation passed: 265 PNG frames across 24 required animations.`

It checks:

- both characters and 12 fixed names;
- positive FPS;
- nonempty frame arrays;
- relative paths;
- file existence;
- minimal PNG signature;
- dimensions read from the PNG IHDR;
- consistent dimensions within each animation.

It does **not** check:

- alpha channel/transparency;
- exact required 128 × 128 canvas;
- cross-animation canvas consistency;
- clipping;
- anchors;
- visible-scale consistency;
- centroid or ground jitter;
- duplicate frames;
- frame chronology;
- loop continuity;
- manifest `next` validity;
- playback modes beyond boolean looping;
- semantic posture compatibility;
- mirrored provenance;
- prop continuity;
- asset hashes;
- unused or orphaned assets.

## Stale assumptions

- The runtime defines 24 generic animations, while the authoritative completed pack contains 31 richer animations plus 218 isolated poses.
- All frames are reduced to `bottom-center`, discarding numerical ground/body anchors.
- No posture, direction-neutrality, confidence, transition graph, activity phase, prop state, interruption policy, or movement metadata survives.
- `sit`, `wake`, `landing`, `dragged`, `happy`, and `confused` are treated as equivalent generic concepts for both characters even when source semantics differ.
- CSS `object-fit: contain` and `object-position: center bottom` become the final placement authority, defeating the processed pack's coordinate normalization.
- The old icons and brand name are Poko-only and conflict with the final PokoLoko identity.

## Path and packaging findings

The relative URL strategy is conceptually sound for a single Vite output. Electron-builder includes `dist/**/*`, so copied public assets should package correctly. However:

- There is no `asarUnpack` requirement because images are renderer-loaded, but this must be retested after the runtime adapter.
- No startup integrity check reports missing files in production.
- A failed image decode is silently ignored; missing frames can render as broken/blank without a structured diagnostic.
- Preloading instantiates `Image` objects for every animation switch but has no global cache ownership or failure report.

## Decision

Delete the old manifest and asset tree from the redesigned runtime. Build a generated runtime adapter from the authoritative asset pack, preserving numerical anchors, playback, posture, transitions, confidence, prop state, interruption safety, and source provenance. Retain the idea of an automated validator, but replace its schema and checks.
