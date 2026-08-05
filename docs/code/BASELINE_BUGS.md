# Baseline Bugs and Reproduction Record

## Build reproduction

### Attempted command

```text
npm install --no-audit --no-fund
```

### Result

Dependency installation failed before project scripts could run:

```text
npm ERR! code E404
npm ERR! 404 Not Found ... /@types%2fnode
'@types/node@^22.10.0' is not in this registry.
```

The configured internal npm mirror did not contain the dependency. The project also has no `package-lock.json`, so a deterministic clean install is not currently possible. Because dependencies were unavailable, the following were **not** claimed as passing:

- TypeScript typecheck;
- Vite renderer build;
- Electron compilation;
- development Electron launch;
- Windows runtime visual test;
- NSIS packaging;
- installer launch.

The dependency-free asset validator did run and passed 265 PNG references across 24 animations.

## Static behavioral baseline

### Startup

Expected from code: centered 180 × 180 transparent window on primary work-area floor; pet shows inactive; initial Poko/Loko selection is broadcast; idle begins; first decision occurs after 700 ms. Tray is created after pet window creation. No onboarding exists.

Risks: pet readiness and tray readiness are not coordinated; missing renderer assets can result in blank content without recovery; pet window is focusable.

### Idle

Expected: renderer loops generic idle animation. Main schedules decisions in character-specific ranges.

Bug: no ambient sub-behavior, repetition memory, or context. Renderer reset on character switch can race with old completion.

### Walking

Expected: native window moves toward random X at 75 px/s Poko or 48 px/s Loko while walk animation loops.

Bugs: rounded-position feedback causes quantization; no start/stop/turn; arbitrary destination; cannot intentionally cross displays; physical speed and stride are unrelated; sudden idle switch on arrival.

### Sitting

Expected: direct looping sit animation for 2–4 seconds before next random behavior.

Bugs: no stand-to-sit or sit-to-stand bridge; can jump from sit directly to walking/sleeping/idle.

### Sleeping

Expected: renderer infers sleep transition then loop; after 7–14 seconds main changes to idle, renderer infers wake.

Bugs: main schedules next behavior independent of wake completion; no posture-safe interruption; sleep probability variable is capped incorrectly for Loko.

### Click/reaction

Expected: click after 240 ms delay produces happy; four clicks in 1.4 seconds produce confused; double click opens settings.

Bugs: main and renderer disagree about reaction completion; paused click can leave main `INTERACTING`; no spam queue policy; every click is delayed; reaction ignores posture.

### Dragging

Expected: movement starts after 6 px threshold; native window follows cursor within nearest display; release snaps to floor and plays landing.

Bugs: 180 × 180 transparent rectangle captures input; unthrottled IPC; stale event risk; abrupt vertical snap; fixed 850 ms completion; monitor-boundary jumps possible.

### Character switching

Expected: clear timers, save pet, reset idle, update tray tooltip/menu, schedule decision.

Bugs: character profiles differ only numerically; stale renderer completion not revision-guarded; tray icon remains Poko icon regardless of selected pet; product identity remains “Poko.”

### Tray and settings

Expected: choose pet, toggle always-on-top, pause, open fixed settings, quit.

Bugs: no launch-at-startup implementation despite roadmap requirement; no restart action; no activity/personality/privacy controls; pause resets to idle rather than preserving state; old icon/branding; settings promise failures have no UI feedback.

### Display changes

Expected: metrics change or display removal clamps pet and snaps it to floor.

Bugs: display addition is not handled; movement target remains stale; a dragged/airborne pet is forcibly grounded; mixed-DPI behavior is untested; window geometry uses full rectangle rather than visual anchor.

### Shutdown

Expected: tray Quit calls `app.quit`; pet close clears timers.

Risks: no explicit `before-quit` controller teardown; screen listeners persist for app lifetime; dev child shutdown uses generic `.kill()` and may leave descendants on Windows shells.

## Documentation inconsistencies

- Package version is 0.1.2, while README, changelog milestone, installer examples, settings UI, workflow documentation, and `IMPLEMENTATION.json` refer to 0.1.1.
- `IMPLEMENTATION.json` calls the behavior a “state-machine”; source implements random timers and a coarse state variable.
- README says the source was statically audited and broadly “works,” but explicitly lacks final Windows runtime validation.
- Build workflow uses Node 24 while package engine minimum is 22.12 and the local guidance does not establish a tested exact version.
- No lockfile exists, so workflow dependencies can drift.

## Manual visual test status

A behavioral video could not be captured in this Linux, dependency-restricted environment. The Windows matrix remains mandatory before any KEEP claim about visible runtime quality. This failure is documented rather than silently treated as a pass.
