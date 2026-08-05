# Poko & Loko Asset Pack v1

A production-ready sprite asset library for the **Poko Loko** desktop-pet project.

This pack was built from two transparent source sheets:

- `Poko_Sprite_Sheet_original.png`
- `Loko_Sprite_Sheet_original.png`

The assets were audited, indexed, extracted, semantically classified, normalized, packaged, and validated for later use in an Electron/React/TypeScript desktop-pet application.

The original sprite sheets are preserved unchanged under `reference/`.

---

## What this pack contains

The package includes:

- preserved source sprite sheets;
- indexed source maps;
- normalized contact sheets;
- extracted animation frames;
- isolated useful poses;
- transparent animation previews;
- alignment QA previews;
- per-animation metadata;
- global and per-character manifests;
- a typed TypeScript animation registry;
- a safe state-transition graph;
- extraction and QA reports;
- developer validation and loading metadata.

The current authoritative runtime library contains:

- **31 normalized runtime animations**
- **223 PNG runtime animation frames**
- **218 retained isolated poses**
- **406 total source candidates accounted for**
- **2 generated mirrored walk animations**
- **0 rejected source candidates**

Runtime assets are always the PNG frame files. GIF files are documentation previews only.

---

## Final directory structure

```text
Poko_Loko_Asset_Pack_v1/
├── README.md
├── asset_manifest.json
├── extraction_report.md
├── qa_report.md
├── qa_manifest.json
├── frame_index_manifest.json
├── semantic_classification.json
├── sequence_registry.json
├── normalized_sequence_registry.json
├── canvas_anchor_manifest.json
├── direction_manifest.json
│
├── reference/
│   ├── Poko_Sprite_Sheet_original.png
│   ├── Loko_Sprite_Sheet_original.png
│   ├── poko_indexed_map.png
│   ├── loko_indexed_map.png
│   ├── poko_contact_sheet.png
│   ├── loko_contact_sheet.png
│   ├── poko_anchor_audit_contact_sheet.png
│   ├── loko_anchor_audit_contact_sheet.png
│   ├── poko_scale_audit_contact_sheet.png
│   └── loko_scale_audit_contact_sheet.png
│
├── characters/
│   ├── poko/
│   │   ├── poko_manifest.json
│   │   ├── animations/
│   │   ├── props/
│   │   └── effects/
│   └── loko/
│       ├── loko_manifest.json
│       ├── animations/
│       ├── props/
│       └── effects/
│
├── normalized/
│   ├── poko/
│   │   ├── idle/
│   │   ├── locomotion/
│   │   ├── sleeping/
│   │   ├── emotions/
│   │   ├── activities/
│   │   └── miscellaneous/
│   └── loko/
│       ├── idle/
│       ├── locomotion/
│       ├── sleeping/
│       ├── emotions/
│       ├── activities/
│       └── miscellaneous/
│
└── developer/
    ├── animation_registry.json
    ├── animation_registry.ts
    ├── transition_graph.json
    └── transition_graph.ts
```

The `normalized/` tree is the authoritative runtime asset source.

The `characters/` tree contains working extraction outputs, source classifications, and retained non-runtime candidates.

---

## Canvas size

Every normalized runtime frame uses a shared transparent canvas:

```text
128 × 128 pixels
```

The same canvas is used for both Poko and Loko.

This size was selected because it:

- preserves the original sprite scale;
- leaves room for hearts, notes, sleep symbols, balls, books, laptops, and furniture;
- avoids clipping;
- keeps anchor coordinates consistent;
- remains small enough for efficient desktop rendering.

No runtime frame was rescaled during normalization.

---

## Anchor system

The canonical normalized coordinate system is:

```text
origin:        x = 0,  y = 0
body center:   x = 64
ground line:   y = 112
```

Each `animation.json` records an anchor object similar to:

```json
{
  "anchor": {
    "ground_x": 64,
    "ground_y": 112,
    "body_center_x": 64,
    "body_center_y": 88
  }
}
```

