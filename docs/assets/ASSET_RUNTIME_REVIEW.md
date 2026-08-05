# PokoLoko Step 01 — Asset Runtime Review

## Status

**PASS WITH DOCUMENTED CONSTRAINTS.** All 31 authoritative normalized animations were reviewed from their manifests, preview strips/alignment previews, and relevant frame PNGs. All 218 isolated poses were reconciled against the semantic registry and grouped below. The 14 automated manual-review flags were inspected directly and judged to be intentional pose/prop motion rather than extraction or scale failures.

## Source truth

- Package: `Poko_Loko_Asset_Pack_v1`
- Shared canvas: **128 × 128 px**
- Authoritative animations: **31**
- Runtime PNG animation frames: **223**
- Isolated poses: **218**
- Indexed source candidates: **406**
- Rejected source candidates: **0**
- Mirrored runtime animations: **2 source-derived directional families, represented as left/right derivatives**

The archival package remains unchanged. These documents are interpretation and runtime-policy layers only.

## Global findings

1. The package is technically sound: alpha, dimensions, clipping, path integrity, and JSON validity passed the source QA.
2. The visual vocabulary is activity-rich but posture-bridge-poor. It contains strong laptop, reading, music, food, drink, ball, peeking, sleep, idle, and emotional material, but few dedicated stand↔sit, front↔side, prop pickup/put-down, or wake animations.
3. Activities must therefore be choreographed as multi-stage experiences using compatible holds and neutral routing. They must not be dropped into the renderer as endlessly looping GIF equivalents.
4. Poko has the stronger playful/emotional vocabulary. Loko has the stronger calm/focus vocabulary. Both still have enough crossover assets to avoid caricature.
5. Isolated poses are not dead leftovers. Many are useful as micro-idles, setup/exit keys, reaction variants, or future manually curated bridges, but they are not automatically safe animation sequences.
6. The walking cycles are usable only when paired with actual locomotion and tested for foot sliding in the animation laboratory.
7. No asset should be resized per frame. The package's 128×128 placement and anchor metadata are authoritative.

## Complete authoritative animation inventory

