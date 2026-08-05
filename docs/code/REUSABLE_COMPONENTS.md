# Reusable Components

## KEEP_WITH_MINOR_CHANGES

### Atomic JSON settings persistence (`electron/store.ts`)

Strengths:

- simple typed defaults;
- malformed JSON recovery;
- directory creation;
- temporary-file write followed by rename;
- defensive copies on get/set.

Required changes:

- schema version and migrations;
- runtime schema validator shared with IPC;
- explicit logging/telemetry-free local error reporting;
- recovery of orphaned `.tmp` files;
- richer settings and privacy defaults;
- test injection for file system and app paths.

### Strict TypeScript baseline

Strict mode, separate app/Electron configs, NodeNext for Electron, and bundler resolution for the renderer are sensible. Expand rather than discard.

### Vite relative base

`base: './'` is useful for packaged `file://` loading. Retest with final multi-surface structure.

## KEEP AS PROVEN PATTERN, NOT DIRECT COPY

### Secure BrowserWindow defaults

- context isolation;
- disabled Node integration;
- sandbox;
- denied new windows;
- constrained navigation.

### Native shell primitives

- transparent frameless pet window;
- tray-owned lifecycle;
- always-on-top toggle;
- work-area APIs;
- single-instance lock;
- settings window reuse;
- `showInactive()`.

### Relative renderer asset URLs

The general technique is sound. The final asset adapter must own paths and validation.

## REFACTOR

- Preload subscription helper.
- Tray creation/menu rebuilding.
- GitHub Actions Windows packaging path.
- Electron-builder NSIS baseline.
- Asset validation concept.
- Development process orchestration.

## Explicitly not reusable

- coarse state union;
- random behavior probability table;
- `setInterval` locomotion implementation;
- renderer previous-state animation inference;
- generic bottom-center anchor;
- old asset manifest;
- old brand/icons;
- fixed 180 × 180 hit rectangle;
- timer-based landing/wake/reaction completion.
