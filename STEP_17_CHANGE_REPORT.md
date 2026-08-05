# PokoLoko — Step 17 Change Report

## Implemented

- Pure context-sensing package with typed snapshots and `CONTEXT_CHANGED` events.
- One-second conservative sampling, rolling activity bands, hysteresis, and bounded recent-interaction decay.
- Local Electron adapter for cursor activity, system idle, time bands, lock/resume, and conservative fullscreen state.
- Explicit availability states: unavailable sensors never fabricate values.
- Privacy settings with global disable and per-signal controls.
- Disabled mode stops polling, clears ephemeral state, and removes planner influence.
- Typed preload IPC for settings and diagnostic snapshots.
- Human-language privacy UI and current coarse-context display.
- Unit tests for hysteresis, deterministic disablement, recent interaction decay, and non-deterministic typing semantics.

## Deliberately unavailable

Global typing presence and audio-playing state require reviewed platform adapters. They are represented in contracts and tests but remain unavailable/off in the Electron provider. This is safer than introducing key hooks, window-title inspection, or fabricated context.

## Privacy

No keystrokes, typed text, clipboard contents, screenshots, passwords, messages, URLs, browser history, document names, or persistent activity logs are accessed.

## Native validation

Windows power events, cursor sampling, packaged IPC, and privacy UI remain scheduled for the GitHub Actions EXE validation after Step 27.
