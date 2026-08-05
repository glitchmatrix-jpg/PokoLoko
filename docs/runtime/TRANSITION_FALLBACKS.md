# PokoLoko Step 12 — Transition Fallbacks

Fallbacks are explicit choreography obligations, not permission for abrupt sprite changes.

| Gap | Legal fallback | Forbidden behavior |
|---|---|---|
| Front idle → side walk | neutral bridge → side idle → walk start | instant side walk swap |
| Side idle → sleep/activity | neutral bridge → front idle | side pose jumping into prop/sleep |
| Walking → non-walk action | gait-safe stop → side idle → neutral front | mid-cycle activity switch |
| Activity → locomotion | prop-safe activity exit → front idle → side route | walking while laptop/book/cup remains |
| Sleeping → any awake action | waking recovery → front idle | sleep loop directly to walk/play |
| Missing wake art | documented neutral recovery phrase | reverse arbitrary sleep frames unless approved |
| Missing stop art | finish gait → short neutral hold | instant flip or frame-zero reset |
| Display/asset failure | system recovery → reachable front idle | invisible or off-screen continued state |
| Character switch | invalidate generations → preload neutral frame → recovery | old completion mutating new character |

## Rejection behavior

A request made during a locked transition is rejected with `locked-transition-must-complete`, except immediate interruptions such as drag, shutdown, and display-loss recovery. Rejection does not silently queue arbitrary behavior.

## Stale completion behavior

An animation or movement completion with a generation different from the current state is ignored. It cannot advance posture, clear props, restart locomotion, or alter the selected character.

## Development diagnostics

Illegal requests are logged with a complete route explanation. Production remains recoverable: it keeps the current valid state or enters neutral recovery rather than crashing.
