# PokoLoko — Step 25 Change Report

## Implemented

- Added reusable manual-clock and deterministic event-queue test utilities.
- Added focused unit suites for animation, state recovery, locomotion/display geometry, behavior/mind/memory, context privacy, and event ordering.
- Added fake-timer integration coverage for walking, sleep/wake, activity interruption, character switching, pause/resume, and restart restoration.
- Added a documented automated-test matrix.
- Hardened CI on Ubuntu and Windows with formatting, typecheck, lint, deterministic tests, build, package smoke, and Windows unpacked packaging.
- Added machine-readable test reports and disabled file-level parallelism for the deterministic CI lane.

## Native boundary

Automated tests verify deterministic domain behavior. Transparent-window rendering, taskbar/work-area behavior, mixed-DPI native placement, tray rendering, audio quality, and visual continuity still require the Windows executable test pass.
