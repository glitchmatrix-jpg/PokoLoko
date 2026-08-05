# PokoLoko — Activity Lifecycle

## Activity definition

```ts
type ActivityDefinition = {
  id: string;
  character: CharacterId | "both";
  category: "contextual" | "spontaneous" | "social" | "ambient";
  triggerRules: ContextRule[];
  legalEntryPostures: Posture[];
  entryChoreographyId: string;
  setupChoreographyId?: string;
  loopAnimationIds: string[];
  variationAnimationIds?: string[];
  duration: DurationPolicy;
  interruption: InterruptionPolicy;
  exitChoreographyId: string;
  safeExitMarkers: string[];
  cooldown: CooldownPolicy;
  moodEffects: MindEffect[];
  prop: PropLifecycle;
  targetExitPosture: Posture;
};
```

## Phases

### 1. Trigger
Planner proposes activity because it is legal and scored plausibly.

### 2. Entry
Transition coordinator routes current posture/direction to activity-compatible posture. Missing bridges use documented neutral holds or curated isolated poses only.

### 3. Setup
Prop appears or activity staging occurs. Composite-frame prop ownership is recorded.

### 4. Loop
Main activity phrase plays for a bounded duration or loop count. Manifest `loop: true` does not mean infinite runtime.

### 5. Variation
Optional micro-variation interrupts repetition while preserving posture and prop.

### 6. Interruption
Immediate, soft, deferred, or locked policy is applied. The session records a recovery target.

### 7. Exit
Prop disappears at a safe marker, then posture routes to a valid neutral state.

### 8. Cooldown
Activity and category cooldowns begin; mind/session memory update.

## Example: Loko laptop

```text
standing_front
→ neutral hold / sitting bridge
→ seated_front_with_laptop
→ setup marker: laptop present
→ laptop loop
→ optional attentive pause
→ safe close/neutral marker
→ seated neutral
→ remain seated or stand
```

Typing activity raises eligibility but never forces entry. Repeated context samples cannot restart the activity during cooldown.

## Example: Poko ball play

```text
standing/side idle
→ orient toward play space
→ ball appears at activity start
→ one-shot multi-phrase ball sequence
→ celebration/low side pose
→ prop-safe recovery
→ side idle or standing front
```

Drag is immediate and discards continuation. Ordinary click waits for a safe phrase boundary.

## Prop lifecycle

```ts
type PropLifecycle = {
  propId?: string;
  ownership: "none" | "composite_frame" | "separate_layer";
  appearsAtMarker?: string;
  stableDuring: ActivitySession["phase"][];
  disappearsAtMarker?: string;
  immediateInterruptionRecoveryFrame?: string;
};
```

The current asset pack mainly uses composite frames, so runtime cannot pretend props are separate objects.

## Duration policy

```ts
type DurationPolicy =
  | { kind: "one_shot" }
  | { kind: "loop_count"; min: number; max: number }
  | { kind: "time_range"; minMs: number; maxMs: number; exitAtSafeMarker: true };
```

Duration sampling uses the session random source.

## Missing bridges

Allowed strategies:
- short hold;
- neutral pose routing;
- direction-neutral frame;
- curated isolated bridge pose;
- runtime delay at a compatible frame.

Not allowed:
- incompatible posture jump;
- per-frame scaling;
- arbitrary crossfade that hides prop/posture mismatch;
- fabricated frames;
- silent unsupported path.

## Activity recovery

On immediate interruption:
1. invalidate activity generation;
2. stop locomotion/audio;
3. clear scheduled variation/deadline;
4. select prop-safe recovery;
5. settle to compatible posture;
6. update memory as interrupted;
7. prevent immediate reselection.

## Required activity metadata

Every activity must document:
- entry and exit posture;
- prop appearance/disappearance;
- loop seam;
- safe interruption markers;
- fallback recovery;
- cooldown;
- context and personality suitability;
- source asset confidence.
