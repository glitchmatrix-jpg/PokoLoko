# PokoLoko — Stages 01–09 Consolidated QA, UI, and UX Audit

## Verdict

Stages 01–09 now form one coherent, reproducible foundation for Step 10. The archival visual truth, product design, architecture, runtime assets, animation laboratory, desktop renderer, and deterministic animation service are all present in the same repository.

The repository passes every dependency-free integrity and behavioral check available in this environment. Native Electron behavior remains intentionally unclaimed until the Windows GitHub Actions build and executable test are performed. This is a validation boundary, not a hidden failure.

## Audit coverage

| Stage | Scope | Result |
|---|---|---|
| 01 | Complete visual vocabulary and asset truth | PASS — all design-lock documents merged; 31 animations and 218 isolated poses remain documented |
| 02 | Existing-code audit | PASS — legacy architecture and replacement decisions preserved under `docs/code` |
| 03 | Product vision and character bibles | PASS — Poko/Loko personality, privacy, rhythm, and boundaries present |
| 04 | Living behavior architecture | PASS — domain ownership, clocks, IPC, interruptions, activities, and recovery present |
| 05 | Clean Electron foundation | PASS STATIC — secure shell and separate surfaces present; native launch pending |
| 06 | Runtime asset adapter | PASS — 31 animations, 223 RGBA frames, two approved mirrored cycles |
| 07 | Animation laboratory | PASS STATIC + UX HARDENED — deterministic controls, transition composition, comparisons, and metrics |
| 08 | Static renderer and grounding | PASS STATIC — fixed canvas, anchors, work-area geometry, integer scale, alpha hit testing |
| 09 | Deterministic animation runtime | PASS STATIC + LOGIC HARDENED — all playback modes, completion semantics, pause/suspend, catch-up cap |

## Corrections made during this audit

### Build and CI

- CI no longer assumes a missing `package-lock.json`; it uses `npm ci` when available and a pinned-version `npm install` fallback otherwise.
- Removed npm cache configuration that would fail without a lockfile.
- Added a manual `Build Windows EXE` workflow that validates, creates the NSIS installer, and uploads both installer and unpacked app.
- Windows CI uploads the unpacked package as an artifact for native QA.

### Startup and lifecycle

- Startup failures now display a clear native error and close instead of leaving an invisible process alive.
- Settings and diagnostics windows no longer accumulate duplicate `closed` listeners.
- Character switching now uses generation guards, preventing rapid Poko/Loko requests from committing out of order.
- Settings persistence commits the character only after the requested character asset successfully loads.

### Renderer and hit testing

- Alpha-mask image loading now has cancellation guards, preventing an older frame load from replacing the hit mask for a newer frame.
- PNG rendering remains fixed at 128×128 logical pixels and integer scale only.
- No visible-bound recentering or frame-dependent resizing was introduced.

### Animation runtime

- Idempotence now compares actual frame paths, not only frame count. An asset replacement with the same ID and length correctly restarts playback.
- Explicit start-frame or pause-state requests are not mistakenly swallowed as identical presentations.
- Added a unit test for same-ID/same-length frame-content replacement.

### Animation laboratory UX

- Pause/resume and frame stepping now track playback-sequence position rather than deriving time from visible frame index.
- Reverse and ping-pong playback therefore resume without direction jumps.
- The laboratory remains diagnostic, while the runtime remains the authoritative production playback service.

### Settings UX

- Replaced the dead placeholder page with a usable foundation settings experience.
- Character and safe integer-size controls now work through typed IPC.
- Added keyboard-visible focus, responsive layout, clear status, and the locked privacy promise.
- Personality and behavior controls remain correctly deferred until their engines exist; the UI does not pretend unfinished systems work.

## QA checks executed

The following dependency-free validators passed after the corrections:

```text
validate-foundation.mjs
validate-runtime-assets.mjs
validate-animation-lab.mjs
validate-static-renderer.mjs
validate-animation-runtime.mjs
```

Verified totals:

- 31 runtime animations;
- 223 authoritative RGBA runtime frames;
- 2 approved mirrored sequences;
- fixed 128×128 canvases;
- alpha transparency;
- asset path existence;
- animation-lab coverage;
- forward, reverse, ping-pong, loop, and one-shot semantics;
- pause/suspend and long-gap behavior;
- static grounding and integer scaling rules.

## UI/UX assessment

### Desktop pet surface

The surface is intentionally minimal at this stage. It renders only the pet, without debug chrome or a visible square. Scale and placement are driven by the manifest and work area. The remaining UX risk is native mouse-event forwarding on Windows; this must be exercised in the eventual EXE because browser-only review cannot prove OS hit behavior.

### Settings surface

The settings page now communicates product identity rather than reading like scaffolding. It exposes only controls that truly work today. It avoids showing disabled fantasy settings and explains why integer scaling matters.

### Diagnostics and animation laboratory

The laboratory is information-dense by design but preserves hierarchy: selection and controls on the left, visual comparison and metrics on the right, transition composition below. It supports full keyboard-native form controls. Future polish may add search and saved chain presets, but neither is required for Step 10.

### Tray

The tray is concise and functional: show, character, size, settings, diagnostics, transparent preview, quit. It uses the final authoritative ICO. Pause and richer behavior controls should be added only after those systems exist.

## Remaining native validation gate

The following cannot be truthfully proven without running the Windows build:

- transparent BrowserWindow rendering under DWM;
- alpha-aware click-through behavior;
- taskbar and side-taskbar clearance;
- 100%, 125%, 150%, and mixed-DPI behavior;
- multi-monitor and negative-coordinate recovery;
- tray icon rendering at Windows sizes;
- suspend/resume integration;
- packaged asset loading through ASAR;
- NSIS installation and uninstall;
- real-time animation smoothness under desktop load.

The GitHub Actions workflows are now prepared to create the executable without requiring admin access on the work computer. After Step 27, trigger **Build Windows EXE**, download the artifact, and execute the accumulated native QA matrix on a permitted Windows machine.

## Step 10 readiness

Step 10 may begin. Its locomotion engine should consume the existing static geometry and animation runtime rather than bypassing them. It must not claim native closure until the final executable test, but no known static architecture, asset, UI, or playback defect blocks implementation.
