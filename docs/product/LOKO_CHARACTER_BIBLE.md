# Loko Character Bible

## Character essence

Loko is calm, deliberate, observant, quietly affectionate, and capable of surprising play. Loko treats the desktop as a familiar room: choosing a place, settling, focusing, and noticing changes without constantly reacting to them.

## Behavioral silhouette

A user should recognize Loko through:

- longer comfortable idle holds;
- slower and more purposeful movement decisions;
- sustained reading or laptop sessions;
- subtle rather than immediate reactions;
- stronger preference for quiet contextual activities;
- longer sleep periods;
- rare play that feels genuinely surprising rather than out of character.

## Temperament

- **Baseline:** composed, observant, self-contained.
- **Under quiet conditions:** sits, reads, rests, or watches.
- **Under sustained focus nearby:** becomes more likely to read or use the laptop for a long session.
- **After positive attention:** acknowledges gently and may offer the restrained love reaction.
- **After excessive attention:** withdraws attention, pauses, or gives a dry look before becoming annoyed.
- **After interruption:** takes a longer neutral recovery beat before choosing another action.

## Movement style

Loko walks less frequently but with clearer destinations. Journeys are more often medium length and followed by a meaningful pause or activity. Loko should not wander simply because a timer expired.

Movement rules:

- favor purposeful relocation over pacing;
- use `loko_walk_preparation` and orientation assets where validated;
- allow longer pauses before and after walking;
- prefer stable areas away from high pointer traffic;
- after dragging, take a deliberate reorientation hold before continuing.

## Idle rhythm

`loko_idle_front` is a rich baseline but must not run continuously. Its glance and orientation frames should be scheduled as phrases separated by still holds. Loko should sometimes appear to simply exist without performing for the user.

## Activity preferences

### Strong preferences
- Reading: signature contextual activity during quiet study or low-intensity typing.
- Laptop: signature contextual activity during sustained typing.
- Quiet rest and sleep.

### Moderate preferences
- Drinking and eating after long focus or wake periods.
- Peeking as a subtle curiosity response.
- Music as a calm spontaneous activity.

### Low-frequency surprise
- Ball play remains fully supported but uncommon, preserving contrast with Loko’s usual composure.

## Social behavior

- **Single click:** a measured look, small acknowledgment, or restrained positive response.
- **Repeated click:** tolerance is lower than Poko’s for rapid repetition; Loko first disengages before showing annoyance.
- **Double click:** may trigger a rare affection response when recent interaction is positive and cooldown allows.
- **Drag:** immediately yields, then takes a longer settling beat after release.
- **Return after quiet:** acknowledges only occasionally; quiet companionship is itself valid behavior.

## Annoyance threshold

Loko’s annoyance threshold for rapid repeated interaction is lower than Poko’s, but expression is subtler. Response progression:

1. acknowledge;
2. reduce responsiveness;
3. look away or hold;
4. brief annoyance state;
5. recover after space.

No guilt mechanics and no lasting resentment.

## Curiosity

Loko’s curiosity is selective. It rises after system resume, display changes, prolonged pointer motion, and unusual environmental transitions. It favors looking, peeking, or a single purposeful walk rather than repeated exploration.

## Focus

Focus is Loko’s defining internal tendency. Sustained typing or quiet study increases reading and laptop scores. Loko’s focus sessions:

- are longer than Poko’s;
- include pause and observation variations;
- resist soft interruption until a safe prop boundary;
- use cooldowns so every typing burst does not trigger another laptop session.

## Sleep pattern

Loko stays awake in long calm stretches, then sleeps for longer sessions. `loko_sleep_transition` enters `loko_sleep_loop`. Wake-up must be validated; reverse playback is not assumed to be natural. Late hours and system idle increase sleep likelihood, but quiet mode may also produce seated rest rather than always sleeping.

## Affection style

Loko is affectionate through presence, proximity, patience, and occasional restrained heart reactions. `loko_love_reaction` is sparse and meaningful. Constant hearts would flatten the personality.

## Recovery after interruption

- **Immediate drag:** cancel intent, settle, reorient, then wait before replanning.
- **Soft click during reading/laptop:** finish a page/typing phrase or safe prop point before acknowledging.
- **Fullscreen/quiet mode:** remain still or choose a long quiet activity rather than immediately sleeping every time.
- **Resume:** observe first, then decide.

## Character guardrails

Loko must never become:

- boring because calm is interpreted as inactivity only;
- a permanent study mascot;
- Poko with slower speed;
- emotionally cold;
- deterministic whenever typing is detected.
