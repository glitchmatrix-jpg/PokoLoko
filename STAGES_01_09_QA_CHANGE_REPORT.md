# PokoLoko — Stages 01–09 QA Change Report

## Purpose

This pass consolidated the design-lock documentation from Steps 01–04 into the active Step 09 repository, audited the implementation from Steps 05–09, corrected static defects, improved foundation UI/UX, and prepared a GitHub Actions route for producing the Windows executable without local administrator access.

## Code corrections

- Added race-safe character switching in both the main coordinator and static pet controller.
- Added visible startup failure handling and clean shutdown.
- Prevented duplicate utility-window close listeners.
- Added cancellation-safe alpha-mask loading for animated hit testing.
- Hardened animation request identity by comparing frame paths.
- Corrected animation-laboratory pause/resume and stepping for reverse and ping-pong playback.
- Replaced the settings placeholder with usable character and integer-scale controls.
- Hardened ESLint scope around generated archival TypeScript.
- Added a dependency-free formatting hygiene check.

## CI corrections

- CI supports repositories with or without a lockfile.
- Added manual Windows EXE workflow.
- Added Windows unpacked-package artifact upload.
- Added consolidated Stages 01–09 validation to the main validation chain.

## Validation performed

All dependency-free validators passed after changes. Full TypeScript, ESLint, Vitest, Electron, NSIS, and native Windows behavior remain scheduled for the GitHub Actions executable gate because dependencies cannot be installed on the current work computer.

## Readiness

The repository is ready for Step 10 implementation. Native closure remains deferred, explicitly tracked, and supported by the included Windows build workflow.
