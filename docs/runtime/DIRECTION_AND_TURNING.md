# PokoLoko — Direction, Turning, Start, and Stop Choreography

## Asset audit

The approved runtime vocabulary contains reliable left/right walking loops for both characters. It does **not** contain a dedicated full-body turn animation or a dedicated stop animation. Loko has `loko_walk_preparation`; Poko does not have an equivalent approved preparation sequence.

| Character | Right walk | Left walk | Preparation | Dedicated turn | Dedicated stop |
|---|---|---|---|---|---|
| Poko | `poko_walk_right` | `poko_walk_left` | none | none | none |
| Loko | `loko_walk_right` | `loko_walk_left` | `loko_walk_preparation` | none | none |

The left cycles are approved mirrored runtime assets. No prop-bearing or meaning-bearing activity frame is mirrored by the direction controller.

## Choreography policy

### Starting in the current direction

- **Poko:** begin translation with the matching walk cycle. Acceleration supplies the physical anticipation; no fabricated sprite bridge is introduced.
- **Loko:** play one non-looping pass of `loko_walk_preparation`, then begin translation with the matching walk cycle.

### Starting in the opposite direction while idle

1. remain in the neutral front idle;
2. hold briefly (Poko 120 ms, Loko 180 ms);
3. commit authoritative direction;
4. play Loko preparation where applicable;
5. load the correct left/right cycle;
6. begin translation.

The front-neutral hold prevents a visible in-motion mirror. It is choreography, not a substitute fabricated frame.

### Reversing while walking

1. keep translating until the current gait cycle reaches a loop boundary;
2. enter `stopping` presentation state;
3. stop native translation at the boundary;
4. route through the neutral idle hold;
5. commit the new direction;
6. play Loko preparation where applicable;
7. start the new walk cycle and resume translation.

If the destination is reached before the renderer reports a loop boundary, translation completion becomes the safe stop boundary and the same neutral-turn route is used.

## Ownership

`DirectionTurnController` owns direction choreography phase and pending direction/destination. It does not move the Electron window or choose sprite frames.

`LocomotionEngine` owns continuous X position and signed velocity. It can retarget an active same-direction journey without resetting position or velocity.

`StaticPetController` executes choreography actions and publishes presentation state:

```text
idle → starting → walking → stopping → turning → starting/walking
```

The renderer only reports animation facts. It sends loop-boundary `FRAME_CHANGED` events and one-shot `ANIMATION_COMPLETED` events; it never decides to turn.

## Anchor and mirroring rules

- Frames stay on the fixed 128×128 canvas.
- Manifest ground anchors remain authoritative.
- Left walk anchors are loaded from their own manifest entries; the DOM is not flipped.
- The current approved walk anchors differ by at most one canvas pixel in X and share ground Y = 112.
- Body-center metadata is preserved per sequence.
- No prop-bearing animation is mirrored at runtime.

## Replacement destination behavior

- Same-direction destination update: locomotion retargets continuously; the walk cycle does not restart.
- Opposite-direction destination update: wait for gait boundary and run the turn route.
- New request during start/turn choreography: invalidate the older choreography generation before accepting the newer request.
- Stop, character switch, drag (Step 13), and shutdown invalidate pending choreography.

## Display changes

During translation, changed work-area bounds are applied by the locomotion engine. If translation is forced to stop, pending turn choreography recovers through neutral grounding. Direction is never inferred from a stale window coordinate.

## Native validation queued for release EXE

The GitHub Actions Windows build must visually verify:

- no mid-stride instant flip;
- no backward displacement at the direction-commit frame;
- no anchor hop between right walk, neutral idle, and left walk;
- Loko preparation reads as intentional in both requested directions;
- edge reversal and display-change recovery;
- mixed-DPI direction changes;
- repeated opposite requests do not oscillate.
