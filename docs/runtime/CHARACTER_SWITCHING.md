# PokoLoko — Character Switching and Profile Isolation

## Choreography decision

PokoLoko uses a **neutral-idle commit switch**. The old character remains visible and grounded while the target character's neutral asset and profile bundle load. Once the first target frame is ready, the switch commits atomically. No blank frame, cross-character tween, or unsafe CSS scale transform is used.

A future short fade may be added only after native visual review; correctness does not depend on it.

## Switch transaction

```text
request character
→ increment switch generation
→ cancel planner deadline
→ cancel activity and clear composite props
→ stop locomotion/turning
→ invalidate animation and movement completions
→ cancel drag or settle it safely
→ load target neutral frame + asset profile
→ create fresh behavior mind and per-character session memory
→ preserve safe screen ground point
→ recalculate target anchors/window geometry
→ commit character and first frame atomically
→ persist selected character
→ broadcast presentation to pet/settings/diagnostics/tray
```

The old character remains authoritative until target loading succeeds. A failed target load leaves the old character active.

## State coverage

| Active state | Switch handling |
|---|---|
| Idle | stop pending planner work, preload, atomic neutral commit |
| Walk/start/stop/turn | stop translation, invalidate choreography, preserve ground point |
| Drag | cancel pointer session; settle/recover before commit |
| Sleep/entry/wake | invalidate sleep generation and recover to target neutral idle |
| Activity/prop | cancel activity and route through prop-clear recovery |
| Social reaction | invalidate completion and commit neutral target |
| Display recovery | latest switch generation wins after safe geometry refresh |
| Pause | target changes while remaining paused; no planner resumes |

## Profile isolation

Shared across characters:
- global size;
- always-on-top;
- sound/quiet/privacy settings;
- safe desktop position;
- application pause state.

Fresh per character on switch:
- behavior profile;
- hidden mind defaults;
- current-session activity memory;
- cooldowns;
- active activity/session;
- sleep lifecycle generation;
- animation generation;
- locomotion/turn generation.

The selected character is persisted. Hidden mood, annoyance, typing context, and inferred user behavior are not persisted.

## Stale-event protection

Every switch increments the switch generation. Animation, movement, sleep, activity, drag, and planner callbacks from older generations are ignored. Rapid `Poko → Loko → Poko` requests cannot commit out of order.

## Geometry and scale

- Both characters keep the fixed 128×128 logical canvas.
- User scale remains the same safe integer scale.
- Ground X is preserved when safe.
- Ground Y is recomputed from the current work area and target frame anchor.
- Per-character anchors are applied; visible bounds never recenter the sprite.

## Restart persistence

Settings persistence stores `selectedCharacter`. Startup validates and loads that character before the initial presentation. If it fails, startup falls back to Poko only through explicit recovery and logs the failure.

## Native EXE review matrix

The final Windows build must test switches during walk, edge turn, drag, sleep entry, settled sleep, wake, each prop-bearing activity, repeated click reaction, monitor removal, mixed-DPI transfer, pause, and rapid repeated requests. Verify no blank flash, ground jump, stale event, tray mismatch, or settings mismatch.
