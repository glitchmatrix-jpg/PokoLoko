# PokoLoko — Walk Speed Tuning

## Character profiles

All values are logical desktop pixels per second.

| Character | Calm | Balanced | Lively |
|---|---:|---:|---:|
| Poko | 34 | 46 | 60 |
| Loko | 30 | 42 | 54 |

Poko is slightly quicker and accelerates more eagerly. Loko moves more deliberately. The difference is intentionally restrained; personality must eventually come from destination choice, pauses, activities, and timing—not cartoonishly different speed alone.

## Acceleration and deceleration

| Character | Acceleration | Deceleration |
|---|---:|---:|
| Poko | 150 px/s² | 190 px/s² |
| Loko | 125 px/s² | 165 px/s² |

Deceleration exceeds acceleration so arrivals feel controlled instead of floaty. Values remain configuration data in `profiles.ts`.

## Foot cadence

The source walk cycles are authored at 8 FPS with a recommended travel speed of approximately 45 px/s. Runtime FPS scales with actual maximum travel speed:

```text
runtimeFPS = clamp(4, 12, sourceFPS × travelSpeed / authoredSpeed)
```

Approximate results:

| Character / mode | Speed | Walk FPS |
|---|---:|---:|
| Poko calm | 34 | 6.0 |
| Poko balanced | 46 | 8.2 |
| Poko lively | 60 | 10.7 |
| Loko calm | 30 | 5.3 |
| Loko balanced | 42 | 7.5 |
| Loko lively | 54 | 9.6 |

This is an initial anti-sliding calibration, not final artistic approval. The animation laboratory and Windows video review must confirm whether feet visually plant at these combinations.

## Tuning procedure after EXE build

1. Record each character walking at all three activity levels.
2. Use a fixed 600 px route.
3. Inspect normal-speed video and frame stepping.
4. Look for foot sliding, excessive bobbing, slow-motion stepping, and rushed frames.
5. Adjust authored-speed metadata or profile speed—not per-frame sprite scale.
6. Change one parameter at a time and keep a tuning log.
7. Verify both left and right cycles.

## Acceptance targets

- calm movement feels unhurried but not sluggish;
- balanced movement matches the authored 8 FPS cadence closely;
- lively movement remains readable and does not become frantic;
- Poko and Loko differ subtly without seeming like separate physics worlds;
- stopping reaches a stable pixel once and never shakes around the target.
