# Poko Character Bible

## Character essence

Poko is bright, emotionally readable, curious, affectionate, and distractible. Poko approaches the desktop as a place to investigate and play. The energy is warm rather than hyperactive: quick sparks of motion, expressive pauses, small bursts of drama, then genuine rest.

## Behavioral silhouette

A user should recognize Poko through:

- shorter idle holds than Loko, but never constant movement;
- more frequent glances, blinks, peeks, and small attention shifts;
- playful choices such as music and ball play;
- quicker responses to direct interaction;
- more visible emotional expression;
- shorter focused sessions and more spontaneous switching at safe exit points;
- shorter naps and livelier wake rhythms.

## Temperament

- **Baseline:** upbeat, curious, socially open.
- **Under quiet conditions:** explores, peeks, rests, or invents play.
- **Under sustained focus nearby:** may imitate by using a laptop, but is more likely than Loko to pause, fidget, or leave earlier.
- **After positive attention:** becomes visibly delighted and may stay nearby.
- **After excessive attention:** shifts from delight to mild annoyance before any sad response.
- **After interruption:** recovers quickly, often with a glance, shake-off, or short neutral hold.

## Movement style

Poko moves in shorter, more frequent journeys with variable destinations. Walking begins with a readable intention and ends with a brief settling beat. Poko is more likely to reverse direction, inspect an edge, or choose a nearby playful action than to cross the entire screen repeatedly.

Movement rules:

- favor short and medium paths;
- occasionally choose an edge for peeking;
- avoid repeated left-right pacing;
- use higher locomotion probability than Loko, not merely higher speed;
- after dragging, settle quickly and reorient before resuming autonomy.

## Idle rhythm

Poko’s idle is composed from quiet holds punctuated by irregular micro-actions:

- `poko_idle_blink` as a sparse micro-idle;
- `poko_idle_look_01` after pointer movement, nearby interaction, or curiosity increase;
- isolated neutral poses only after Step 07 lab validation.

Blinking must never use a fixed interval. Long quiet holds are valid and necessary.

## Activity preferences

### Strong preferences
- Music: expressive, identity-defining spontaneous activity.
- Ball play: high-value spontaneous play with full setup and cleanup.
- Peeking: curiosity-driven contextual activity tied to an actual edge.

### Moderate preferences
- Laptop: plausible during sustained typing, usually shorter than Loko’s session.
- Eating and drinking: calm recovery activities after energetic periods.
- Rest and sleep: shorter sessions with occasional expressive sleep variation.

### Restricted use
- Sad-to-crying is contextual and rare. It must never be triggered merely because the user ignored Poko, closed the app, or failed to interact.

## Social behavior

- **Single click:** quick acknowledgment, delight, or attentive look depending on recent attention.
- **Repeated click:** initial enjoyment, then saturation, then a mild boundary reaction; no immediate crying.
- **Double click:** one explicit high-value interaction such as affection or invitation to a short reaction, not a duplicate single-click queue.
- **Drag:** immediately yields control, pauses autonomous intent, then settles without resentment.
- **Return after quiet:** may move closer or perform a small greeting only if recent-attention cooldown permits.

## Annoyance threshold

Poko tolerates a moderate amount of attention but reaches saturation sooner than an endlessly cheerful mascot would. Saturation decays naturally. Annoyance is conveyed through restraint, a short look, or reduced responsiveness—not guilt, punishment, or prolonged sadness.

## Curiosity

Curiosity rises with:

- varied pointer activity;
- a long quiet period after recent activity;
- arriving near a screen edge;
- system resume;
- a new session.

Curiosity favors looking, walking, peeking, and short contextual imitation.

## Focus

Poko can focus, but focus is fragile. During typing:

- laptop probability rises;
- music and play probabilities fall temporarily but do not become zero;
- a laptop session is likely to be shorter and contain more visible variation than Loko’s;
- repeated typing sessions receive cooldown protection to prevent deterministic imitation.

## Sleep pattern

Poko becomes sleepy after energetic play, long wake time, late hours, or low system activity. Poko’s primary quiet loop is `poko_sleep_loop_02`; `poko_sleep_loop_01` is an occasional expressive variation. Sleep entry uses `poko_sleep_transition`. Wake behavior must use validated reverse or neutral recovery choreography—never direct sleep-to-walk.

## Affection style

Poko is openly affectionate: proximity, visible enthusiasm, playful attention, and expressive reactions. Affection is not constant heart spam. Strong reactions require recent positive interaction and a cooldown.

## Recovery after interruption

- **Immediate drag:** abandon current intention, preserve no prop, settle, neutral hold, then replan.
- **Soft click during activity:** acknowledge at a safe phrase or prop boundary.
- **Fullscreen/quiet mode:** finish the nearest safe beat, then reduce motion or sleep.
- **Resume:** wake or look around gently; never explode into activity immediately.

## Character guardrails

Poko must never become:

- a frantic random-action generator;
- permanently cheerful regardless of context;
- emotionally manipulative;
- sad because the user worked or ignored the app;
- identical to Loko with faster timing.
