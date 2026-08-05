# PokoLoko Tray Behavior

## Identity

The tray uses the approved PokoLoko micro-mark, resized once to the native 16×16 tray size. The final `pokoloko.ico` remains the executable, installer, shortcut, and fallback tray icon.

## Menu

The production menu deliberately stays compact:

- Show or hide companion
- Pause or resume
- Mute or unmute sounds
- Switch Poko/Loko
- Activity rhythm: Calm, Balanced, Lively
- Move to this screen
- Settings
- Restart PokoLoko
- Quit

Diagnostics and the animation laboratory appear only in development builds or when diagnostics are explicitly enabled.

## Synchronization

The menu is rebuilt from authoritative persisted settings and current window visibility. Character and activity options use radio states. Pause, mute, visibility, and diagnostics labels reflect runtime truth.

## Lifecycle guarantees

- Exactly one `Tray` instance is created. Menu refreshes update the existing instance rather than destroying and recreating it.
- Double-click opens Settings.
- `Move to this screen` selects the display under the cursor, stops current locomotion, grounds the pet at that display's safe center, and shows it.
- Restart uses Electron relaunch and exits the current process.
- Quit stops context sensing, runtime timers, movement, splash/onboarding windows, and destroys the tray.
- The single-instance lock prevents duplicate tray processes.
