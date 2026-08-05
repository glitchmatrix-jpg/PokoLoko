# PokoLoko — Step 21 Change Report

## Completed scope

Step 21 replaces the provisional settings form with a branded, responsive, accessible personalization experience. It introduces a versioned settings schema, migration path, authoritative immediate-save commands, privacy controls, startup integration, independent walking pace, reduced motion, fullscreen behavior, and reset operations.

## Product experience

- approved horizontal wordmark, symbol, application icon, and final ICO integrated;
- live Poko and Loko pixel previews;
- distinct activity rhythm and walking pace controls;
- safe 1×, 2×, and 3× size controls;
- pause, quiet mode, reduced motion, always-on-top, and sound preference;
- quiet/hide/unchanged fullscreen behavior;
- context-awareness master switch and individual signal controls;
- launch-at-startup and diagnostics controls;
- per-character session reset and full defaults reset;
- immediate-save status, visible errors, keyboard focus, responsive layouts, and screen-reader semantics.

## Runtime integration

- settings are validated in the main process and persisted atomically;
- legacy settings migrate to schema version 2;
- walking speed is independent of behavior frequency;
- reduced motion caps sprite playback and removes nonessential settings UI motion;
- fullscreen hide/quiet/unchanged behavior is applied to live context snapshots;
- login-item state uses Electron's operating-system API;
- privacy disablement updates the context sensor and behavior engine immediately;
- reset operations invalidate current session behavior safely.

## Validation

All dependency-free validators for Steps 01–21 pass. Format hygiene passes. Full TypeScript/Vite/Electron validation still requires dependency installation through GitHub Actions, as planned. Native Windows UI, high-DPI, login-item, fullscreen, and packaged-mode checks remain part of the final EXE test matrix.