| Animation | Character | Category | Life role | Visible action | Frames | FPS | Playback | Direction | Start posture | End posture | Prop/effect | Confidence | Decision | Interruption |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| loko_drink_02 | loko | activities | CONTEXTUAL | Loko drinks while holding a leafy/green container or mug. | 7 | 6 | forward / loop=True | none | seated_front_with_drink | seated_front_with_drink | green_drink_container | high | USE | deferred_until_prop_down |
| loko_eat | loko | activities | CONTEXTUAL | Loko eats food, reacts, then drinks from a blue container. | 9 | 6 | forward / loop=True | none | seated_front_with_food | seated_front_with_drink | food_and_blue_container | high | USE_WITH_RULE | deferred_until_prop_safe |
| loko_laptop | loko | activities | CONTEXTUAL | Loko works at a dark laptop with typing, looking, and pause variations. | 12 | 4 | forward / loop=True | none | seated_front_with_laptop | seated_front_with_laptop | laptop | medium | USE_WITH_RULE | deferred_until_laptop_close |
| loko_music | loko | activities | SPONTANEOUS | Loko listens or bobs to music with note effects and a glowing orb-like prop at the end. | 11 | 8 | forward / loop=True | none | standing_front | standing_front_with_orb | music_notes_and_orb | high | USE_WITH_RULE | soft_at_phrase_boundary |
| loko_peeking_01 | loko | activities | CONTEXTUAL | Loko performs a low floor/edge peek with eyes closed/open and a small rise. | 3 | 6 | forward / loop=False | none | low_hidden | low_visible | edge_or_floor_line | high | USE | deferred_until_safe_frame |
| loko_peeking_02 | loko | activities | CONTEXTUAL | Loko peeks over a horizontal ledge, gradually lowering or withdrawing. | 5 | 6 | forward / loop=False | none | edge_visible | edge_low | ledge | high | USE | deferred_until_safe_frame |
| loko_playing_ball_01 | loko | activities | SPONTANEOUS | Loko rolls, nudges, and circles an orange ball with measured side poses. | 7 | 8 | forward / loop=False | none | standing_side_near_ball | standing_side_near_ball | orange_ball | high | USE | deferred_except_drag |
| loko_reading_01 | loko | activities | CONTEXTUAL | Loko reads a green book with small attentive page/pose variations. | 5 | 4 | forward / loop=True | none | seated_front_with_book | seated_front_with_book | green_book | high | USE | deferred_until_book_close |
| loko_love_reaction | loko | emotions | SOCIAL | Loko blushes/leans through affectionate poses with hearts, then returns toward neutral. | 8 | 6 | forward / loop=False | none | standing_front | standing_front | hearts | medium | USE_WITH_RULE | soft_except_drag |
| loko_idle_front | loko | idle | AMBIENT | Front idle sequence with glances, eye changes, side turns, and return. | 8 | 3 | forward / loop=True | none | standing_front | standing_front | none | high | USE | safe_any_frame |
| loko_locomotion_side_01 | loko | locomotion | TRANSITION | Three mostly front/three-quarter locomotion preparation or orientation poses. | 3 | 8 | forward / loop=True | right | standing_front | standing_three_quarter | none | medium | USE_WITH_RULE | safe |
| loko_locomotion_side_02 | loko | locomotion | FOUNDATIONAL | Seven-frame side-facing Loko walk cycle with rounded deliberate steps. | 7 | 8 | forward / loop=True | right | standing_side | standing_side | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| loko_walk_left | loko | locomotion | FOUNDATIONAL | Mirrored left-facing derivative of Loko seven-frame side walk. | 7 | 8 | forward / loop=True | left | standing_side_left | standing_side_left | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| loko_walk_preparation | loko | locomotion | TRANSITION | Three front-facing frames suggesting readiness/weight shift before movement. | 3 | 8 | forward / loop=True | neutral_transition | standing_front | standing_front_ready | none | medium | USE_WITH_RULE | safe |
| loko_walk_right | loko | locomotion | FOUNDATIONAL | Right-facing Loko seven-frame side walk. | 7 | 8 | forward / loop=True | right | standing_side_right | standing_side_right | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| loko_sleep_loop | loko | sleeping | FOUNDATIONAL | Loko lies asleep with changing Z symbols and subtle body states. | 3 | 3 | forward / loop=True | none | lying_sleep | lying_sleep | sleep_symbols | high | USE | soft_interrupt_to_wake |
| loko_sleep_transition | loko | sleeping | TRANSITION | Loko lowers from upright/drowsy posture into a compact lying sleep pose. | 6 | 6 | forward / loop=False | none | standing_or_low_front | lying_sleep | sleep_symbols_mid | high | USE | locked_except_drag_shutdown |
| poko_drink | poko | activities | CONTEXTUAL | Poko handles and drinks from a blue cup/bottle-like prop. | 8 | 6 | forward / loop=True | none | seated_or_low_front | seated_or_low_front | drink_container | high | USE | deferred_until_prop_down |
| poko_eat | poko | activities | CONTEXTUAL | Poko eats through several food/utensil states and ends with drink/container frames. | 11 | 6 | forward / loop=True | none | seated_front_with_food | seated_front_with_container | food_and_container | medium | USE_WITH_RULE | deferred_until_prop_safe |
| poko_music | poko | activities | SPONTANEOUS | Poko listens/dances through musical-note expressions and rhythmic poses. | 12 | 8 | forward / loop=True | none | standing_front | standing_front | music_notes | high | USE | soft_interrupt_at_phrase_boundary |
| poko_peeking | poko | activities | CONTEXTUAL | Poko rises from below/behind an edge, peeks, then becomes more animated above the ledge. | 12 | 6 | forward / loop=False | none | edge_hidden | edge_visible_excited | ledge | medium | USE_WITH_RULE | deferred_until_safe_frame |
| poko_playing_ball | poko | activities | SPONTANEOUS | Poko approaches, pushes, hugs, rolls around, and celebrates with a blue ball. | 11 | 8 | forward / loop=False | none | standing_side_near_ball | low_side_near_ball | blue_ball_and_hearts | high | USE_WITH_RULE | deferred_except_drag |
| poko_sad_to_crying | poko | emotions | SOCIAL | Poko shifts from subdued/sad expression into visible crying and settles. | 8 | 6 | forward / loop=False | none | standing_front_sad | standing_front_crying | tears | high | USE_WITH_CONTEXT | soft_except_drag |
| poko_idle_blink | poko | idle | AMBIENT | Eyes close and reopen while remaining front-facing. | 2 | 6 | forward / loop=True | none | standing_front | standing_front | none | high | USE | safe_any_frame |
| poko_idle_look_01 | poko | idle | AMBIENT | Front-facing glance/attention shift between two neutral poses. | 2 | 4 | forward / loop=True | none | standing_front | standing_front | none | high | USE | safe_any_frame |
| poko_locomotion_side | poko | locomotion | FOUNDATIONAL | Nine-frame side-facing stepping/walking cycle. | 9 | 8 | forward / loop=True | right | standing_side | standing_side | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| poko_walk_left | poko | locomotion | FOUNDATIONAL | Mirrored left-facing derivative of Poko side locomotion. | 9 | 8 | forward / loop=True | left | standing_side_left | standing_side_left | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| poko_walk_right | poko | locomotion | FOUNDATIONAL | Right-facing Poko side locomotion runtime derivative. | 9 | 8 | forward / loop=True | right | standing_side_right | standing_side_right | none | medium | USE_WITH_RULE | safe_at_foot_contact |
| poko_sleep_loop_01 | poko | sleeping | FOUNDATIONAL | Lying sleep sequence with changing Z symbols and body settling. | 7 | 3 | ping_pong / loop=True | none | lying_sleep | lying_sleep | sleep_symbols | high | USE_WITH_RULE | soft_interrupt_to_wake |
| poko_sleep_loop_02 | poko | sleeping | FOUNDATIONAL | Lying sleep breathing/rest variation without large symbols. | 4 | 3 | forward / loop=True | none | lying_sleep | lying_sleep | none | high | USE | soft_interrupt_to_wake |
| poko_sleep_transition | poko | sleeping | TRANSITION | Front upright posture gradually droops and lowers into a lying sleeping pose. | 8 | 6 | forward / loop=False | none | standing_front | lying_sleep | sleep_symbols_late | high | USE | locked_except_drag_shutdown |

