# QA Report

Automated QA covered **31 authoritative normalized animations** and **223 PNG runtime frames**.

## Passed checks

- PNG format verified: **223** frames
- Alpha-supporting mode verified: **223** frames
- Exact canvas dimensions verified: **223** frames
- Nonblank frames: **223**
- No visible pixels at canvas boundaries: **223**
- No full opaque background detected: **223**
- No suspicious semi-transparent white fringe: **223**

## Warnings

- No frame-level structural warnings.

## Rejected candidates

- None. All 406 detected candidates were either used in animations or retained as isolated poses.

## Ambiguous sequences

- `loko_drink_02` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_eat` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_laptop` — confidence `medium`; No fabricated or interpolated frames were inserted.; At least one adjacent pair may jump abruptly; review before production use.
- `loko_music` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_peeking_01` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_peeking_02` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_playing_ball_01` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_reading_01` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_love_reaction` — confidence `medium`; No fabricated or interpolated frames were inserted.; At least one adjacent pair may jump abruptly; review before production use.
- `loko_idle_front` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_locomotion_side_01` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `loko_locomotion_side_02` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `loko_walk_left` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `loko_walk_preparation` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `loko_walk_right` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `loko_sleep_loop` — confidence `high`; No fabricated or interpolated frames were inserted.
- `loko_sleep_transition` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_drink` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_eat` — confidence `medium`; No fabricated or interpolated frames were inserted.; At least one adjacent pair may jump abruptly; review before production use.
- `poko_music` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_peeking` — confidence `medium`; No fabricated or interpolated frames were inserted.; At least one adjacent pair may jump abruptly; review before production use.
- `poko_playing_ball` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_sad_to_crying` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_idle_blink` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_idle_look_01` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_locomotion_side` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `poko_walk_left` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `poko_walk_right` — confidence `medium`; No fabricated or interpolated frames were inserted.
- `poko_sleep_loop_01` — confidence `high`; Forward loop seam is visibly/quantitatively harsher than internal motion; ping-pong recommended.; No fabricated or interpolated frames were inserted.
- `poko_sleep_loop_02` — confidence `high`; No fabricated or interpolated frames were inserted.
- `poko_sleep_transition` — confidence `high`; No fabricated or interpolated frames were inserted.

## Possible missing frames or abrupt adjacent jumps

- None detected by the automated outlier threshold.

## Abrupt loops

- No forward loop currently exceeds the configured seam threshold.

## Frames requiring later manual review

- `poko_peeking` ['frame_004.png', 'frame_005.png']: body width changes unexpectedly — [43, 57]
- `poko_peeking` ['frame_004.png', 'frame_005.png']: body centroid y changes unexpectedly — [94.78257686676427, 86.59710586443259]
- `poko_playing_ball` ['frame_004.png', 'frame_005.png']: visible body area changes unexpectedly — [1475, 2022]
- `poko_playing_ball` ['frame_007.png', 'frame_008.png']: visible body area changes unexpectedly — [2012, 1206]
- `poko_playing_ball` ['frame_008.png', 'frame_009.png']: visible body area changes unexpectedly — [1206, 2011]
- `poko_playing_ball` ['frame_001.png', 'frame_002.png']: body width changes unexpectedly — [47, 71]
- `poko_playing_ball` ['frame_002.png', 'frame_003.png']: body width changes unexpectedly — [71, 46]
- `poko_playing_ball` ['frame_004.png', 'frame_005.png']: body width changes unexpectedly — [43, 67]
- `poko_playing_ball` ['frame_007.png', 'frame_008.png']: body height changes unexpectedly — [54, 34]
- `poko_playing_ball` ['frame_008.png', 'frame_009.png']: body height changes unexpectedly — [34, 57]
- `poko_playing_ball` ['frame_002.png', 'frame_003.png']: body centroid y changes unexpectedly — [96.11813186813187, 88.02759448110378]
- `poko_playing_ball` ['frame_005.png', 'frame_006.png']: body centroid y changes unexpectedly — [84.14193867457962, 92.17972893341191]
- `poko_playing_ball` ['frame_007.png', 'frame_008.png']: body centroid y changes unexpectedly — [87.33101391650099, 98.41708126036484]
- `poko_playing_ball` ['frame_008.png', 'frame_009.png']: body centroid y changes unexpectedly — [98.41708126036484, 85.75534559920438]

## Interpretation

Automated outlier flags are intentionally conservative. They are review prompts, not deletion decisions. Pose changes, squash-and-stretch, prop movement, and intentional reactions can trigger large metric changes without being errors.