# PokoLoko 1.0.0-rc.1 — Release Candidate Notes

## What is included

- Poko and Loko with distinct movement, timing, preferences, sleep, reactions, and activity patterns.
- Transparent, grounded Windows desktop companion with drag-and-drop interaction and multi-display recovery.
- Laptop, reading, music, ball play, eating, drinking, peeking, resting, and ambient routines where authoritative assets support them.
- Settings for companion, size, activity rhythm, walking pace, pause, quiet mode, reduced motion, startup, always-on-top, fullscreen behavior, sound preference, privacy, and diagnostics.
- First-run onboarding, branded splash, synchronized native tray, deterministic diagnostic traces, and automated test coverage.
- Optional local context signals with immediate privacy controls. Context influences probabilities; it never deterministically commands an activity.

## Privacy boundaries

Context awareness is disabled by default. PokoLoko does not inspect typed text, individual keys, clipboard contents, screenshots, passwords, messages, browser history, URLs, window titles, filenames, or document contents. No contextual content is uploaded.

## Sound

The sound preference and safe audio architecture are included, but the approved sound registry is intentionally empty. No generic placeholder sounds are shipped.

## Installation and settings policy

- The NSIS installer supports per-user installation and custom install location.
- Uninstall removes the application but preserves user settings by default so upgrades and reinstalls retain preferences.
- “Reset to defaults” is available inside Settings.
- A portable executable is also produced.

## Known release gates

The generated installer must still pass clean-machine Windows installation and the Step 26 manual QA matrix. Native transparency, mixed-DPI movement, taskbar configurations, suspend/resume, startup registration, tray recovery, and multi-hour behavior cannot be certified by source-only validation.
