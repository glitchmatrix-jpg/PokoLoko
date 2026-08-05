# Current Architecture

## Audit scope

This audit covers the unchanged source snapshot in `PokoLoko-main.zip`. Generated output, dependency folders, caches, and release artifacts were excluded. The snapshot contains 318 files: 19 application/configuration/documentation files, one GitHub Actions workflow, one animation manifest, 265 runtime PNG frames, preview images, and icon files. Exact paths, byte sizes, and SHA-256 hashes are recorded in `SOURCE_FILE_INVENTORY.json`.

## Executive diagnosis

The application is a small Electron shell with two renderer modes: a transparent pet window and a conventional settings window. It successfully demonstrates several native behaviors—transparent frameless rendering, tray presence, persistent settings, native-window dragging, work-area clamping, and basic multi-display awareness—but its pet runtime is not a coherent domain model.

The system has two competing sources of behavioral truth:

1. **Electron main process** owns a coarse eight-value `PetState`, movement timers, behavior timers, settings, and native window position.
2. **React renderer** independently derives visual transitions from current and previous states, temporarily overrides animations for reactions, and advances `next` animations locally.

This split is the central architectural defect. A visual animation may finish without the main process knowing; the main process may change state while a renderer-only transition is still playing; reaction completion may return the picture to idle while the authoritative main-process state remains `INTERACTING`; and sleep/wake presentation is inferred from previous IPC values instead of represented explicitly.

## Technology and runtime prerequisites

| Area | Current choice |
|---|---|
| Package manager | npm; no lockfile is included |
| Node requirement | `>=22.12.0` |
| Electron | `^43.2.0` |
| React / React DOM | `^19.2.8` |
| TypeScript | `^5.9.2` |
| Vite | `^8.1.5` |
| Renderer plugin | `@vitejs/plugin-react ^5.0.4` |
| Packaging | `electron-builder ^26.15.3` |
| Installer | unsigned NSIS, assisted install, custom directory allowed |
| Target platform | Windows 10/11 |
| Application ID | `com.hasan.poko` |
| Product name | `Poko` |
| Installer name | `Poko-Setup-${version}.exe` |

The project requires npm dependency installation before type-checking, renderer compilation, Electron compilation, development startup, or packaging.

## Build and startup flow

### Development

`npm run dev` invokes `scripts/dev.mjs`, which starts:

1. Vite on `127.0.0.1:5173`.
2. TypeScript Electron compilation in watch mode.
3. Two 200 ms polling loops waiting for the HTTP server and `dist-electron/main.js`.
4. Electron with `VITE_DEV_SERVER_URL=http://127.0.0.1:5173`.

The script kills all three child processes on `SIGINT` or `SIGTERM`. It does not detect arbitrary child-process failure, propagate nonzero exit codes, reserve a fixed Vite port, or prevent polling forever if either prerequisite dies.

### Production

`npm run build` runs Vite and Electron TypeScript compilation. Electron starts at `dist-electron/main.js`. `rendererUrl()` loads `dist/index.html` through `file://`; asset paths resolve from `dist` in production and `public` in development.

`npm run dist:win` builds and invokes electron-builder for an unsigned NSIS installer.

### Renderer bootstrap

`src/main.tsx` mounts one `App`. `App.tsx` checks `?mode=settings`; the same renderer bundle serves either `Pet` or `Settings`.

## Native application lifecycle

1. A single-instance lock is requested at module load.
2. The second instance opens/focuses the settings window.
3. On `app.whenReady()`:
   - settings are initialized;
   - the pet window is created;
   - the tray is created;
   - listeners are installed for display metric changes and display removal.
4. The pet window loads the renderer and, on `ready-to-show`, broadcasts the selected pet and settings, sets state to `IDLE`, and schedules behavior.
5. `activate` recreates the pet window if missing.
6. Closing the pet window clears behavior and movement timers, but does not quit the process; the tray can keep the app alive.
7. Quit is only explicit through the tray or operating-system shutdown.

## Window architecture

### Pet window

- 180 × 180 fixed native window.
- Frameless, transparent, taskbar-free, nonresizable, nonmovable by the OS.
- Focusable and visible on all workspaces, including full-screen workspaces.
- Uses `showInactive()` after renderer readiness.
- Native shadow disabled; renderer supplies a CSS drop shadow.
- Sprite is rendered as a fixed 128 × 128 image at bottom-center inside the 180 × 180 stage.

### Settings window

- Fixed 410 × 470 window.
- Same preload and renderer bundle, selected through query string.
- Conventional opaque background.
- Reused while open; no duplicate settings windows.

## Security posture

Positive foundations:

- `contextIsolation: true`.
- `nodeIntegration: false`.
- `sandbox: true`.
- A narrow preload bridge rather than direct Node access.
- New windows are denied.
- Navigation is restricted to the current Vite origin in development or `file:` in production.

Limitations:

- IPC payloads are trusted at runtime; TypeScript types do not validate renderer input.
- `settings:pet` and `pet:react` accept unchecked strings from a compromised renderer.
- `drag:start` and `drag:move` accept unchecked numeric objects; NaN or extreme values are not explicitly rejected.
- `animations:get` is registered but not exposed or used.
- Allowing every `file:` navigation is broader than allowing only the packaged renderer file.

