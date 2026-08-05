# PokoLoko — Step 08 Change Report

## Scope implemented

Step 08 replaces the blank foundation marker with a real static desktop pet renderer. The renderer uses one authoritative normalized frame per character, fixed 128×128 canvas coordinates, manifest ground anchors, safe integer scaling, Electron work-area grounding, and alpha-aware mouse pass-through.

## New implementation

- `electron/main/static-pet-controller.ts`
- `electron/services/display-grounding.ts`
- `electron/services/static-pet-assets.ts`
- expanded typed preload contracts and presentation subscription
- static Poko/Loko character and 1×/2×/3× tray controls
- display topology recovery listeners
- packaged/development asset URL resolver
- alpha-mask hit testing in `PetSurface`
- rendering, hit-testing, and display-grounding documentation
- geometry and packaged-path unit tests
- dependency-free Step 08 validator
- static scale review image and grounding matrix

## Locked behavior

- Poko frame: first frame of `poko_idle_blink`
- Loko frame: first frame of `loko_idle_front`
- canvas: exactly 128×128
- allowed user scales: 1×, 2×, 3× only
- safety margin: 16 logical pixels multiplied by integer scale
- ground placement: current display `workArea` bottom minus 2 DIP
- horizontal placement: clamped to keep the native window reachable
- body placement: manifest ground anchor only; visible bounds never recenter it
- input: native window is pass-through except over alpha-visible sprite pixels

## Automated validation completed

- runtime asset validator: PASS — 31 animations, 223 RGBA frames
- animation laboratory validator: PASS — 31 animations, 223 frames covered
- static renderer validator: PASS
- generated scale review confirms nearest-neighbor rendering at all three supported sizes
- generated grounding matrix covers 100%, 125%, 150%, negative coordinates, and side-taskbar work areas at the formula level
- Node syntax validation passed for the new validator

## Native closure still required

This environment cannot truthfully close the native acceptance matrix. Its configured npm registry returns 404 for `@eslint/js`, and the repository inherited no `package-lock.json`; therefore clean install, TypeScript with project dependencies, Electron launch, Windows DWM composition, tray behavior, hit-test forwarding, DPI changes, and packaged execution could not be run here.

The implementation and static validation are complete, but the Step 08 stop condition remains open until the Windows checklist in `docs/rendering/DISPLAY_GROUNDING_TESTS.md` is executed and recorded.
