# PokoLoko — Step 22 Change Report

## Completed

Step 22 adds one coherent native-shell identity across startup, onboarding, tray, settings, executable branding, and first-run persistence.

## Product changes

- Added a transparent 1.9-second branded splash using the approved stacked logo and authoritative Poko/Loko sprites.
- Added click-to-skip after 650 ms and a Settings toggle to disable future splash playback.
- Added a four-screen onboarding flow that takes under one minute:
  - choose Poko or Loko;
  - learn drag, click, tray, and Settings controls;
  - choose Calm, Balanced, or Lively rhythm;
  - optionally enable privacy-safe context awareness.
- Added persistent first-run completion with a settings-schema v3 migration.
- Added a production tray menu with show/hide, pause/resume, mute, character switch, activity rhythm, move to current screen, Settings, restart, and quit.
- Added the approved tray micro-mark while retaining the final ICO for executable, installer, shortcut, and fallback use.

## Runtime hardening

- The pet window remains hidden until splash/onboarding finishes, preventing a premature desktop flash.
- Character selection must load and commit before onboarding is marked complete.
- The tray is constructed once; refreshes update its menu instead of creating duplicate native tray instances.
- Move-to-current-screen uses the display under the pointer and grounds the companion safely at its center.
- Restart uses Electron relaunch; quit disposes sensors, runtimes, windows, and tray resources.
- Diagnostics remain absent from the production tray unless explicitly enabled.

## Privacy

Onboarding describes context awareness in product language, leaves it disabled by default, and transmits only a boolean opt-in plus approved character/rhythm choices. It does not collect or expose typed text, key identity, clipboard content, screenshots, passwords, messages, URLs, browser history, window titles, or document contents.

## Validation

Dependency-free validation passed for assets, renderer, animation, locomotion, turning, state machine, dragging, mind/planner, sleep, switching, context, activities, reactions, living-runtime integration, settings, Step 22 shell contracts, and formatting hygiene.

Native Windows splash timing, tray rendering, startup migration, packaged startup, and shutdown behavior remain part of the final GitHub Actions EXE validation after Step 27.