The exact body-center Y coordinate varies naturally by posture.

Standing and walking frames are aligned using:

- detected body center;
- anatomical ground contact;
- consistent horizontal placement.

The total visible bounding box is not used for centering because effects, props, tails, notes, hearts, and furniture can distort geometric bounds.

Sitting, crouching, and sleeping poses preserve their natural height and width while remaining grounded to the same physical floor line.

---

## Normalization approach

The normalization process follows these rules:

1. Preserve the original sprite pixels.
2. Do not stretch X and Y independently.
3. Do not blur, smooth, or interpolate.
4. Do not scale a frame merely because a prop changes its bounding box.
5. Align ordinary poses by body anatomy and ground contact.
6. Preserve intentional crouching, lying, jumping, leaning, and squash.
7. Use transparent padding to reach the 128 × 128 canvas.
8. Keep effects and props in the full composite frame.
9. Record all anchor and scale decisions in metadata.

The final scale factor for all runtime frames is:

```text
1.0
```

No runtime frame was resampled.

---

## Naming conventions

Directories use lowercase snake_case:

```text
walk_right/
sleep_loop/
love_reaction/
playing_ball/
```

Frame files use continuous, zero-padded numbering:

```text
frame_000.png
frame_001.png
frame_002.png
```

Every usable animation directory contains:

```text
frame_000.png
frame_001.png
...
preview.png
preview.gif
preview_alignment.gif
animation.json
```

Avoid filenames such as:

```text
final2.png
new.png
sprite_copy.png
thing.png
```

---

## Animation categories

The runtime library may contain animations in these broad categories:

- `idle`
- `locomotion`
- `posture_transitions`
- `sleeping`
- `emotions`
- `activities`
- `miscellaneous`

Current activity families include examples such as:

- eating;
- drinking;
- music;
- reading;
- laptop use;
- ball play;
- peeking;
- furniture interaction.

A source row is not automatically treated as an animation. Only visually plausible temporal sequences were promoted into runtime animation folders. Other valid frames remain in `miscellaneous/isolated_poses/`.

---

## Loading an animation

The easiest integration route is the generated TypeScript registry:

```ts
import { animations } from "./developer/animation_registry";

const walk = animations.poko.walkRight;

console.log(walk.frames);
console.log(walk.fps);
console.log(walk.loop);
console.log(walk.anchor);
```

A minimal animation player can advance through the frame paths using the animation FPS:

```ts
type AnimationDefinition = {
  readonly frames: readonly string[];
  readonly fps: number;
  readonly loop: boolean;
  readonly playback: "forward" | "ping_pong";
};

export function frameDurationMs(animation: AnimationDefinition): number {
  return 1000 / animation.fps;
}
```

For Electron or React, resolve each relative path from the packaged asset root.

Use forward-slash paths exactly as stored in the registry.

---

## Sprite animation versus locomotion

**Sprite animation alone does not move the desktop pet.**

Playing `walk_right/frame_000.png`, `frame_001.png`, and so on only changes the character image. It does not change the character's position on the desktop.

The application must separately update the pet or window X coordinate during walking.

For example:

```ts
const deltaSeconds = elapsedMs / 1000;
const nextX =
  currentX +
  animation.movement.signed_speed_css_px_per_second * deltaSeconds;
```

For a transparent Electron window, locomotion may require updating the window position:

```ts
const [x, y] = browserWindow.getPosition();
browserWindow.setPosition(
  Math.round(x + speedPxPerSecond * deltaSeconds),
  y,
);
```

For an in-window sprite layer, update the sprite's CSS transform or left position instead.

The animation metadata contains:

```json
{
  "movement": {
    "moves_character": true,
    "recommended_speed_css_px_per_second": 45,
    "signed_speed_css_px_per_second": 45
  }
}
```

Right-facing movement uses a positive signed speed.

Left-facing movement uses a negative signed speed.

The frame animation and positional movement must run together.

---

## Mirrored frames

The source art was audited before any directional mirroring.

