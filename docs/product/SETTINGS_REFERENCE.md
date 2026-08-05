# PokoLoko Settings Reference

## Design principle

Settings use immediate save. Every successful change is validated in the main process, persisted atomically, applied to the authoritative runtime, and broadcast back to the settings window and tray. The interface uses the approved PokoLoko logo system, warm aubergine palette, fixed pixel previews, clear focus states, and responsive layouts.

## Companion

- **Character:** Poko or Loko. Switching preloads a safe neutral frame and commits atomically.
- **Activity rhythm:** Calm, Balanced, or Lively. Controls how often the mind proposes activities.
- **Walking pace:** Gentle, Natural, or Brisk. Controls locomotion speed independently from activity frequency.
- **Pixel size:** 1×, 2×, or 3× only. Fractional scaling is rejected.

## Presence

- **Pause companion:** Stops autonomous planning and movement safely.
- **Quiet mode:** Suppresses energetic behavior while preserving presence.
- **Reduced motion:** Caps sprite playback speed and removes nonessential UI animation.
- **Stay above other windows:** Applies Electron always-on-top immediately.
- **Gentle sounds:** Persisted but remains silent until the reviewed audio system is implemented.
- **Fullscreen behavior:** Settle down, step away, or stay unchanged.

## Privacy

Context awareness is disabled by default. Individual coarse signals can be enabled independently. Disabling the master switch stops collection, clears short-lived context state, and removes influence from behavior immediately.

## System

- **Open at sign-in:** Uses the operating system login-item API.
- **Developer diagnostics:** Controls whether technical tools appear in packaged builds.
- **Reset character rhythm:** Clears only the active character’s hidden mind, cooldowns, and bounded session memory.
- **Restore all defaults:** Validates and reapplies every default safely.

## Accessibility

All controls are keyboard reachable, use native buttons/inputs, expose radiogroup and switch semantics, retain visible focus, avoid color-only selection, and respect reduced motion. The layout adapts down to narrow utility windows and high-DPI environments.
