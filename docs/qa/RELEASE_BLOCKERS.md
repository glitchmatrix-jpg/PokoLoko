# PokoLoko Release Blockers — Step 26

## OPEN — NATIVE WINDOWS EXECUTION REQUIRED

**ID:** QA-26-001
**Severity:** RELEASE BLOCKER
**Reason:** The current environment cannot run or visually inspect the native Windows Electron build.

The following acceptance criteria therefore remain unproven:

- grounding across Windows 10/11, DPI combinations, taskbars, and display topologies;
- pet reachability and exact transparent hit-testing;
- packaged ASAR asset loading;
- tray survival through Explorer and display changes;
- native suspend/resume behavior;
- real CPU, memory, startup, decode, and movement-jitter measurements;
- multi-hour subjective charm and personality evaluation;
- frame-by-frame confirmation of foot contact, anchors, props, and transitions.

**Resolution procedure:** Run the manually dispatched Windows QA workflow, complete `MANUAL_QA_MATRIX.md`, attach videos/screenshots/native traces, fill the performance report with measured values, and close every failure below the blocker threshold.

## Corrected during Step 26

### QA-26-002 — malformed living-runtime logger callback

**Status:** CLOSED
A corrupted duplicated expression in `StaticPetController` would have prevented a valid Electron TypeScript build. The callback now logs structured details once and records the diagnostic event once.

### QA-26-003 — repeated validator chain

**Status:** CLOSED
The top-level validation script invoked the Step 25 automated-suite validator three times. It now invokes it once, reducing CI noise and duration without reducing coverage.

### QA-26-004 — no bounded native performance sampler

**Status:** CLOSED STATICALLY
A bounded sampler, movement-jitter tracking, diagnostic summary, unit tests, and disposal cleanup were added. Native thresholds remain pending under QA-26-001.

## Release decision

**Do not declare Step 26 fully accepted or proceed to final release packaging on the basis of static evidence alone.** The repository is ready to generate the Windows QA build, but native evidence is still required.


## STEP 27 STATUS

Packaging automation is complete. QA-26-001 remains open until the generated Windows installer passes clean-machine installation and long-session native review. The GitHub release is created as a draft/prerelease by default.
