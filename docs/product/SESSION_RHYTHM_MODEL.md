# Session Rhythm Model

## Purpose

The session model creates continuity and prevents obvious repetition without permanent psychological profiling. It is an ephemeral memory of the current shared desktop session.

## Hidden internal mind

Values are normalized tendencies, not visible meters.

| Drive | Meaning | Typical increases | Typical decreases |
|---|---|---|---|
| Energy | Capacity for movement and play | sleep, calm rest | walking, play, long wake time |
| Playfulness | Attraction to expressive spontaneous actions | boredom, positive attention, Poko baseline | focus context, recent play, low energy |
| Focus | Attraction to reading/laptop/quiet action | sustained typing, quiet study, Loko baseline | rapid pointer activity, play, interruption |
| Sociability | Attraction to direct interaction and proximity | positive recent attention, session greeting | saturation, repeated clicks, quiet mode |
| Curiosity | Attraction to looking, walking, peeking | resume, environmental change, varied activity | recent exploration, sleepiness |
| Comfort | Stability in current location/posture | calm holds, safe area, successful settlement | drag, display change, busy pointer region |
| Boredom | Pressure against repeating stillness | long unvaried stable state | any meaningful new activity |
| Recent attention | Short-lived social intensity | click, hover dwell, drag | time decay |
| Mood | A compact state bias, not a claim of sentience | recent outcomes and drives | gradual return to baseline |
| Recent activities | Repetition and narrative memory | every completed action | time and queue decay |

## Mood vocabulary

Mood remains small and functional:

- content;
- curious;
- playful;
- focused;
- sleepy;
- socially warm;
- saturated/annoyed;
- subdued, used rarely and never as guilt.

Mood changes action weights and presentation; it never overrides physical legality.

## Session memory

Track in memory:

- last 8–12 completed activities;
- last stable and transition states;
- last activity by category;
- recent click and drag intensity;
- wake duration;
- time since sleep;
- time since play, focus activity, food/drink, and social reaction;
- recent screen regions visited;
- recent interruption outcomes;
- current preferred resting region;
- last contextual signals as decaying summaries.

Do not store content, key identities, window titles, or permanent personality scores.

## Action scoring

A legal action receives a score from:

- base character preference;
- current drives;
- context modifiers;
- posture and location suitability;
- recency penalty;
- cooldown eligibility;
- session narrative bonus;
- user activity-level setting;
- small random variation.

The planner chooses among plausible actions rather than always selecting the maximum. Highly implausible or illegal actions are excluded before scoring.

## Repetition controls

- hard cooldown after high-salience activities;
- soft recency penalty for category repetition;
- no immediate repeat of the same activity unless it is an intentional continuation;
- no repeated cross-screen pacing without an environmental reason;
- contextual triggers receive refractory periods;
- ambient actions use irregular windows and may be skipped entirely.

## Rhythm arcs

A good session contains arcs rather than isolated rolls:

### Poko example
Wake → look → short walk → idle near user activity → brief laptop imitation → wander → ball play → drink → quiet sleep.

### Loko example
Observe → purposeful walk → long reading session → stillness → drink → subtle social response → rest → longer sleep.

These are examples, never scripts.

## Character profile biases

### Poko

- higher playfulness and curiosity baseline;
- faster recent-attention response;
- shorter focus and sleep sessions;
- stronger novelty bonus;
- shorter recovery after interruption.

### Loko

- higher focus and comfort baseline;
- longer stable-state preference;
- stronger penalty for rapid repeated attention;
- longer activity and sleep sessions;
- longer recovery hold after interruption.

## Persistence boundary

Across restarts, persist user settings and selected character only. A brief crash-recovery snapshot may persist current safe state and position, but internal mood history should reset or decay substantially. PokoLoko must not build a long-term behavioral profile of the user.
