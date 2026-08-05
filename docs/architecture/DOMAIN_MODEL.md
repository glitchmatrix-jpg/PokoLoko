# PokoLoko — Domain Model

## Core identifiers

```ts
type CharacterId = "poko" | "loko";
type Direction = "left" | "right" | "front";
type Posture =
  | "standing_front"
  | "standing_side"
  | "sitting"
  | "crouching"
  | "lying"
  | "sleeping"
  | "edge_peeking"
  | "prop_held";

type LifecycleMode = "booting" | "active" | "paused" | "suspended" | "shutting_down";
type InterruptionLevel = "immediate" | "soft" | "deferred" | "locked";
type Generation = number;
```

## State taxonomy

### Stable posture states

```ts
type StableState =
  | { kind: "idle"; posture: "standing_front" | "standing_side" | "sitting" }
  | { kind: "sleeping"; posture: "sleeping"; sleepPhase: "light" | "settled" }
  | { kind: "settled"; posture: "sitting" | "lying" };
```

Stable states may accept behavior-planning decisions.

### Transitional states

```ts
type TransitionState =
  | { kind: "transition"; transitionId: string; from: Posture; to: Posture }
  | { kind: "turning"; from: Direction; to: Direction }
  | { kind: "waking"; target: "sitting" | "standing_front" }
  | { kind: "settling_after_drag"; targetDisplayId: string };
```

Transitions end only through validated animation markers, animation completion, or locomotion completion specified by choreography.

### Activity states

```ts
type ActivityState = {
  kind: "activity";
  session: ActivitySession;
};
```

Activity posture and prop state are explicit and may not be inferred from the animation filename.

### Interaction states

```ts
type InteractionState =
  | { kind: "dragged"; dragSessionId: string; originState: RecoverableStateSnapshot }
  | { kind: "social_reaction"; reactionId: string; source: "click" | "repeat_click" | "hover" };
```

### System states

```ts
type SystemState =
  | { kind: "booting" }
  | { kind: "paused"; resumeSnapshot: RecoverableStateSnapshot }
  | { kind: "suspended"; resumeSnapshot: RecoverableStateSnapshot }
  | { kind: "recovering"; reason: RecoveryReason }
  | { kind: "shutting_down" };
```

## Authoritative PetState

```ts
type PetState = {
  character: CharacterId;
  lifecycle: LifecycleMode;
  mode: StableState | TransitionState | ActivityState | InteractionState | SystemState;
  posture: Posture;
  direction: Direction;
  worldPosition: { x: number; y: number };
  displayId: string;
  animationGeneration: Generation;
  movementGeneration: Generation;
  activityGeneration: Generation;
  stateEnteredAtMonotonicMs: number;
  interruption: {
    level: InterruptionLevel;
    deferredEvent?: PetEvent;
  };
  propState: PropState;
};
```

`PetState` is mutated only by the domain reducer/controller after validating an event.

## PetContext

```ts
type PetContext = {
  sampledAtMonotonicMs: number;
  typingActivity: "none" | "light" | "sustained";
  pointerActivity: "none" | "light" | "busy";
  systemIdle: boolean;
  audioActive: boolean;
  fullscreenActive: boolean;
  screenLocked: boolean;
  resumedRecently: boolean;
  localTimeBand: "morning" | "day" | "evening" | "late_night";
  recentUserInteraction: "none" | "light" | "high";
  contextEnabled: boolean;
};
```

No field contains content, key identity, window title, clipboard value, screenshot, URL, document text, or message data.

## PetPresentation

```ts
type PetPresentation = {
  character: CharacterId;
  stateTag: string;
  posture: Posture;
  direction: Direction;
  animation: {
    animationId: string;
    frameIndex: number;
    framePath: string;
    canvasWidth: 128;
    canvasHeight: 128;
    playbackGeneration: number;
  };
  anchors: {
    ground: { x: number; y: number };
    bodyCenter?: { x: number; y: number };
    interaction?: { x: number; y: number };
  };
  worldPosition: { x: number; y: number };
  windowRect: { x: number; y: number; width: number; height: number };
  propState: PropState;
  isDragging: boolean;
  isPaused: boolean;
  visibility: "visible" | "quiet" | "hidden";
};
```

Presentation is a projection of domain state and runtime clocks; it is not persisted as truth.

## ActivitySession

```ts
type ActivitySession = {
  id: string;
  definitionId: string;
  generation: number;
  phase: "entry" | "setup" | "loop" | "variation" | "exit" | "recovery";
  startedAtMonotonicMs: number;
  plannedEndAtMonotonicMs?: number;
  loopCount: number;
  selectedVariationIds: string[];
  originPosture: Posture;
  targetExitPosture: Posture;
  propState: PropState;
  interruptionLevel: InterruptionLevel;
  contextReason?: string;
};
```

## TransitionRequest

```ts
type TransitionRequest = {
  requestId: string;
  generation: number;
  fromState: PetState["mode"];
  target: PetIntention;
  reason: TransitionReason;
  requestedAtMonotonicMs: number;
  urgency: "normal" | "user" | "system";
};
```

The state machine validates legality. The transition composer then selects the visual choreography.

## Prop state

```ts
type PropState =
  | { kind: "none" }
  | { kind: "appearing"; propId: string; owner: "composite_frame" | "separate_layer" }
  | { kind: "held"; propId: string; owner: "composite_frame" | "separate_layer" }
  | { kind: "disappearing"; propId: string; owner: "composite_frame" | "separate_layer" };
```

Composite-frame props cannot be independently removed; interruption must route to a frame or neutral recovery where the prop is absent.

## Pet intention

```ts
type PetIntention =
  | { kind: "remain_idle"; durationRangeMs: [number, number] }
  | { kind: "walk"; destination: DestinationPolicy }
  | { kind: "sleep" }
  | { kind: "activity"; activityId: string }
  | { kind: "social_reaction"; reactionId: string }
  | { kind: "settle" };
```

An intention is a proposal, not a state mutation.

## Recoverable snapshot

A snapshot stores only data required to recover safely:

```ts
type RecoverableStateSnapshot = {
  character: CharacterId;
  posture: Posture;
  direction: Direction;
  worldPosition: { x: number; y: number };
  displayId: string;
  safeNeutralState: "idle_front" | "idle_side" | "sitting" | "sleeping";
};
```

It does not preserve stale timers, event promises, or private context.

## Domain invariants

- `posture` must match the current animation’s declared posture phase.
- `propState.kind !== "none"` requires an activity or transition that declares the prop.
- `dragged` always cancels locomotion.
- `sleeping` cannot own a locomotion destination.
- animation completion is accepted only when its generation matches.
- a character change increments all generations.
- renderer messages cannot set `PetState`.
