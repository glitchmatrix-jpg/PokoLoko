# PokoLoko Interaction and Liveliness Audit

## What was changed in this patch

1. Added main-process cursor polling during a pressed/dragging session. The main process now samples Electron's screen cursor position every 12 ms and feeds it into the existing InteractionController. Window movement therefore no longer depends entirely on renderer pointer-move delivery while the native BrowserWindow is itself moving.
2. Added a 15-second drag safety timeout so a lost pointer-up cannot leave the runtime permanently captured.
3. Stopped the native drag poller on pointer-up, cancellation, and controller disposal.
4. Fixed the alpha hit-test toggle in PetSurface. The previous implementation returned immediately when `interactive` was false, so it never actually restored click-through mode after leaving the visible sprite.

## Why dragging was unreliable

The renderer captured a pointer, emitted IPC commands, and then the main process moved the BrowserWindow beneath that pointer. On Windows, moving a frameless transparent window can interrupt or starve DOM movement delivery. requestAnimationFrame coalescing reduced IPC backlog, but it did not remove the dependency on events from the moving window. The new poller makes cursor position authoritative in the main process during the gesture.

## Sprite audit

The art is attractive and consistent, but the core idle vocabulary is too small:

- `poko_idle_blink` has only two frames.
- `poko_idle_look_01` has only two frames and reads as a repetitive head shake.
- Most of Poko's personality is locked inside long, self-contained activity clips.
- There is no true neutral breathing loop, weight shift, ear twitch, anticipation pose, landing/recovery phrase, or smooth front-to-side turn.

This means the planner can select many states while the moment-to-moment desktop presence still feels binary: frozen idle, then a clip, then frozen idle again.

## Recommended Poko v0.2 animation set

Create these before adding more large activities:

- `poko_idle_breathe`: 6 frames, 3-4 fps, seamless loop, tiny chest/body rise.
- `poko_idle_ear_twitch`: 5 frames, one shot, asymmetric.
- `poko_idle_glance_left` and `poko_idle_glance_right`: 6 frames each, including anticipation and settle.
- `poko_turn_front_to_side` and `poko_turn_side_to_front`: 6-8 frames.
- `poko_pickup`: 5-6 frames, startled lift pose used when dragging begins.
- `poko_carried_loop`: 4 frames, feet dangling or subtle wiggle while dragged.
- `poko_drop_land`: 6-8 frames, squash, rebound, settle.
- `poko_walk_start` and `poko_walk_stop`: 4-6 frames each.

Loko should receive quieter equivalents rather than copied Poko motion.

## Behavior changes recommended next

- Replace hard restoration to a static idle image with an ambient-idle controller that alternates breathing, blinking, ear twitches, and glances.
- Add short anticipation and recovery phrases around activities.
- Use weighted variation inside a behavior family instead of repeatedly replaying one animation ID.
- Reduce immediate post-action replanning; let the pet visibly settle for 300-900 ms.
- Give drag its own animation state rather than pausing the current frame.
- Keep Poko lively through variety, not constant motion. Constant random activity becomes screensaver noise.

## Validation status

The source patch was inspected structurally. Full TypeScript/test execution could not be completed in this environment because the uploaded repository contains no package-lock.json and the available npm mirror did not provide `@eslint/js@9.38.0`. Run the normal project validation on GitHub Actions or the user's Windows development machine before release.
