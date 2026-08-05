# PokoLoko — Step 20.5 Living Runtime Orchestration

## Purpose

Step 20.5 connects the previously isolated life systems to the real Electron pet. `LivingRuntimeController` is owned by the main process and coordinates behavior planning, hidden mind updates, bounded session memory, context influence, sleep, activities, reactions, locomotion, animation, pause, drag recovery, and character switching through narrow ports.

## Runtime flow

```text
stable idle
→ planner scores legal intentions
→ living runtime requests walk / activity / sleep / reaction / idle
→ existing locomotion and animation services execute
→ completion events return to the living runtime
→ mind and session memory update
→ safe neutral state
→ next sparse planning deadline
```

The planner never advances frames. The renderer never chooses behavior. High-frequency native movement remains inside the locomotion/native-window path.

## Integrated systems

- `BehaviorPlanner` chooses only at stable runtime decision points.
- `PetMind` updates every five seconds and after interaction, sleep, drag, and activity outcomes.
- `SessionMemory` records bounded activity, disturbance, and region summaries.
- `ContextSensorService` feeds coarse local snapshots directly into the planner.
- `ActivityController` executes entry, setup, loop, variation, exit, interruption, prop, and cooldown commands.
- `SleepLifecycleController` controls entry completion, loop, wake, hold, and recovery.
- `SocialInteractionController` handles click escalation, sleep-specific waking, prop-safe deferral, and bounded reactions.
- `LocomotionEngine` receives region destinations and reports completion.
- `BrowserAnimationDriver` reports one-shot completion and loop boundaries.

## Activity execution

Activity steps are interpreted centrally. Holds and deadlines use one owned scheduler, not chains scattered through UI components. Composite props remain embedded in frames; forced interruptions recover through a neutral asset and invalidate the old activity generation.

A defect discovered during integration was corrected: variation completion now returns to the main activity loop. Setup and exit sequences that contain only prop or state commands receive deterministic synthetic phase completion instead of becoming trapped forever.

## Pause and quiet behavior

Pause is an explicit safe-recovery command. It stops movement, cancels planner deadlines, clears active activity state, restores a neutral frame, and pauses renderer playback. Resume restores neutral idle before planning restarts.

Quiet mode changes planner eligibility and weighting. It does not fake sleep or instantly remove the pet.

## Diagnostics

The diagnostics surface now shows:

- active character and runtime mode;
- active phrase/activity/reaction;
- mood and hidden drive summaries;
- last planner decision reason.

The full snapshot is available through a typed, validated preload API.

## Remaining native gate

Static and compiled integration tests pass. Actual Windows transparency, scheduling, mixed-DPI motion, tray rendering, and packaged ASAR behavior remain part of the final GitHub Actions EXE and human Windows test pass.
