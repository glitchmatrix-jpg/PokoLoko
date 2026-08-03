# Changelog

## 0.1.1

- Fixed production asset loading under `file://`.
- Replaced absolute asset paths with package-safe relative paths.
- Fixed sandboxed preload compatibility by compiling a CommonJS `.cts` preload.
- Added drag threshold so clicks no longer trigger drag/landing.
- Added delayed single-click handling so double-click reliably opens settings.
- Fixed pause to stop active movement and timers immediately.
- Added synchronized settings updates across tray, pet, and settings windows.
- Added safe atomic settings persistence and malformed-settings recovery.
- Added multi-monitor clamping and display-change handling.
- Added single-instance behavior.
- Added navigation hardening and context-isolated IPC wrappers.
- Fixed sleeping to wake before choosing another autonomous action.
- Made sitting visually persist instead of immediately reverting to idle.
- Added requestAnimationFrame-based sprite timing and frame preloading.
- Added asset validation script covering 265 frames.
- Improved settings accessibility, busy states, and visual polish.
