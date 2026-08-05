# PokoLoko Performance Report

## Instrumentation added

`PerformanceSampler` records a bounded five-second series of:

- process CPU percentage;
- working set and heap usage;
- active handles and requests;
- window movement count;
- 95th-percentile movement cadence jitter.

The summary is included in the diagnostic snapshot. The sampler starts once with the pet controller, uses one unreferenced interval, retains a bounded history, and is explicitly stopped during disposal.

## Architecture review

High-frequency native window movement remains in `StaticPetController` rather than React state. Renderer presentation updates describe sprite state; they do not drive native window coordinates. Diagnostic UI polling occurs only while the diagnostic surface is mounted.

## Measurement thresholds

These are provisional release gates for the packaged Windows build:

| Metric | Idle target | Active target | Blocker threshold |
|---|---:|---:|---:|
| Main-process CPU, 5-minute mean | <1.0% | <5.0% | >2.5% idle or >10% active |
| Working-set growth over 4 hours | <40 MB | <70 MB | sustained >100 MB |
| Active-handle growth | 0 after settling | 0 after activity completion | any monotonic accumulation |
| Window movement cadence jitter p95 | n/a | <8 ms from target cadence | >16 ms sustained |
| Startup to visible pet | <2.5 s including splash | — | >5 s |
| Asset decode/startup failures | 0 | 0 | any |
| Orphan process after quit | 0 | 0 | any |

## Required captures

1. Idle for 30 minutes.
2. Continuous walking for 10 minutes.
3. Mixed activities for 60 minutes.
4. Four-hour normal session.
5. Character switch and settings churn for 30 minutes.
6. Repeated lock/resume and fullscreen transitions.
7. Display topology changes during movement.

Export the diagnostic trace and performance summary at the beginning and end of each capture.

## Synthetic baseline

`reports/performance/synthetic-baseline.json` verifies that deterministic harnesses do not intentionally accumulate timers, listeners, or action history. It is explicitly **not** a Windows CPU, GPU, memory, DWM, tray, or executable measurement.

## Current results

| Evidence | Result |
|---|---|
| Performance sampler unit tests | PASS |
| Bounded sample retention | PASS |
| Explicit sampler cleanup | PASS |
| High-frequency movement outside React state | PASS by architecture inspection |
| Native idle CPU | PENDING |
| Native active CPU | PENDING |
| Native memory stability | PENDING |
| Native startup time | PENDING |
| Native movement jitter | PENDING |
| React Profiler capture | PENDING |
