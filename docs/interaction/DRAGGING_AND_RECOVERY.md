# PokoLoko — Dragging, Pickup, Landing, and Recovery

## Interaction contract

Dragging begins only after a primary-button pointer press occurs on an alpha-visible pet pixel and movement exceeds six logical pixels. The renderer captures the pointer, but the main-process interaction controller owns click-versus-drag classification, drag sessions, offsets, and recovery.

## Gesture thresholds

- drag threshold: 6 logical pixels;
- click maximum duration: 280 ms;
- double-click window: 360 ms;
- double-click spatial tolerance: 12 logical pixels;
- only one pointer may own a session.

These values are configuration rather than scattered UI constants.

## Pickup representation

The current asset vocabulary has no approved universal pickup pose that is safe for every posture and prop. During an immediate drag interruption, PokoLoko therefore freezes the current authoritative frame. This preserves character scale, posture continuity, and prop truth better than snapping to an unrelated idle image. Animation resumes only after physical settlement and neutral recovery.

## Drag start

1. Alpha-aware hit testing confirms a visible body pixel.
2. Renderer captures the pointer and sends screen coordinates only.
3. Main-process interaction controller crosses the drag threshold.
4. Locomotion and direction choreography stop immediately.
5. Pending movement generations are invalidated.
6. Legal state machine enters `interaction.dragged` with a fresh generation.
7. Sprite playback pauses on the current frame.
8. Cursor-to-window grab offset is preserved.

The pet cannot continue autonomous translation while dragged.

## Drag movement

The native window is moved directly in the main process:

```text
windowTopLeft = pointerScreen - grabOffset
```

No React state update is required for every move. Floating or negative virtual-desktop coordinates are accepted. The controller does not clamp ordinary cross-monitor movement; it updates the nearest display identity from the window center.

## Release and landing

On release:

1. The native window is placed at the final cursor-relative location.
2. The release display is selected with Electron's nearest-display API.
3. The current sprite ground X is reconstructed from the native window, margin, scale, and manifest anchor.
4. `computeStaticPetGeometry` calculates the valid work-area ground target.
5. Horizontal position is preserved unless reachability requires clamping.
6. Vertical settlement uses a short ease-out curve:
   - Poko: 165 ms;
   - Loko: 210 ms.
7. The state machine advances from `interaction.dragged` to `transition.recovering` on `DRAG_ENDED`.
8. Physical settlement emits `RECOVERY_COMPLETED`.
9. The pet returns to a compatible neutral idle asset.

There is no arbitrary horizontal recentering and no snap to the primary monitor.

## Display changes

- While actively dragged, display topology changes update display identity but do not steal the pet from the pointer.
- During settlement, the landing target is recomputed from the current native position and remaining displays.
- Releasing partially off-screen clamps only enough to keep the sprite reachable and grounded.
- Side and auto-hidden taskbars are respected through the current display work area.

## Cancellation paths

Pointer cancellation, character switching, scale changes, display removal, shutdown, and renderer loss invalidate the active interaction generation. A canceled active drag settles from its current position before autonomous behavior may resume. Stale pointer or completion events cannot revive the prior session.

## Privacy

The protocol carries pointer ID, primary-button number, screen coordinates, and monotonic timestamps for the active gesture only. It does not inspect keystrokes, typed text, clipboard content, window contents, screenshots, browser history, or messages.

## Native validation matrix reserved for the Windows EXE

- rapid click-drag-release;
- slow threshold crossing;
- double-click without accidental drag;
- sleeping and one-shot transition interruption;
- prop-bearing activity interruption;
- dual monitor and negative coordinates;
- mixed DPI crossing;
- release over bottom/side/auto-hidden taskbars;
- elevated release and vertical settlement;
- partial off-screen release;
- display removal during drag and settlement;
- renderer pointer-cancel and system suspend.
