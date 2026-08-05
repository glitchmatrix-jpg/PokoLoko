# PokoLoko — Step 14 Change Report

## Completed

Step 14 adds a deterministic, character-specific behavior layer without giving it authority over animation frames, native windows, or legal state transitions.

Implemented:

- hidden `PetMind` drives and derived moods;
- pure mind updates from elapsed time and coarse events;
- separate Poko and Loko behavior profiles;
- layered action scoring;
- legal-activity input filtering;
- bounded session memory;
- hard and soft repetition controls;
- post-wake sleep protection;
- calm, balanced, and lively modifiers;
- pause and quiet-mode behavior;
- injected seeded randomness;
- ranked diagnostic explanations;
- variable duration ranges;
- dependency-free deterministic scenario validation;
- Vitest coverage for determinism, legality, quiet mode, wake protection, mind updates, and character distinction.

## Personality result

Under the same focused typing context, Poko's highest-scoring choices favor ball play, walking, and music, while Loko's highest-scoring choices favor reading and laptop use. The distinction comes from profile, drive, duration, novelty, and social-response data—not only movement speed.

## Boundaries

The planner proposes intentions only. It does not:

- select or advance sprite frames;
- mutate the legal state machine;
- move the Electron window;
- inspect typed text or private content;
- persist user behavior profiles;
- expose guilt-oriented meters.

## Native validation

Native Windows observation remains deferred to the GitHub Actions EXE after Step 27, as agreed. Step 14 itself is a pure deterministic engine package and has passed strict standalone TypeScript compilation plus executable scenario checks in this environment.
