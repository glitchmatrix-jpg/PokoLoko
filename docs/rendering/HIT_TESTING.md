# PokoLoko — Alpha-Aware Hit Testing

## Problem

A transparent BrowserWindow is still a rectangle. If the complete window accepts input, its transparent safety margin blocks clicks intended for desktop applications.

## Step 08 strategy

1. The native pet window starts with `setIgnoreMouseEvents(true, { forward: true })`.
2. The renderer loads the authoritative PNG into an offscreen 128×128 canvas with smoothing disabled.
3. Forwarded pointer movement is converted from native-window/CSS coordinates into sprite-canvas coordinates using the exact integer scale and sprite offset.
4. The alpha byte is sampled at that pixel.
5. Alpha values of 24 or greater mark the body as interactive.
6. The renderer sends a narrow typed IPC command only when interactive status changes.
7. The main process enables input over visible pixels and restores pass-through over transparent pixels.

Effects do not create a giant rectangular hit target. At this stage the alpha mask includes all visible pixels in the displayed frame; later interaction work may replace this with curated body masks so hearts or notes do not become draggable regions.

## Boundaries

- No raw input stream is stored.
- No keystrokes are inspected.
- Pointer positions are used transiently inside the renderer.
- The renderer cannot move the native window.
- The native window remains pass-through while loading or if alpha-mask generation fails.

## Native limitations to test

Electron's forwarded mouse behavior must be confirmed on the target Windows versions. Test entering the pet from every side, clicking visible pixels, clicking transparent holes, auto-hidden taskbar reveal, and rapid movement across mixed-DPI monitor boundaries.
