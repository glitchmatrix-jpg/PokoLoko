# PokoLoko — Target Architecture

## Architectural intent

PokoLoko is designed as a local-first desktop companion whose physical correctness is guaranteed by a deterministic domain core while personality, context, memory, and seeded chance influence only legal next actions. No visual layer may invent state, no behavior layer may move windows directly, and no activity may bypass posture, prop, interruption, or transition rules.

## Layer map

```text
Electron Shell
├── WindowHost
├── TrayHost
├── DisplayService
├── StartupService
├── PowerSessionService
└── IPC Gateway
        │ typed commands/events
        ▼
Pet Domain Engine
├── PetController                    authoritative state owner
├── StateMachine                     legal state transitions
├── TransitionCoordinator            selects choreography
├── ActivityController               full activity sessions
├── PetMind                          hidden drives/mood
├── SessionMemory                    recent-session narrative
└── RecoveryCoordinator              deterministic failure recovery
        │ intentions / events
        ├───────────────┬────────────────┬─────────────────┐
        ▼               ▼                ▼                 ▼
Animation Runtime   Locomotion Engine  Behavior Planner  Interaction Controller
        │               │                │                 │
        └───────────────┴───────┬────────┴─────────────────┘
                                ▼
                         PetPresentation
                                │
                          typed one-way IPC
                                ▼
Renderer
├── Fixed 128×128 SpriteCanvas
├── HitMask Layer
├── Optional Effects/Audio
├── Settings UI
└── Diagnostics UI
```

## Layer responsibilities

### Electron shell
Owns native windows, monitor/work-area information, tray lifecycle, app startup, suspend/resume notifications, packaged asset location, and high-frequency native window position application. It does not choose behavior or animation.

### Pet domain engine
Owns the only authoritative `PetState`, current character, direction, posture, activity session, transition token, interruption lock, recovery mode, and lifecycle phase.

### Animation runtime
Advances sprite frames using animation time, emits completion/marker events, and never chooses the next domain state. It accepts immutable playback commands containing animation ID, start frame, playback mode, and generation token.

### Locomotion engine
Owns continuous world position, velocity, destination, display/work-area bounds, and movement completion. It does not advance sprite frames and does not make behavior decisions.

### Transition composer
Converts a legal state transition into posture-compatible choreography: optional holds, orientation routing, animation phrases, prop setup/teardown, markers, and recovery targets. State legality and visual choreography remain separate data.

### Behavior planner
Scores only actions that are physically and contextually legal. It proposes intentions; the domain controller accepts, defers, or rejects them.

### Context sensor
Produces content-blind summaries such as typing-active, pointer-active, system-idle, audio-active, fullscreen, locked, resumed, and local time band. It cannot access text, clipboard, screenshots, browser history, messages, document contents, or passwords.

### Interaction controller
Normalizes hover, click, repeated click, drag, tray, pause, quiet mode, and character-switch commands. It requests domain events rather than mutating presentation.

### Renderer
Draws `PetPresentation` and forwards user input. It does not derive state from previous visuals and cannot transition the pet independently.

### Settings/persistence
Persists user settings, selected character, safe last position, onboarding state, and optional crash-recovery snapshot. It does not persist private context histories or long-term behavioral profiling.

### Audio
Plays optional short local cues associated with animation markers. It obeys mute, volume, quiet/fullscreen, pause, and shutdown.

### Diagnostics
Observes events, clocks, state, scores, anchors, display bounds, and recovery actions. Production builds disable it by default.

### Asset registry
Provides immutable typed metadata for approved runtime animations, isolated bridge poses, anchors, hit masks, prop phases, marker frames, loop policy, and source provenance.

## Dependency rule

Dependencies point inward toward domain contracts:

```text
Renderer → IPC contracts ← Electron shell
                        ↓
                  Domain interfaces
             ↙ Animation  Locomotion ↘
          Assets        Planner        Context
```

Forbidden dependencies:

- renderer → behavior planner;
- behavior planner → Electron `BrowserWindow`;
- locomotion → sprite frame index;
- animation runtime → state-machine mutation;
- context sensor → renderer DOM;
- activity implementation → arbitrary global timers;
- tray callbacks → direct animation swaps.

## Runtime command flow

1. An event enters through Electron, interaction, context, animation, locomotion, or settings.
2. `PetController` validates event generation and current lifecycle.
3. `StateMachine` determines whether a transition is legal.
4. `TransitionCoordinator` resolves choreography.
5. Controllers issue narrowly scoped commands:
   - animation playback;
   - locomotion target;
   - prop/audio changes;
   - renderer presentation;
   - native window position.
6. Completion events return with generation tokens.
7. Stale events are ignored.
8. Stable-state entry schedules the next behavior-planning deadline.

## No circular ownership

- Domain owns truth.
- Animation owns frame progression only.
- Locomotion owns spatial progression only.
- Planner owns recommendations only.
- Renderer owns pixels and input capture only.
- Electron owns OS primitives only.

## Repository target

```text
apps/desktop/
├── electron/
│   ├── main/
│   ├── preload/
│   └── services/
├── src/
│   ├── pet-renderer/
│   ├── settings/
│   ├── onboarding/
│   └── diagnostics/
packages/
├── pet-domain/
├── animation-runtime/
├── locomotion/
├── behavior/
├── context/
├── asset-registry/
├── ipc-contracts/
└── shared-types/
assets/runtime/
docs/architecture/
tests/
```

A simpler single-package layout is acceptable during implementation, but these ownership boundaries are not optional.

## Architectural invariants

1. Exactly one authoritative pet state exists.
2. Every asynchronous event carries a generation or session token.
3. Stable states are the only ordinary behavior-planning points.
4. Transitional states complete from animation markers or explicit physical completion, not arbitrary timeouts.
5. A fixed 128×128 sprite canvas is never resized per frame.
6. Anchors determine placement; visible bounds never recenter the character.
7. Context changes weights, never physical legality.
8. Immediate interruption always has a deterministic recovery route.
9. Missing assets degrade to safe neutral posture rather than crash or incompatible jumps.
10. Pause, suspend, shutdown, display loss, and character switch cancel or invalidate pending work.
