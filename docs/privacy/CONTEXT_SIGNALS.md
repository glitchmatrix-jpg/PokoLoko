# PokoLoko Context Signals

## Purpose

Context sensing lets broad desktop conditions influence behavior probabilities. It never chooses an animation directly and never bypasses the legal state machine.

## Approved signal model

| Signal | Runtime source in Step 17 | Retention | Effect |
|---|---|---|---|
| Typing presence | Typed provider contract; unavailable by default until a reviewed OS adapter exists | Rolling five-sample band only | May raise laptop/reading/focused-idle probability |
| Mouse activity | Cursor-position delta sampled once per second | Rolling five-sample band only | Busy activity discourages long focus sessions |
| System idle | Electron `powerMonitor.getSystemIdleTime()` | Current seconds only | Encourages quiet/rest behavior |
| Time of day | Local hour reduced to four bands | Current band only | Late night gently raises sleep likelihood |
| Audio playing | Typed provider contract; unavailable by default | Current boolean only | May raise music probability |
| Fullscreen | Conservative provider; PokoLoko-owned fullscreen is supported, global adapter remains optional | Current boolean only | Suppresses movement, sound, and high-salience activity |
| Lock/resume | Electron power events | Current lock and 30-second resume flag | Freezes behavior and resumes gently |
| Recent pet interaction | Pet click/drag timestamps | Decaying 20-second band | Shapes social response and prevents spam |

Unavailable sensors are explicit. They never silently return fabricated activity.

## Stability

Signals are converted into coarse bands using bounded history, hysteresis, and one-second sampling. `CONTEXT_CHANGED` is emitted only when a semantic field changes. The planner receives context at safe decision points and applies weights; typing never deterministically launches a laptop activity.

## Full disablement

Turning context awareness off:

1. stops the sampling interval;
2. clears rolling histories and recent-interaction state;
3. emits a disabled snapshot;
4. marks every signal as disabled;
5. removes all context influence from future planning.
