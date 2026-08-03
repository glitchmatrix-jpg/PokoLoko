# PokoLoko

PokoLoko is a transparent animated desktop-pet app for Windows. **Poko** is playful and energetic; **Loko** is calmer and sleepier.

## Included in v0.1

- Transparent, frameless pet window
- Always-on-top mode
- Autonomous walking along the Windows work area
- Idle, walking, sitting, sleeping, happy, confused, dragged, and landing states
- Click reactions and repeated-click reactions
- Drag-and-drop positioning
- Multi-monitor clamping
- Native system-tray menu
- Poko/Loko switching
- Pause/resume control
- Settings window
- Persistent local preferences
- Single-instance protection
- Context isolation and sandboxed renderer
- GitHub Actions workflow that builds a downloadable Windows installer

## Build without npm on your computer

1. Open the repository's **Actions** tab.
2. Select **Build Windows Installer**.
3. Click **Run workflow**.
4. Open the finished run.
5. Download the `PokoLoko-Windows-...` artifact.
6. Extract it and run `PokoLoko-Setup-0.1.0.exe`.

Node.js and npm run only on GitHub's temporary Windows runner. The installed app does not require either one.

## Run locally

```powershell
npm install
npm start
```

## Build locally

```powershell
npm install
npm run dist:win
```

The installer will be written to `release/`.

## Controls

- **Left-click:** happy reaction
- **Repeated clicks:** confused reaction
- **Drag:** move the pet
- **Right-click:** open controls
- **Double-click:** open settings
- **Tray icon:** switch pet, pause, toggle always-on-top, open settings, or quit

## Notes

The installer is unsigned, so Windows SmartScreen may show an **Unknown publisher** warning. Public distribution should eventually use a code-signing certificate.
