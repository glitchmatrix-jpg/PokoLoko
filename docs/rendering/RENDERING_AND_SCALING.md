# PokoLoko — Rendering and Scaling

## Static renderer contract

Step 08 renders one authoritative frame for the selected character. Poko uses the first frame of `poko_idle_blink`; Loko uses the first frame of `loko_idle_front`. Both come from the validated runtime manifest and remain inside the same fixed 128×128 logical canvas.

The renderer never crops to visible bounds, never uses `object-fit: contain`, and never computes a character-specific scale. The PNG is placed at an explicit sprite offset inside a transparent safety-margin window.

## Integer scaling

Supported sizes are exactly 1×, 2×, and 3×. CSS dimensions are calculated as `128 × scale` in logical pixels. The browser uses `image-rendering: pixelated`/`crisp-edges`, image smoothing is disabled for alpha-mask analysis, and fractional user sizes are rejected.

Windows display scale (100%, 125%, 150%, mixed DPI) changes Electron DIP-to-physical-pixel conversion; it does not change the logical sprite scale. This prevents Poko and Loko from acquiring different perceived sizes when moved between monitors.

## Anchor placement

The manifest ground anchor is the placement authority:

```text
windowX + spriteOffsetX + anchorX × scale = globalGroundX
windowY + spriteOffsetY + anchorY × scale = globalGroundY
```

Visible bounds, tails, ears, effects, or transparent padding never recenter the pet.

## Alpha and filtering

Runtime validation already proves every shipped frame is RGBA, 128×128, nonblank, and transparent. The static renderer adds no background, filter, shadow, blend effect, or interpolation. The native window is frameless, transparent, shadowless, and uses `#00000000`.

## Responsibilities

### Main process
- selects display/work area;
- computes native window bounds;
- resolves authoritative animation metadata;
- applies character/size changes;
- responds to display topology changes;
- controls native mouse-event pass-through.

### Renderer
- displays the exact frame at supplied dimensions and offset;
- builds a local alpha mask;
- reports whether the pointer is over an opaque body pixel;
- never moves or grounds the native window.

## Required native verification

The implementation must still be inspected on Windows at 100%, 125%, 150%, and mixed-DPI arrangements. Automated geometry tests prove the coordinate math, not DWM composition quality.
