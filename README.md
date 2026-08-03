# Poko v0.1.1 — Alive on Desktop

A transparent Electron desktop pet for Windows featuring **Poko** and **Loko**.

## What works

- Transparent, frameless, taskbar-free pet window
- Always-on-top mode
- Poko/Loko switching from the tray or settings
- Persistent settings in Electron's user-data directory
- Autonomous idle, walking, sitting, sleeping, waking, and reaction states
- Bottom-of-work-area movement that avoids the Windows taskbar
- Multi-monitor-aware dragging and movement bounds
- Click reaction and repeated-click confused/annoyed reaction
- Drag threshold, so ordinary clicks no longer accidentally drag the window
- Drop-and-landing animation
- Right-click context menu
- Double-click settings window
- Pause/resume behavior
- Asset preloading, fixed bottom-center anchoring, and nearest-neighbor rendering
- Packaged `file://` asset paths that work outside the Vite development server
- Context-isolated, sandboxed renderer with a CommonJS preload bridge

## Requirements

- Windows 10 or 11
- Node.js 22.12 or newer
- npm

## Run in development

Open PowerShell in this folder:

```powershell
npm install
npm run validate:assets
npm run dev
```

## Build the application

```powershell
npm run check
npm run dist:win
```

The installer will be created under:

```text
release\Poko-Setup-0.1.1.exe
```

## Controls

- **Left-click:** happy reaction
- **Repeated left-clicks:** confused/annoyed reaction
- **Drag:** move the pet
- **Release:** snap to the bottom of the current monitor and land
- **Right-click:** tray-style controls
- **Double-click:** open settings
- **Tray icon:** switch pet, pause, toggle always-on-top, open settings, or quit

## Validation

`npm run validate:assets` checks that:

- both characters have all 12 required animation groups;
- every referenced frame exists;
- frame paths are package-safe relative paths;
- every frame is a valid PNG;
- each animation uses a consistent canvas size.

The included asset library currently validates **265 frames across 24 required animations**.

## Important notes

The source package has been statically audited and the asset suite has been validated. A final Windows runtime and installer test still needs to be run on a Windows machine after `npm install`, because this environment cannot download npm dependencies from its internal package mirror.

## Build in GitHub Actions (no local npm required)

The repository includes `.github/workflows/build-windows.yml`. Upload the project to GitHub, open **Actions → Build Poko for Windows → Run workflow**, then download the generated installer from the run's **Artifacts** section. See `GITHUB_ACTIONS_BUILD.md` for exact steps.
