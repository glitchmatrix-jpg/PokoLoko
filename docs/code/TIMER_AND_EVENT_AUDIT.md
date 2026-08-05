# Timer and Event Audit

## Production timers and high-frequency loops

| Location | Primitive | Cadence / delay | Purpose | Cancellation | Finding |
|---|---|---:|---|---|---|
| `electron/main.ts` | `setTimeout` (`behaviorTimer`) | Poko 2–5 s; Loko 4–9 s; many explicit overrides | Schedule next random behavior | `clearBehaviorTimer()` | Central rigid scheduler; transition completion not authoritative |
| `electron/main.ts` | `setInterval` (`movementTimer`) | 16 ms | Native window locomotion | `clearMovementTimer()` | High-frequency main/native calls; rounded bounds feedback |
| `src/components/Pet.tsx` | `setTimeout` (`clickTimer`) | 240 ms | Distinguish single from double click | cleanup/unset | Delays every single-click reaction; gesture arbitration coupled to component |
| `src/hooks/useSpriteAnimation.ts` | `requestAnimationFrame` | display refresh | Advance multi-frame animation based on FPS | cancel current RAF | Reasonable clock primitive; semantics incomplete |
| `src/hooks/useSpriteAnimation.ts` | `setTimeout` | `1000/fps` | Complete nonlooping single-frame animation | effect cleanup | Artificial duration; no explicit frame duration metadata |

## Development-only polling loops

| Location | Primitive | Cadence | Purpose | Finding |
|---|---|---:|---|---|
| `scripts/dev.mjs` | recursive `setTimeout` | 200 ms | Wait for Vite HTTP server | Polls forever if Vite exits/fails |
| `scripts/dev.mjs` | recursive `setTimeout` | 200 ms | Wait for compiled main file | Can accept stale prior build; polls forever on compiler failure |

## Event listeners

### Main process

- `tray.on('double-click')` opens settings.
- `webContents.setWindowOpenHandler` denies new windows.
- `webContents.on('will-navigate')` restricts navigation.
- pet/settings `closed` listeners null references.
- pet `ready-to-show` broadcasts initial state.
- `app.on('second-instance')` opens settings.
- `screen.on('display-metrics-changed')` clamps/snap-floors pet.
- `screen.on('display-removed')` clamps/snap-floors pet.
- `app.on('activate')` recreates pet.
- Ten IPC handlers/listeners are registered globally.

### Renderer

- `Pet` subscribes to pet, behavior, and reaction events and correctly unsubscribes.
- `Settings` subscribes to settings changes and returns the unsubscribe function.
- Pointer capture is used for drag gestures.
- `useSpriteAnimation` creates an RAF loop per definition and cancels it on effect teardown.

## Race conditions and stale-event risks

1. **Reaction race:** `behavior=INTERACTING` and `reaction` are separate broadcasts; order is not encoded as one atomic state revision.
2. **Animation completion race:** renderer `onDone` mutates local animation even after pet/state changes unless effect teardown wins before callback execution.
3. **Wake race:** main schedules the next behavior independently of renderer wake completion.
4. **Landing race:** fixed 850 ms behavior delay is independent of landing animation completion.
5. **Pause reaction dead state:** reaction while paused leaves main state `INTERACTING` indefinitely.
6. **Display-change movement race:** display clamp may occur while movement interval still targets stale coordinates.
7. **Drag message race:** unsequenced move/end messages can arrive around state changes.
8. **Settings window initialization race:** initial `getSettings` response can theoretically arrive after a newer settings broadcast and overwrite it with an older snapshot.
9. **Duplicate dev startup risk:** stale `dist-electron/main.js` can satisfy `waitFile()` before a fresh compile completes.

## Event ownership problem

Events are not modeled as domain events. They are direct imperative signals such as `behavior`, `reaction`, and `pet:changed`. There is no monotonic revision, transition reason, correlation ID, or acknowledgment. Consequently, ordering assumptions are implicit.

## Decision

Replace production timers and events with:

- an authoritative pet controller;
- explicit domain events;
- animation-completion acknowledgments;
- one monotonic high-resolution locomotion clock;
- planner wakeups that request intentions only from stable states;
- cancellable/versioned activities and drag sessions;
- fake-clock tests instead of real timer sleeps.
