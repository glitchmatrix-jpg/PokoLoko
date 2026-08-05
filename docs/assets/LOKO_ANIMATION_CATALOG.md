# Loko Animation Catalog

Loko’s vocabulary is calm, focused, and quietly affectionate. It supports reading, laptop work, measured ball play, music, peeking, food/drink, sleep, and a restrained love reaction.

| Animation | Role | Visible action | Frames | FPS | Start | End | Prop/effect | Interruption | Decision | Human review |
|---|---|---|---|---|---|---|---|---|---|---|
| loko_drink_02 | CONTEXTUAL | Loko drinks while holding a leafy/green container or mug. | 7 | 6 | seated_front_with_drink | seated_front_with_drink | green_drink_container | deferred_until_prop_down | USE | Stable and readable. |
| loko_eat | CONTEXTUAL | Loko eats food, reacts, then drinks from a blue container. | 9 | 6 | seated_front_with_food | seated_front_with_drink | food_and_blue_container | deferred_until_prop_safe | USE_WITH_RULE | Split food and drink phases in runtime choreography. |
| loko_laptop | CONTEXTUAL | Loko works at a dark laptop with typing, looking, and pause variations. | 12 | 4 | seated_front_with_laptop | seated_front_with_laptop | laptop | deferred_until_laptop_close | USE_WITH_RULE | One abrupt adjacent pair is plausible as a posture/attention change but must be split into setup, work loop, and exit in the animation lab. |
| loko_music | SPONTANEOUS | Loko listens or bobs to music with note effects and a glowing orb-like prop at the end. | 11 | 8 | standing_front | standing_front_with_orb | music_notes_and_orb | soft_at_phrase_boundary | USE_WITH_RULE | Quieter than Poko music; prop continuity at the final frames must be explicit. |
| loko_peeking_01 | CONTEXTUAL | Loko performs a low floor/edge peek with eyes closed/open and a small rise. | 3 | 6 | low_hidden | low_visible | edge_or_floor_line | deferred_until_safe_frame | USE | Good subtle curiosity action. |
| loko_peeking_02 | CONTEXTUAL | Loko peeks over a horizontal ledge, gradually lowering or withdrawing. | 5 | 6 | edge_visible | edge_low | ledge | deferred_until_safe_frame | USE | Can pair with peeking_01 as alternate edge choreography after lab validation. |
| loko_playing_ball_01 | SPONTANEOUS | Loko rolls, nudges, and circles an orange ball with measured side poses. | 7 | 8 | standing_side_near_ball | standing_side_near_ball | orange_ball | deferred_except_drag | USE | Useful surprise activity that keeps Loko from feeling one-note. |
| loko_reading_01 | CONTEXTUAL | Loko reads a green book with small attentive page/pose variations. | 5 | 4 | seated_front_with_book | seated_front_with_book | green_book | deferred_until_book_close | USE | Core personality activity; excellent response to sustained low-intensity typing/reading context. |
| loko_love_reaction | SOCIAL | Loko blushes/leans through affectionate poses with hearts, then returns toward neutral. | 8 | 6 | standing_front | standing_front | hearts | soft_except_drag | USE_WITH_RULE | At least one adjacent jump is expressive squash/lean. Trigger sparingly after positive interaction, never continuously. |
| loko_idle_front | AMBIENT | Front idle sequence with glances, eye changes, side turns, and return. | 8 | 3 | standing_front | standing_front | none | safe_any_frame | USE | Strong calm baseline; do not play continuously or it becomes robotic. |
| loko_locomotion_side_01 | TRANSITION | Three mostly front/three-quarter locomotion preparation or orientation poses. | 3 | 8 | standing_front | standing_three_quarter | none | safe | USE_WITH_RULE | Use as orientation bridge only after transition-lab validation; not a complete walk cycle. |
| loko_locomotion_side_02 | FOUNDATIONAL | Seven-frame side-facing Loko walk cycle with rounded deliberate steps. | 7 | 8 | standing_side | standing_side | none | safe_at_foot_contact | USE_WITH_RULE | Primary Loko locomotion; slower cadence than Poko. |
| loko_walk_left | FOUNDATIONAL | Mirrored left-facing derivative of Loko seven-frame side walk. | 7 | 8 | standing_side_left | standing_side_left | none | safe_at_foot_contact | USE_WITH_RULE | Mirroring is safe; no asymmetric semantic prop. |
| loko_walk_preparation | TRANSITION | Three front-facing frames suggesting readiness/weight shift before movement. | 3 | 8 | standing_front | standing_front_ready | none | safe | USE_WITH_RULE | Not a directional turn by itself; use as anticipation before side transition if visually compatible. |
| loko_walk_right | FOUNDATIONAL | Right-facing Loko seven-frame side walk. | 7 | 8 | standing_side_right | standing_side_right | none | safe_at_foot_contact | USE_WITH_RULE | Requires physical X movement. |
| loko_sleep_loop | FOUNDATIONAL | Loko lies asleep with changing Z symbols and subtle body states. | 3 | 3 | lying_sleep | lying_sleep | sleep_symbols | soft_interrupt_to_wake | USE | Good calm sleep identity. |
| loko_sleep_transition | TRANSITION | Loko lowers from upright/drowsy posture into a compact lying sleep pose. | 6 | 6 | standing_or_low_front | lying_sleep | sleep_symbols_mid | locked_except_drag_shutdown | USE | Reverse playback may not read as a natural wake; validate in transition lab. |

## Character-specific runtime notes

- Prefer longer calm holds and deliberate transitions.
- Reading and laptop work are identity-defining contextual activities.
- Ball play should remain less frequent so it reads as a genuine surprise.
- Love reaction is subtle social warmth, not constant heart spam.
