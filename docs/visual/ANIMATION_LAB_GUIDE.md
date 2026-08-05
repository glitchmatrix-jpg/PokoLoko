# PokoLoko — Animation Laboratory Guide

## Purpose

The laboratory is the visual gate between the runtime asset archive and autonomous behavior. It allows deterministic inspection without giving the behavior engine permission to use unstable sequences.

## Opening the lab

Run `npm run dev`, open the tray, and choose **Diagnostics**. The lab supports all 31 approved runtime animations. Choose **Transparent animation preview** from the tray to inspect the same pixels in a frameless transparent native window.

## Controls

- Character and primary/comparison animation selectors
- Play, pause, restart, frame backward/forward
- FPS override from 1–20
- Loop and playback override: forward, reverse, ping-pong
- Integer scale: 1×, 2×, 3×, 4×
- Canvas, ground anchor, body-center, and visible-bounds guides
- Side-by-side original/mirrored comparison
- Transition composer with animation, hold, neutral route, direction and prop-delay nodes

The sprite canvas is always exactly **128×128**. Rendering uses nearest-neighbor pixel presentation and never `object-fit`.

## Metrics

The generated `animation_metrics.json` contains per-frame visible bounds, centroid, ground displacement, area change, and a binary-alpha final-to-first seam score. These are review signals, not automatic artistic judgments.

## Review workflow

1. Inspect the animation at manifest FPS.
2. Step through every frame.
3. Verify ground and body-center guides.
4. Test loop-off and loop-on behavior.
5. Compare mirrored locomotion beside the source.
6. Compose entry and exit phrases.
7. Read prop ownership and interruption level.
8. Record a human decision before autonomous use.

## Interruption simulation

Frame stepping provides deterministic interruption points. During the next engine phase, the exact same frame index, prop state, and interruption rule will be fed into recovery tests. Composite-frame props require a documented prop-free recovery frame.

## Exports

- `animation_lab_contact_sheet.png`
- `mirrored_walk_review.png`
- `ANIMATION_METRICS_REPORT.md`
- `animation_metrics.json`

Short recordings require the native Electron runtime and are intentionally not fabricated in an environment where Electron cannot be launched.
