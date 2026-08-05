# IPC Audit

## Summary

The current bridge contains 13 renderer-to-main methods/events and four main-to-renderer subscriptions. One additional main handler, `animations:get`, has no preload exposure and no caller. Channels are string literals duplicated across main, preload, and renderer declarations; there is no runtime schema validation, protocol version, request ID, or structured error envelope.

## Renderer → main request/response channels

| Channel | Transport | Caller | Main owner | Payload | Response | Error behavior | Decision |
|---|---|---|---|---|---|---|---|
| `settings:get` | `invoke/handle` | `Pet`, `Settings` through preload | `electron/main.ts` | none | `AppSettings` | Rejected promise only on thrown main error | REFACTOR |
| `settings:pet` | `invoke/handle` | Settings pet buttons | `setPet()` | `PetName` | `AppSettings` | No runtime payload validation | REPLACE protocol |
| `settings:pause` | `invoke/handle` | Settings toggle | `togglePause()` | none | `AppSettings` | No structured failure | REFACTOR |
| `settings:top` | `invoke/handle` | Settings toggle | `toggleAlwaysOnTop()` | none | `AppSettings` | No structured failure | REFACTOR |
| `animations:get` | `invoke/handle` | **No caller; not exposed in preload** | `readAnimationManifest()` | none | unknown JSON | File/parse failure rejects; dead route | DELETE |

## Renderer → main fire-and-forget channels

| Channel | Caller | Main owner | Payload | Behavior | Risk / finding | Decision |
|---|---|---|---|---|---|---|
| `settings:open` | Pet double-click | `createSettingsWindow()` | none | Opens/focuses settings | Fine conceptually | REFACTOR |
| `menu:context` | Pet context menu | tray menu popup | none | Rebuilds and displays menu | Coupled to tray instance and pet window | REFACTOR |
| `pet:react` | click reaction logic | `triggerReaction()` | `'happy' | 'confused'` | Clears all timers, enters `INTERACTING`, broadcasts reaction | Unvalidated payload; no acknowledgment; renderer and main both control completion | REPLACE |
| `drag:start` | pointer threshold crossed | drag handler | `{x,y}` screen coordinates | Clears timers, computes cursor offset, enters `DRAGGED` | No payload validation; event can arrive after window/state changes | REPLACE |
| `drag:move` | every pointer move while dragging | drag handler | `{x,y}` | Clamps native window to nearest display work area | Unthrottled IPC; no sequence/session ID; stale moves can race | REPLACE |
| `drag:end` | pointer release/cancel | drag handler | none | Snaps window to floor, enters `LANDING`, schedules behavior in 850 ms | Landing completion is timer-based, not animation-based | REPLACE |

## Main → renderer broadcast channels

All broadcasts go to both the pet window and settings window through `sendToWindows()`, even when a channel is irrelevant to one surface.

| Channel | Sender(s) | Receiver(s) | Payload | Finding | Decision |
|---|---|---|---|---|---|
| `settings:changed` | `broadcastSettings()` and pet ready | Settings subscribes; Pet does not | `AppSettings` | Broadcast to pet is unused | REFACTOR |
| `pet:changed` | `setPet()` and pet ready | Pet subscribes; Settings relies on settings broadcast | `PetName` | Duplicates selected-pet information already present in settings | REPLACE with snapshot/event model |
| `behavior` | `setState()` | Pet subscribes | coarse `PetState` | Insufficient presentation contract; no transition reason/version | REPLACE |
| `reaction` | `triggerReaction()` | Pet subscribes | `ReactionName` | Separate event can race with `behavior=INTERACTING` | DELETE as independent channel |

## Preload API surface

The bridge is context-isolated and returns unsubscribe functions for subscriptions, which is a good foundation. However, its API mirrors implementation actions rather than a stable product protocol. The redesigned bridge should expose command/query/event groups and share generated types between main, preload, and renderer.

Recommended shape:

- `getAppSnapshot()`
- `dispatchPetIntent(intent)`
- `updateSettings(patch)`
- `beginDrag(session)` / `moveDrag(session)` / `endDrag(session)`
- `openSurface(surface)`
- `onAppEvent(event)`

Each message should use runtime validation, discriminated unions, protocol versioning, and a monotonic state revision so stale renderer events cannot overwrite newer state.

## Error handling findings

- Fire-and-forget `send` channels cannot report rejected actions.
- Renderer settings actions use `try/finally` but no `catch`, so failures become unhandled promise rejections and the interface gives no feedback.
- Main process logs URL loading errors but does not surface a recovery screen.
- Broadcast sends do not check `webContents.isDestroyed()` separately, although window destruction is checked.
- No IPC caller verification is performed to ensure the sender belongs to an expected PokoLoko window.

## Acceptance accounting

Every current IPC route has been located, traced to its caller and owner, and assigned a redesign decision. No route should be copied without an explicit new protocol definition.
