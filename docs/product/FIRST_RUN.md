# PokoLoko First Run

## Goal

A new user should understand PokoLoko in under one minute without being forced through a long tutorial.

## Startup sequence

1. A transparent 1.9-second splash introduces Poko and Loko meeting and reveals the approved stacked PokoLoko mark.
2. The splash can be skipped after its first 650 ms by clicking anywhere. The user may disable it permanently in Settings.
3. On first run only, onboarding opens before the pet becomes visible.
4. Onboarding completion is persisted in settings schema version 3 and does not reappear after restart or upgrade.

## Onboarding screens

1. **Choose a companion** — Poko or Loko, with behavior-first descriptions.
2. **Learn the gestures** — drag, click, and tray controls.
3. **Choose a rhythm** — Calm, Balanced, or Lively.
4. **Choose context awareness** — off by default, locally processed, and explained as context rather than content.

The Skip action persists onboarding completion, keeps context awareness disabled, and opens the companion immediately.

## Failure behavior

The current character stays visible until a newly selected character asset loads successfully. Onboarding is not marked complete if that character cannot be prepared. A closed onboarding window allows the companion to run but onboarding is offered again on the next launch.

## Accessibility

- All choices are native buttons or form controls.
- Keyboard focus is visible.
- Progress is textually described.
- Reduced-motion OS preferences collapse splash movement.
- The flow remains usable at 720×560 and at high DPI.
