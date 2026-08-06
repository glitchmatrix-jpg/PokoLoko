# Step 1 — Native Dragging

Implemented changes:

- Electron main process polls `screen.getCursorScreenPoint()` every 12 ms after a valid left-button press.
- Polling feeds the existing `InteractionController`, preserving the original cursor-to-window grab offset.
- `BrowserWindow.setPosition()` remains the authoritative native window movement path.
- Polling stops on pointer-up, pointer cancellation, disposal, invalid interaction phase, or a 15-second safety timeout.
- Drag cancellation after movement enters the normal settlement path and restores idle only after landing.
- Renderer alpha hit-testing can now switch both on and off; transparent margins no longer remain permanently interactive.

Primary files changed:

- `electron/main/static-pet-controller.ts`
- `src/surfaces/PetSurface.tsx`

Validation commands:

```powershell
npm run typecheck
npm run test -- tests/dragging/interaction-controller.test.ts tests/dragging/settling.test.ts
npm run validate:dragging
npm run build
```

Packaged-build test:

1. Kill every older PokoLoko process.
2. Install or launch the artifact built from this exact source revision.
3. Press on an opaque part of Poko.
4. Drag slowly, rapidly, beyond the original window bounds, and across displays.
5. Confirm no click reaction fires after a drag.
6. Release and verify Poko settles to the nearest display floor before idle/locomotion resumes.
