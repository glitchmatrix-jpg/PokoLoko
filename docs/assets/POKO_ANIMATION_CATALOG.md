# Poko Animation Catalog

Poko’s vocabulary is expressive, playful, and visibly emotional. It supports fast curiosity, music, ball play, peeking, food/drink, sleep, and a contextual crying reaction.

| Animation | Role | Visible action | Frames | FPS | Start | End | Prop/effect | Interruption | Decision | Human review |
|---|---|---|---|---|---|---|---|---|---|---|
| poko_drink | CONTEXTUAL | Poko handles and drinks from a blue cup/bottle-like prop. | 8 | 6 | seated_or_low_front | seated_or_low_front | drink_container | deferred_until_prop_down | USE | Needs entry/exit via compatible low posture or a short prop setup hold. |
| poko_eat | CONTEXTUAL | Poko eats through several food/utensil states and ends with drink/container frames. | 11 | 6 | seated_front_with_food | seated_front_with_container | food_and_container | deferred_until_prop_safe | USE_WITH_RULE | Medium confidence because multiple food moments are concatenated. Break into sub-actions at runtime only after frame-level lab review. |
| poko_music | SPONTANEOUS | Poko listens/dances through musical-note expressions and rhythmic poses. | 12 | 8 | standing_front | standing_front | music_notes | soft_interrupt_at_phrase_boundary | USE | Excellent personality-defining activity. |
| poko_peeking | CONTEXTUAL | Poko rises from below/behind an edge, peeks, then becomes more animated above the ledge. | 12 | 6 | edge_hidden | edge_visible_excited | ledge | deferred_until_safe_frame | USE_WITH_RULE | Frames 4→5 intentionally change body width/centroid as Poko climbs onto the ledge. Treat as physical repositioning, not scale jitter. Requires a real screen-edge/ledge context. |
| poko_playing_ball | SPONTANEOUS | Poko approaches, pushes, hugs, rolls around, and celebrates with a blue ball. | 11 | 8 | standing_side_near_ball | low_side_near_ball | blue_ball_and_hearts | deferred_except_drag | USE_WITH_RULE | All 12? QA metrics are intentional pose/ball interactions: crouching, leaning, rolling, lying, and celebration. Preserve sequence; do not normalize body bounds further. Needs explicit setup and cleanup so the ball does not pop in/out. |
| poko_sad_to_crying | SOCIAL | Poko shifts from subdued/sad expression into visible crying and settles. | 8 | 6 | standing_front_sad | standing_front_crying | tears | soft_except_drag | USE_WITH_CONTEXT | Do not trigger randomly. Reserve for contextual annoyance/disappointment or rare narrative moments; never guilt the user. |
| poko_idle_blink | AMBIENT | Eyes close and reopen while remaining front-facing. | 2 | 6 | standing_front | standing_front | none | safe_any_frame | USE | Never run at a fixed metronomic interval. |
| poko_idle_look_01 | AMBIENT | Front-facing glance/attention shift between two neutral poses. | 2 | 4 | standing_front | standing_front | none | safe_any_frame | USE | Subtle and readable; should be scheduled as a micro-expression, not a permanent idle loop. |
| poko_locomotion_side | FOUNDATIONAL | Nine-frame side-facing stepping/walking cycle. | 9 | 8 | standing_side | standing_side | none | safe_at_foot_contact | USE_WITH_RULE | Original right-facing source; mirrored left derivative exists. Must be tested for foot sliding and cadence. |
| poko_walk_left | FOUNDATIONAL | Mirrored left-facing derivative of Poko side locomotion. | 9 | 8 | standing_side_left | standing_side_left | none | safe_at_foot_contact | USE_WITH_RULE | Mirroring is visually safe because no directional prop/text exists. Anchor inversion metadata must be honored. |
| poko_walk_right | FOUNDATIONAL | Right-facing Poko side locomotion runtime derivative. | 9 | 8 | standing_side_right | standing_side_right | none | safe_at_foot_contact | USE_WITH_RULE | Use as physical locomotion only when X position changes. |
| poko_sleep_loop_01 | FOUNDATIONAL | Lying sleep sequence with changing Z symbols and body settling. | 7 | 3 | lying_sleep | lying_sleep | sleep_symbols | soft_interrupt_to_wake | USE_WITH_RULE | Use as an occasional expressive sleep variation, not the only sleep loop. |
| poko_sleep_loop_02 | FOUNDATIONAL | Lying sleep breathing/rest variation without large symbols. | 4 | 3 | lying_sleep | lying_sleep | none | soft_interrupt_to_wake | USE | Best primary quiet sleep loop. |
| poko_sleep_transition | TRANSITION | Front upright posture gradually droops and lowers into a lying sleeping pose. | 8 | 6 | standing_front | lying_sleep | sleep_symbols_late | locked_except_drag_shutdown | USE | Strong entry sequence; waking needs reverse playback validation or neutral recovery because no dedicated wake sequence exists. |

## Character-specific runtime notes

- Prefer shorter active bursts, more frequent micro-idles, and playful movement.
- Do not use crying as random decoration.
- Ball and music are identity-defining, not novelty extras.
- Peeking requires a real ledge/screen-edge choreography.