Generated mirrored runtime animations:

- Poko `walk_left`
- Loko `walk_left`

These were generated from audited right-facing walk assets.

Each mirrored manifest contains:

```json
{
  "generated_by_mirroring": true,
  "direction": "left",
  "mirrored_from": "poko_walk_right"
}
```

The original right-facing assets remain preserved.

Mirroring was not applied to frames containing meaning-bearing text, directional symbols, asymmetric props, or effects.

Loko's front-facing walk-preparation sequence was retained without mirroring because it is not a genuine left- or right-facing walk cycle.

---

## State transitions

Use the generated transition graph:

```ts
import {
  getAllowedTransitions,
  isTransitionForbidden,
} from "./developer/transition_graph";
```

The graph prevents abrupt transitions such as:

- sleep directly to walking;
- lying directly to an upright reaction;
- prop-heavy activity directly to walking;
- instant mid-cycle direction reversal.

Where no visual bridge exists, use one of these runtime strategies:

- finish the current loop;
- hold the final frame briefly;
- return to a neutral idle;
- wait for a short cross-state delay;
- then begin the requested target animation.

Do not generate fake transition frames at runtime.

Do not blur or crossfade pixel art unless the final application deliberately chooses that visual style.

---

## Preview assets

Each animation includes:

- `preview.png` — horizontal frame strip;
- `preview.gif` — normal animation preview;
- `preview_alignment.gif` — checkerboard and anchor-guide QA preview.

The alignment GIF displays:

- body-center line at `x = 64`;
- ground line at `y = 112`;
- contact marker;
- normalized canvas.

These files are for inspection and documentation.

Do not use preview GIFs as runtime assets.

GIF supports only binary transparency and cannot preserve the full semi-transparent alpha edges of the PNG frames.

---

## Known limitations

- Some source rows contain branching transitions rather than one continuous animation.
- Some emotion groups are related pose variants rather than chronological sequences.
- A few animation sequences remain medium-confidence and should receive final human playback review.
- Props and effects are preserved in composite frames, but few were separated into independent reusable runtime assets.
- No fabricated missing frames were created.
- No interpolation was used to repair incomplete transitions.
- A dedicated stop animation does not exist for every walking sequence.
- Some transitions therefore use a short runtime hold and neutral idle.
- The final pack includes isolated valid poses that are not yet assigned to runtime states.
- GIF previews do not retain full semi-transparent alpha.

See:

- `qa_report.md`
- `extraction_report.md`
- `transition_graph_report.md`
- each animation's `known_issues`

for detailed limitations.

---

## Adding future animations safely

To add a new animation without breaking scale or alignment:

1. Preserve the original source frame unchanged.
2. Extract the full composite with alpha transparency.
3. Do not crop based only on detached props or effects.
4. Keep the character at the existing perceived scale.
5. Do not resize unless a real source-scale inconsistency is proven.
6. If scaling is unavoidable, use one uniform nearest-neighbor scale factor.
7. Place every frame on a 128 × 128 transparent canvas.
8. Align the body center near `x = 64`.
9. Align the physical ground contact near `y = 112`.
10. Keep props and effects from shifting the body anchor.
11. Use zero-padded frame names.
12. Create `preview.png`, `preview.gif`, and `preview_alignment.gif`.
13. Add a complete `animation.json`.
14. Update:
    - `asset_manifest.json`
    - the relevant character manifest
    - `developer/animation_registry.json`
    - `developer/animation_registry.ts`
    - the transition graph
15. Run the same QA checks before accepting the new animation.

Do not force lying, sitting, jumping, or crouching bodies to match the standing silhouette. Alignment should be physically consistent, not geometrically identical.

---

## Recommended runtime flow

A safe desktop-pet state change should usually follow this order:

```text
finish current frame or loop boundary
→ apply recommended hold
→ enter explicit transition or neutral idle
→ start target animation
→ update X position separately when locomotion is active
```

The sprites are now organized. The app still has to make the creature feel alive.