## Life-role coverage

- **Foundational:** idle micro-life, directional locomotion, sleep entry/loops.
- **Contextual:** laptop, reading, drink, food, edge peeking.
- **Spontaneous:** music and ball play.
- **Social:** Poko sadness/crying and Loko love reaction, with strict contextual triggers.
- **Ambient:** blinks, glances, calm front-idle variations.
- **Transitions:** sleep entries and Loko locomotion anticipation/orientation.

Both characters meet the required vocabulary breadth. The gap is not missing personality content; the gap is missing connective tissue between postures and props.

## Runtime policy

- A manifest `loop: true` does not automatically mean “play forever.” Activity sequences are bounded phrases.
- Ping-pong is allowed only where motion remains semantically reversible.
- Props must enter before or with the first frame and leave only at a documented safe frame.
- Dragging may immediately interrupt, but the activity controller must cancel props and recover posture deterministically.
- Click reactions should wait for short locked transition spans to finish unless the user drags.
- Sleep and lying states must route through wake/recovery before walking or standing activities.

## Acceptance-criteria result

- 31/31 animations inspected: **PASS**
- 218/218 isolated poses catalogued/grouped: **PASS**
- 14/14 QA review flags decided: **PASS**
- Activity entry/exit/prop/interruption documented: **PASS**
- Loop seam handling documented: **PASS**
- Poko and Loko foundational/contextual/spontaneous/social/ambient vocabularies: **PASS**

Step 02 may begin only from this locked interpretation set; later visual testing inside the redesigned desktop animation laboratory may demote an asset, but must record the reason.
