# PokoLoko — State Ownership

## Single source of truth

`PetController` in the domain engine owns the authoritative `PetState`. Every other subsystem holds only scoped runtime state and reports events back to the controller.

## Ownership matrix

| Concern | Authoritative owner | May read | May request | Must not do |
|---|---|---|---|---|
| Pet state/posture/direction | PetController | all presentation producers | state transition | renderer may not infer/mutate |
| Legal transitions | StateMachine | PetController | legality result | animation may not choose next state |
| Transition choreography | TransitionCoordinator | asset registry/state graph | playback/movement commands | may not redefine legality |
| Sprite frame index | AnimationRuntime | renderer/diagnostics | completion/marker event | may not mutate posture |
| World position/velocity | LocomotionEngine | PetController/Electron host | destination/stop | renderer may not accumulate movement |
| Native window position | WindowHost | Electron only | apply position | behavior may not call BrowserWindow |
| Behavior recommendation | BehaviorPlanner | PetController | intention proposal | may not force action |
| Hidden drives/mood | MindController | planner/diagnostics | mind updates | renderer may not change it |
| Context summary | ContextSensor | planner/domain | CONTEXT_CHANGED | may not inspect content |
| Activity phase | ActivityController | domain/presentation | phase event | arbitrary timers may not own it |
| User settings | SettingsStore | domain/UI | validated update | tray/UI may not diverge |
| Audio playback | AudioController | presentation/settings | cue command | audio completion cannot change posture |
| Props | ActivityController + domain | renderer | prop phase | renderer cannot silently hide composite prop |

## Clock ownership

| Clock | Owner | Frequency | Purpose |
|---|---|---:|---|
| Native render/vsync | renderer/browser | display-driven | paint only |
| Sprite animation clock | AnimationRuntime | RAF or monotonic scheduler | frame progression |
| Locomotion clock | LocomotionEngine | high-frequency monotonic loop | continuous position |
| State-duration clock | PetController | deadlines in scheduler | stable-state timing |
| Behavior-planning clock | BehaviorPlanner scheduler | sparse, state-dependent | next intention |
| Context-sampling clock | ContextSensor | low frequency/event-based | content-blind summaries |
| Mind/cooldown clock | MindController | low frequency + events | drive decay/update |
| Audio clock | AudioController | media engine | sound cue timing |

No subsystem uses wall-clock `Date.now()` for simulation. Use monotonic time; local wall time is sampled only to derive a coarse time band.

## Lifecycle ownership

- **Boot:** Electron shell initializes; PetController remains `booting` until assets, settings, display, and renderer readiness are confirmed.
- **Active:** PetController runs state/mind/planner.
- **Paused:** PetController invalidates motion/activity generations and holds safe presentation.
- **Suspended:** PowerSessionService emits event; controller snapshots and freezes clocks.
- **Resume:** display/context refresh occurs before recovery.
- **Shutdown:** controller enters `shutting_down`, invalidates all generations, then Electron destroys resources.

## Event acceptance

Every asynchronous event contains:
- source;
- event ID;
- monotonic timestamp;
- relevant generation;
- optional correlation ID.

PetController rejects:
- stale generation;
- event incompatible with lifecycle;
- duplicate completion;
- completion from inactive character;
- movement event from canceled destination;
- context event after context was disabled.

## Renderer contract

The renderer may:
- display `PetPresentation`;
- report pointer/drag gestures;
- report renderer readiness;
- report image load failure;
- display diagnostics.

The renderer may not:
- infer wake transitions;
- select animations;
- advance the domain state;
- move the native window directly;
- persist behavior state;
- schedule autonomous actions.

## Tray/settings contract

Tray and settings produce commands (`PAUSE_REQUESTED`, `CHARACTER_CHANGE_REQUESTED`, etc.). They do not mutate local copies and hope the runtime catches up. Confirmed state is broadcast back to both interfaces.
