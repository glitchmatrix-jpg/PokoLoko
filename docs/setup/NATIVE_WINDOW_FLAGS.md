# Native Window Flags

## Pet window

- `transparent: true` — alpha-capable surface.
- `frame: false` — no native chrome.
- `skipTaskbar: true` — companion does not occupy taskbar.
- `resizable/movable/minimizable/maximizable/fullscreenable: false` — native shell is controlled by the application.
- `hasShadow: false` — avoids OS rectangle around transparent canvas.
- `alwaysOnTop` — follows validated user setting.
- `setVisibleOnAllWorkspaces(true)` — keeps the ambient companion present without claiming fullscreen visibility.
- `show: false` plus `ready-to-show` — avoids unpainted flash.

The Step 05 pet window is deliberately larger than the eventual fixed 128×128 sprite canvas, leaving safe room for transparent margin and effects. Exact runtime geometry is finalized after the asset adapter and animation laboratory.

## Security flags

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- `webSecurity: true`
- narrow typed preload API only

## Utility windows

Settings and Diagnostics use framed independent windows. They share the secure preload but receive only the same enumerated methods.
