# PokoLoko — Behavior Scoring

## Pipeline

The planner never rolls directly from all activities. It applies six layers in order:

1. **Physical validity**
2. **Context eligibility**
3. **Personality preference**
4. **Internal-drive compatibility**
5. **Memory/cooldown shaping**
6. **Seeded chance**

Any action failing layer 1 is removed before scoring.

## Candidate definition

```ts
type ActionCandidate = {
  intention: PetIntention;
  baseWeight: number;
  requiredPostures: Posture[];
  contextRules: ContextRule[];
  driveWeights: Partial<Record<DriveName, number>>;
  cooldownId?: string;
  salience: "ambient" | "normal" | "high";
};
```

## Score

A practical bounded model:

```text
score =
  baseWeight
  × personalityMultiplier
  × contextMultiplier
  × driveMultiplier
  × locationMultiplier
  × recencyMultiplier
  × activityLevelMultiplier
  + narrativeBonus
  + seededJitter
```

Illegal or cooling-down actions receive no score.

## Context examples

- sustained typing raises laptop/reading/focused-idle probability;
- audio-active raises music probability;
- system idle lowers social behavior and may raise rest/sleep;
- busy pointer activity lowers long focus actions;
- fullscreen/quiet suppresses locomotion, audio, and high-salience play;
- resume raises curiosity/looking without forcing a specific activity;
- late night increases sleep weighting gradually.

A context signal changes likelihood, never guarantees behavior.

## Personality examples

### Poko
- stronger novelty bonus;
- higher play/music/ball weights;
- shorter activity duration distributions;
- more frequent movement;
- stronger positive social response;
- lower penalty for interrupted play.

### Loko
- stronger reading/laptop/focus weights;
- longer stable-state bonus;
- lower locomotion frequency;
- stronger rapid-click saturation;
- longer recovery and sleep duration.

## Weighted sampling

Do not always take max score. Use temperature-controlled weighted sampling among plausible candidates:

```ts
probability_i = exp(score_i / temperature) / Σ exp(score_j / temperature)
```

Scores may be transformed before this step to prevent a single huge multiplier. Tests may use simpler normalized weights as long as deterministic behavior is preserved.

## Seeded randomness

```ts
interface RandomSource {
  nextFloat(): number; // [0,1)
  nextInt(maxExclusive: number): number;
}
```

Production seed:
- cryptographically reasonable session seed generated locally;
- not tied to user identity or behavior history.

Test seed:
- fixed explicit integer;
- logged with scenario;
- produces repeatable candidate selection and durations.

No function inside the planner calls `Math.random()` directly.

## Planning cadence

Planning occurs:
- on stable-state entry;
- when a stable-state deadline expires;
- after meaningful context change with debounce;
- after activity completion;
- after safe recovery;
- after selected user interactions.

It does not run every animation or locomotion frame.

## Cooldowns

- hard cooldown: candidate removed;
- soft cooldown: multiplier reduced;
- category cooldown: prevents repeated high-salience category;
- contextual refractory period: prevents typing from repeatedly launching laptop;
- social saturation: repeated clicks shift from warm reaction to restrained/annoyed or ignored response.

## Explainability

Diagnostics record top candidates:

```text
laptop 0.42 — typing sustained, Loko focus high, no recent laptop
read    0.29 — quiet context, focus high, reading soft cooldown
idle    0.21 — comfort high
walk    0.08 — recent walk penalty
```

This log contains no typed content.

## Failure behavior

If all candidates are invalid or zero-weight:
1. remain in or route to safe neutral idle;
2. choose a bounded irregular idle duration;
3. log `NO_VALID_BEHAVIOR_CANDIDATE`;
4. do not crash or force a random activity.
