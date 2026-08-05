# Isolated Pose Catalog

All **218** isolated poses are retained and accounted for here. Grouping is based on the package semantic classification, not on a new animation claim. IDs inside a group remain independent assets until the animation laboratory proves temporal continuity.

## Decision meanings

- `MICRO_POSE_LIBRARY`: useful for sparse blinks, looks, expression holds, or posture variants.
- `ACTIVITY_SETUP_OR_VARIANT`: may support an activity entry, exit, or variation after manual choreography.
- `CURATE_AS_CANDIDATE_KEYS`: appears temporally related but is not automatically promoted.
- `ISOLATED_ONLY`: retain for reference or direct one-frame reactions.

| Character | Category | Pose label | Tentative family | Continuity | Confidence | Count | Decision | Frame IDs |
|---|---|---|---|---|---|---|---|---|
| loko | ACTIVITIES | drinking | drink | plausible_sequence | high | 1 | CURATE_AS_CANDIDATE_KEYS | L-R09-C13 |
| loko | ACTIVITIES | holding_round_object | object_activity | uncertain_sequence | medium | 3 | ISOLATED_ONLY | L-R11-C13, L-R11-C14, L-R12-C01 |
| loko | ACTIVITIES | ledge_furniture_interaction | peeking_furniture | uncertain_sequence | medium | 19 | ISOLATED_ONLY | L-R15-C06, L-R15-C07, L-R15-C08, L-R15-C09, L-R15-C10, L-R15-C11, L-R15-C12, L-R15-C13, L-R15-C14, L-R16-C01, L-R16-C02, L-R16-C03, L-R16-C04, L-R16-C05, L-R16-C06, L-R16-C07, L-R16-C08, L-R16-C09, L-R16-C10 |
| loko | ACTIVITIES | playing_with_orange_ball | playing_ball | plausible_sequence | medium | 1 | CURATE_AS_CANDIDATE_KEYS | L-R14-C01 |
| loko | ACTIVITIES | reading | reading | plausible_sequence | high | 1 | CURATE_AS_CANDIDATE_KEYS | L-R11-C01 |
| loko | ACTIVITIES | reading_or_food | mixed_activity | uncertain_sequence | medium | 7 | ISOLATED_ONLY | L-R12-C14, L-R13-C01, L-R13-C02, L-R13-C03, L-R13-C04, L-R13-C05, L-R13-C06 |
| loko | EMOTIONS | annoyed_angry | annoyed_reaction | isolated_variants | medium | 8 | ISOLATED_ONLY | L-R06-C11, L-R06-C12, L-R06-C13, L-R07-C01, L-R07-C02, L-R07-C03, L-R07-C04, L-R07-C05 |
| loko | EMOTIONS | confused | confused_reaction | isolated_variants | high | 8 | ISOLATED_ONLY | L-R07-C06, L-R07-C07, L-R07-C08, L-R07-C09, L-R07-C10, L-R07-C11, L-R07-C12, L-R07-C13 |
| loko | EMOTIONS | surprised_excited | surprise_excited | uncertain_sequence | medium | 12 | ISOLATED_ONLY | L-R08-C01, L-R08-C02, L-R08-C03, L-R08-C04, L-R08-C05, L-R08-C06, L-R08-C07, L-R08-C08, L-R08-C09, L-R08-C10, L-R08-C11, L-R08-C12 |
| loko | EMOTIONS | tired_embarrassed | mixed_reactions | isolated_variants | medium | 4 | ISOLATED_ONLY | L-R08-C13, L-R09-C01, L-R09-C02, L-R09-C03 |
| loko | IDLE | front_idle_emotions | idle_emotions | isolated_variants | medium | 8 | MICRO_POSE_LIBRARY | L-R14-C02, L-R14-C03, L-R14-C04, L-R14-C05, L-R14-C06, L-R14-C07, L-R14-C08, L-R14-C09 |
| loko | IDLE | front_idle_variants | idle_front | isolated_variants | high | 5 | MICRO_POSE_LIBRARY | L-R16-C11, L-R16-C12, L-R17-C01, L-R17-C02, L-R17-C03 |
| loko | POSTURE_TRANSITIONS | lying_and_curling | sit_to_lie | uncertain_sequence | medium | 16 | ISOLATED_ONLY | L-R03-C08, L-R03-C09, L-R03-C10, L-R03-C11, L-R03-C12, L-R03-C13, L-R04-C01, L-R04-C02, L-R04-C03, L-R04-C04, L-R04-C05, L-R04-C06, L-R04-C07, L-R04-C08, L-R04-C09, L-R04-C10 |
| loko | POSTURE_TRANSITIONS | turn_lower_sit | stand_to_sit | uncertain_sequence | medium | 13 | ISOLATED_ONLY | L-R02-C08, L-R02-C09, L-R02-C10, L-R02-C11, L-R02-C12, L-R02-C13, L-R03-C01, L-R03-C02, L-R03-C03, L-R03-C04, L-R03-C05, L-R03-C06, L-R03-C07 |
| loko | POSTURE_TRANSITIONS | wake_or_rise | wake_up_or_lie_to_sit | uncertain_sequence | medium | 14 | ISOLATED_ONLY | L-R05-C01, L-R05-C02, L-R05-C03, L-R05-C04, L-R05-C05, L-R05-C06, L-R05-C07, L-R05-C08, L-R05-C09, L-R05-C10, L-R05-C11, L-R05-C12, L-R06-C01, L-R06-C02 |
| poko | ACTIVITIES | furniture_interaction | furniture_activity | uncertain_sequence | medium | 12 | ISOLATED_ONLY | P-R14-C13, P-R15-C01, P-R15-C02, P-R15-C03, P-R15-C04, P-R15-C05, P-R15-C06, P-R15-C07, P-R15-C08, P-R15-C09, P-R15-C10, P-R16-C01 |
| poko | ACTIVITIES | laptop_reading | laptop_and_reading | uncertain_sequence | high | 10 | ISOLATED_ONLY | P-R12-C01, P-R12-C02, P-R12-C03, P-R12-C04, P-R12-C05, P-R12-C06, P-R12-C07, P-R12-C08, P-R12-C09, P-R12-C10 |
| poko | EMOTIONS | confused | confused_reaction | isolated_variants | high | 8 | ISOLATED_ONLY | P-R07-C09, P-R07-C10, P-R07-C11, P-R07-C12, P-R07-C13, P-R08-C01, P-R08-C02, P-R08-C03 |
| poko | EMOTIONS | love_angry | love_and_angry | isolated_variants | high | 8 | ISOLATED_ONLY | P-R06-C06, P-R06-C07, P-R06-C08, P-R06-C09, P-R06-C10, P-R06-C11, P-R06-C12, P-R06-C13 |
| poko | EMOTIONS | surprised_excited | surprise_excited | uncertain_sequence | medium | 9 | ISOLATED_ONLY | P-R05-C10, P-R05-C11, P-R05-C12, P-R05-C13, P-R06-C01, P-R06-C02, P-R06-C03, P-R06-C04, P-R06-C05 |
| poko | EMOTIONS | surprised_proud_happy | positive_reactions | uncertain_sequence | medium | 8 | ISOLATED_ONLY | P-R08-C04, P-R08-C05, P-R08-C06, P-R08-C07, P-R08-C08, P-R08-C09, P-R08-C10, P-R08-C11 |
| poko | EMOTIONS | tired_embarrassed_happy | mixed_reactions | isolated_variants | medium | 8 | ISOLATED_ONLY | P-R08-C12, P-R08-C13, P-R09-C01, P-R09-C02, P-R09-C03, P-R09-C04, P-R09-C05, P-R09-C06 |
| poko | IDLE | front_idle | idle_front | isolated_variants | high | 3 | MICRO_POSE_LIBRARY | P-R01-C01, P-R01-C02, P-R01-C03 |
| poko | IDLE | front_idle_look | idle_look | plausible_sequence | medium | 1 | CURATE_AS_CANDIDATE_KEYS | P-R02-C01 |
| poko | IDLE | front_idle_variants | idle_front | isolated_variants | high | 9 | MICRO_POSE_LIBRARY | P-R05-C01, P-R05-C02, P-R05-C03, P-R05-C04, P-R05-C05, P-R05-C06, P-R05-C07, P-R05-C08, P-R05-C09 |
| poko | POSTURE_TRANSITIONS | lying_and_roll_variants | sit_to_lie_or_roll | uncertain_sequence | medium | 14 | ISOLATED_ONLY | P-R03-C06, P-R03-C07, P-R03-C08, P-R03-C09, P-R03-C10, P-R03-C11, P-R03-C12, P-R03-C13, P-R04-C01, P-R04-C02, P-R04-C03, P-R04-C04, P-R04-C05, P-R04-C06 |
| poko | POSTURE_TRANSITIONS | turn_and_lower | stand_to_sit_or_lie | uncertain_sequence | medium | 8 | ISOLATED_ONLY | P-R02-C11, P-R02-C12, P-R02-C13, P-R03-C01, P-R03-C02, P-R03-C03, P-R03-C04, P-R03-C05 |

## Hard rule

No grouped row above is an approved animation. Promotion requires frame-by-frame ordering, anchor review, loop/one-shot decision, and transition testing inside the animation laboratory.
