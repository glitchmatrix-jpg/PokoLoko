# PokoLoko — Pet Mind Model

## Purpose

`PetMind` provides hidden, session-limited tendencies that make behavior coherent without claiming consciousness, creating guilt, or profiling the user. Values affect action scoring only after physical legality and interruption safety have been established.

## Type

```ts
type Mood =
  | "content"
  | "curious"
  | "playful"
  | "focused"
  | "sleepy"
  | "socially_warm"
  | "saturated"
  | "subdued";

type PetMind = {
  energy: number;          // 0..1
  playfulness: number;     // 0..1
  focus: number;           // 0..1
  sociability: number;     // 0..1
  curiosity: number;       // 0..1
  comfort: number;         // 0..1
  boredom: number;         // 0..1
  recentAttention: number; // 0..1, quickly decaying
  mood: Mood;
  wakeDurationMs: number;
  recentActivities: ActivityMemory[];
  recentRegions: ScreenRegionMemory[];
  interruptionLoad: number;
};
```

## Character baselines

### Poko
- higher playfulness and curiosity;
- faster social response;
- greater novelty bonus;
- shorter focus sessions;
- more frequent small movement;
- shorter sleep sessions;
- faster recovery after interruption;
- quicker saturation only after repeated poking.

### Loko
- higher focus and comfort;
- longer stable holds;
- slower social response;
- stronger preference for reading/laptop;
- longer sleep and activity sessions;
- greater annoyance penalty for rapid repeated attention;
- longer settling hold after interruption.

Baselines are configuration data, not hard-coded branches throughout the planner.

## Drive dynamics

Drive evolution uses a low-frequency mind tick, not renderer frames.

```text
energy decreases slowly while awake and faster during play/walking
energy rises during sleep and calm settled rest
boredom rises during long unvaried stable states
boredom falls after meaningful activity or location change
focus rises during sustained typing/quiet context
focus falls during busy pointer activity and play
curiosity rises after resume/display change and during low novelty
comfort rises in stable safe regions and falls after drag/display loss
recentAttention rises from hover/click/drag and decays quickly
```

All values are clamped to `[0, 1]`.

## Mood derivation

Mood is a compact bias chosen from drives and recent outcomes. It is never a direct emotional claim shown as fact.

Example precedence:

1. low energy → sleepy;
2. high interruption load or click saturation → saturated;
3. high focus + quiet context → focused;
4. high playfulness + energy → playful;
5. high curiosity → curious;
6. high recent attention + sociability → socially warm;
7. otherwise → content.

`subdued` is rare and may support an existing expression asset only when contextually appropriate. It is never used to punish absence or solicit care.

## Session memory

Store only current-session summaries:

- last 8–12 completed activities;
- category timestamps;
- recent interruption outcomes;
- last region visits;
- recent social intensity;
- wake and sleep timestamps;
- recent context bands, reduced to content-blind categories.

Do not store raw event streams indefinitely. Use bounded queues and decaying summaries.

## Repetition controls

- same activity immediate repeat: forbidden unless continuing an interrupted session;
- high-salience activity: hard cooldown;
- category repetition: soft penalty;
- same destination region: penalty;
- repeated reaction to same trigger: refractory period;
- ambient micro-idles: irregular eligibility window and skip probability;
- sleep: minimum wake duration after waking;
- laptop/reading during typing: weighted possibility, never deterministic mapping.

## Persistence policy

Persist:
- selected character;
- user settings;
- optional safe position;
- optional crash-recovery neutral posture.

Do not persist:
- long-term mood profile;
- typing patterns;
- interaction history;
- activity preference inferred about the user;
- context samples;
- annoyance state across restarts.

## Mind update ownership

`MindController` receives domain events and coarse context summaries. It does not subscribe to raw OS input and does not choose animations. It updates immutable `PetMind` snapshots on:

- low-frequency mind ticks;
- activity completion;
- transition completion;
- social input;
- sleep/wake;
- drag/recovery;
- context-band change.

## Testability

Every update function is pure:

```ts
nextMind = updateMind(previousMind, event, elapsedMs, profile);
```

Tests use fixed elapsed time and seeded planner randomness. No wall-clock access occurs inside mind-update functions.
