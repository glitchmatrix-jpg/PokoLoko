# Manual QA Review Decisions

All 14 conservative automated flags were inspected on the normalized 128×128 frames. None represents accidental resizing, clipping, mis-centering, or extraction failure. They are deliberate posture changes and prop interaction.

| Animation | Frames | Flag | Decision | Human rationale |
|---|---|---|---|---|
| poko_peeking | frame_004.png, frame_005.png | body width changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_peeking | frame_004.png, frame_005.png | body centroid y changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_004.png, frame_005.png | visible body area changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_007.png, frame_008.png | visible body area changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_008.png, frame_009.png | visible body area changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_001.png, frame_002.png | body width changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_002.png, frame_003.png | body width changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_004.png, frame_005.png | body width changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_007.png, frame_008.png | body height changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_008.png, frame_009.png | body height changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_002.png, frame_003.png | body centroid y changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_005.png, frame_006.png | body centroid y changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_007.png, frame_008.png | body centroid y changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |
| poko_playing_ball | frame_008.png, frame_009.png | body centroid y changes unexpectedly | Intentional authored pose/prop motion; retain. | Body proxy changes because the character changes posture relative to the ledge/ball. No frame is resized; ground/canvas integrity remains valid. |

## Binding decision

Retain all flagged frames unchanged. The activity controller must treat the sequence as authored choreography and must not attempt to “correct” body width, height, area, or centroid by resizing or recentering individual frames.
