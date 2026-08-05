# PokoLoko — Coordinate Systems

## Spaces

### 1. Global screen space
OS virtual-desktop coordinates. May contain negative X/Y values and mixed-DPI displays.

### 2. Display work-area space
The usable area of one display after taskbar/dock reservation. Stored in global screen coordinates:

```ts
type WorkArea = { displayId: string; x: number; y: number; width: number; height: number; scaleFactor: number };
```

### 3. Electron window space
Top-left global position plus fixed logical window dimensions. Window size may be larger than 128×128 to allow safe transparent margin and effects.

### 4. Renderer CSS space
Logical pixels inside the BrowserWindow. It is not trusted as world position.

### 5. Sprite canvas space
Exactly 128×128 logical pixels for every runtime frame. No frame-specific resize.

### 6. Anchor space
Coordinates within the 128×128 sprite canvas, including:
- ground anchor;
- body center;
- interaction anchor;
- prop anchor where available.

### 7. Hit-mask space
A binary or region-based mask defined in sprite-canvas coordinates and transformed through the current integer scale and sprite offset.

## Placement equation

Let:
- `G = (gx, gy)` be the desired global ground contact;
- `A = (ax, ay)` be the frame ground anchor;
- `S` be integer display scale;
- `O = (ox, oy)` be sprite-canvas origin inside the native window.

Then native window top-left is chosen so:

```text
windowX + ox + ax*S = gx
windowY + oy + ay*S = gy
```

Visible bounds do not participate in centering.

## Ground line

For ordinary desktop-floor behavior:

```text
groundY = workArea.y + workArea.height - configuredBottomClearance
```

Grounding uses the current display work area, not total display bounds.

## Direction mirroring

When a frame is mirrored at runtime, anchor X transforms as:

```text
mirroredAnchorX = canvasWidth - 1 - originalAnchorX
```

Only animations approved for mirroring may use this. Composite props, text-like marks, or semantically asymmetric effects require dedicated assets or no mirroring.

## DPI policy

- Internal world coordinates use Electron logical DIP units.
- Asset canvas remains 128 logical pixels.
- User size uses safe integer sprite scales where feasible.
- Mixed-DPI monitor movement triggers display reassessment and window repositioning without body-scale drift.
- No fractional image resampling is used.

## Movement precision

Locomotion maintains floating-point world X/Y. Native window coordinates are rounded only when applied:

```ts
internalX += velocityX * deltaSeconds;
windowHost.applyPosition({ x: Math.round(internalX), y: Math.round(internalY) });
```

The rounded value never feeds back as the next internal position.

## Dragging

At drag start:

```text
grabOffset = pointerScreen - windowTopLeft
```

During drag:

```text
windowTopLeft = pointerScreen - grabOffset
```

On release, horizontal position is preserved where safe; vertical position settles to the selected display’s ground anchor.

## Display removal

If the active display disappears:
1. choose the nearest remaining work area;
2. clamp a safe ground point;
3. stop movement;
4. invalidate previous destination;
5. enter deterministic recovery;
6. present neutral posture after settlement.

## Hit testing

Transparent window margin should not consume desktop input. Preferred order:

1. alpha-derived frame hit mask;
2. curated body region mask;
3. conservative sprite-canvas rectangle as fallback.

Effects such as hearts, notes, and Z symbols do not automatically expand the draggable body hit region.
