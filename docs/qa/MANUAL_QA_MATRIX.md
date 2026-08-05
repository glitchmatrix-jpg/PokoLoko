# PokoLoko Manual QA Matrix — Step 26

## Evidence status

This matrix is executable, but it has **not been completed on native Windows in this environment**. Static validation, deterministic simulations, and replayable trace templates are complete. Rows marked `PENDING NATIVE` require the Windows QA artifact produced by `.github/workflows/windows-manual-qa-build.yml`.

## Required builds

- Windows 11, packaged `win-unpacked` build
- Windows 11, development build
- Windows 10 where available, packaged build

## Display and grounding matrix

| Scenario | Required checks | Evidence | Status |
|---|---|---|---|
| Single monitor, 100% | ground anchor, taskbar clearance, reachable drag, hit region | trace + video + screenshot | PENDING NATIVE |
| Single monitor, 125% | integer sprite scale, no blur, correct work-area conversion | trace + video | PENDING NATIVE |
| Single monitor, 150% | no anchor drift or taskbar overlap | trace + video | PENDING NATIVE |
| Dual monitor, same DPI | cross-display move, tray “Move to this screen” | trace + video | PENDING NATIVE |
| Dual monitor, mixed DPI | grounding after transfer, no size jump | `mixed-dpi-display-recovery.json` + video | PENDING NATIVE |
| Negative-coordinate secondary | reachability and clamping left/up of primary | trace + screenshot | PENDING NATIVE |
| Different resolutions | valid destination ranges on both monitors | trace + video | PENDING NATIVE |
| Taskbar bottom | two-pixel intended clearance | screenshot | PENDING NATIVE |
| Taskbar left/right | work-area edge and peeking logic | trace + screenshot | PENDING NATIVE |
| Taskbar auto-hide | no persistent overlap or unreachable placement | video | PENDING NATIVE |
| Display connect/disconnect | movement interrupted, safe regrounding | trace + video | PENDING NATIVE |
| Resolution change | immediate topology recovery | trace | PENDING NATIVE |

## Windows lifecycle matrix

| Scenario | Expected result | Status |
|---|---|---|
| Explorer restart | tray returns or application exposes recoverable state; pet remains alive | PENDING NATIVE |
| Lock/unlock | context updates without reading content; pet safely resumes | PENDING NATIVE |
| Sleep/resume | timers do not burst; pet regrounds and replans | PENDING NATIVE |
| Fullscreen app | selected fullscreen policy applies and reverses | PENDING NATIVE |
| App restart | settings and selected character restore | PENDING NATIVE |
| Packaged startup | no missing ASAR asset, blank pet, or duplicate tray | PENDING NATIVE |
| Development startup | diagnostics available and no second runtime loop | PENDING NATIVE |
| Quit | all windows, timers, sensors, tray, and process terminate | PENDING NATIVE |

## Visual correctness checklist

For each character at 1×, 2×, and 3×:

- fixed 128×128 source canvas remains stable;
- no frame-dependent resizing;
- feet do not visibly slide at authored balanced speed;
- ground anchor does not wobble between frames;
- left/right mirroring preserves anchor placement;
- start, stop, turn, sit, sleep, wake, drag, and landing chains have no snap;
- laptop, book, food, cup, ball, and peeking props appear and disappear only at declared boundaries;
- transparent window does not create a giant invisible click blocker;
- interactive hit test is limited to visible sprite pixels;
- pet can always be recovered through drag or tray movement.

## Execution protocol

1. Start a clean packaged build with diagnostics enabled.
2. Set a recorded seed.
3. Run the matching trace template from `docs/qa/traces/`.
4. Record the full desktop and diagnostic panel.
5. Export the resulting native trace using a filename containing OS, build, DPI, display layout, character, activity level, and date.
6. Record failures in `RELEASE_BLOCKERS.md` with exact reproduction steps.
7. Repeat the failed scenario after correction.

## Release gate

Step 26 is complete only after every required row has native evidence and no release-blocking failure remains open.