## Current state ownership

| Concern | Current owner | Secondary/competing owner | Finding |
|---|---|---|---|
| Selected character | Electron store/main | React local state | Main is authoritative; renderer mirrors via IPC |
| Coarse pet state | Electron `state` global | React `behavior` state | Main is authoritative only at coarse level |
| Current animation | React `animation` state | Manifest `next` values | Renderer-only truth |
| Animation frame | `useSpriteAnimation` | none | Renderer-only |
| Native position | Electron window bounds | pointer coordinates | Main process |
| Movement destination | local closure in `startWalking` | none | Not inspectable or persistent |
| Behavior decision | main-process random timer | none | Main process |
| Sleep entry/wake presentation | React previous-state inference | main coarse state | Split and race-prone |
| Reaction return | renderer manifest `next` plus main timer | both | Conflicting ownership |
| Drag state | main global plus renderer pointer ref | both | Coordinated through IPC but not transactional |
| Settings | Electron `Store` | React mirrored state | Main/store authoritative |

## Module decisions

| Module | Decision | Reason |
|---|---|---|
| `electron/main.ts` | **REPLACE** | Native primitives are useful, but lifecycle, state, behavior, movement, tray, IPC, and window code are tightly coupled in one global module |
| `electron/preload.cts` | **REFACTOR** | Secure bridge pattern is good; protocol must become typed, validated, versioned, and domain-oriented |
| `electron/store.ts` | **KEEP_WITH_MINOR_CHANGES** | Small atomic JSON store is sound; schema/versioning, corruption reporting, migrations, and richer settings are needed |
| `electron/types.ts` | **REPLACE** | Eight coarse states cannot represent transitions, activities, context, interruption, or personality |
| `src/App.tsx` | **REFACTOR** | Query-mode routing is serviceable, but the redesigned product requires explicit app surfaces and error boundaries |
| `src/components/Pet.tsx` | **REPLACE** | Contains renderer-owned domain inference, reaction arbitration, click queueing, drag gesture logic, and asset selection |
| `src/components/Sprite.tsx` | **REPLACE** | Too thin to support anchors, playback modes, transition events, hit masks, diagnostics, and fixed coordinate spaces |
| `src/hooks/useSpriteAnimation.ts` | **REPLACE** | Basic playback works, but completion semantics, long-frame handling, playback modes, pause/resume, and authoritative sequencing are inadequate |
| `src/components/Settings.tsx` | **REPLACE** | Functional prototype only; branding, personality controls, privacy/context controls, accessibility, and synchronization need redesign |
| `src/types/animation.ts` | **REPLACE** | Manifest discards numerical anchors, posture, transitions, confidence, and movement metadata |
| `src/types/global.d.ts` | **REPLACE** | Must be generated/shared from the IPC contract to avoid duplicated drift |
| `src/styles.css` | **REPLACE** | Fixed bottom-center presentation ignores anchor truth and the settings visual system is obsolete |
| `scripts/validate-assets.mjs` | **REFACTOR** | Useful concept; validation is shallow and tied to the obsolete 24-animation manifest |
| `scripts/dev.mjs` | **REFACTOR** | Convenient but fragile process orchestration and polling |
| `vite.config.ts` | **KEEP_WITH_MINOR_CHANGES** | Minimal and package-safe base; separate surfaces and build hardening may require changes |
| TypeScript configs | **KEEP_WITH_MINOR_CHANGES** | Strict mode is good; shared packages/tests and stronger options will expand configs |
| electron-builder config | **REFACTOR** | Packaging foundation is useful; identity, final icon, artifact name, resources, signing, protocol, and release metadata must change |
| GitHub Actions workflow | **REFACTOR** | Useful Windows build path; action versions, lockfile install, test stages, artifacts, and reproducibility need improvement |
| `public/assets/animations.json` | **DELETE** | Obsolete, lossy manifest derived from old assets |
| `public/assets/poko/**`, `loko/**` | **DELETE** | Replaced by authoritative normalized asset pack/runtime adapter |
| old `public/icons/**` | **DELETE** | Replaced by final PokoLoko brand/icon system |

## Reusable native knowledge—not code to copy blindly

- Transparent frameless BrowserWindow configuration works conceptually.
- `showInactive()` avoids stealing focus at startup.
- `skipTaskbar`, `setAlwaysOnTop`, and tray lifecycle are proven patterns.
- Work-area queries through `screen.getDisplayMatching` and `getDisplayNearestPoint` are the correct native APIs.
- `file://` renderer asset handling with Vite `base: './'` is conceptually valid.
- CommonJS preload output is compatible with the sandboxed renderer setup.
- Atomic settings replacement through a temporary file is a reasonable persistence baseline.

## Audit limitation

The source was statically traced and its standalone asset validator was executed successfully. A clean dependency installation failed because the execution environment's configured npm mirror returned HTTP 404 for `@types/node`; therefore TypeScript compilation, Electron launch, Windows visual behavior, NSIS packaging, and behavioral video capture could not be performed here. This is an environment blocker, not evidence that those stages pass. Exact reproduction is documented in `BASELINE_BUGS.md`.
