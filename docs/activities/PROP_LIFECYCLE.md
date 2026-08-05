# PokoLoko — Prop Lifecycle

## Core rule

A prop must appear and disappear deliberately. The renderer may not infer prop presence from an activity name, and locomotion may not begin while a composite-frame prop is still visible.

## Current asset reality

The approved laptop, book, food, drink, ball, ledge, music notes, hearts, tears, and sleep effects are embedded in composite PNG frames. They are not independent runtime objects. `ownership: composite_frame` means:

- a separate prop layer cannot be moved or hidden independently;
- immediate interruption must route through a prop-free recovery frame or neutral reset;
- ordinary interruption waits for a documented safe phrase boundary;
- the app must never carry the last composite prop frame into another animation.

## Prop states

```text
none
→ appearing
→ held
→ disappearing
→ none
```

`ActivitySession.propVisible` and `activePropId` expose the logical phase to diagnostics. The authoritative visual presence remains tied to the active composite animation frame.

## Activity-specific rules

- **Laptop:** appears after a seated/focused setup; leaves only at a neutral typing boundary. No authored close frame exists, so a hold and neutral recovery are required.
- **Book:** appears after seated setup; exits at page-rest/loop boundary with a book-close substitute hold.
- **Food/drink:** forward-only phrase semantics; never reverse or ping-pong consumption.
- **Ball:** appears before contact, follows authored frame trajectory, and clears only at a ball-rest boundary.
- **Peeking ledge:** exists only while the native window is aligned to a real desktop edge; the body withdraws before ledge context is removed.
- **Music notes/orb:** effects clear after a completed phrase. Loko's orb is a rare climax variation, not an endless loop.

## Immediate interruption

Drag, character switch, display loss, and shutdown:

1. invalidate the activity generation;
2. cancel deadline/variation work;
3. stop locomotion and activity playback;
4. mark prop invisible logically;
5. execute the documented recovery choreography;
6. reject stale completion events;
7. update session memory as interrupted.

## Future separate props

A future asset may use `separate_layer` only when it has:

- transparent independent artwork;
- stable attachment/world anchors;
- explicit appearance and disappearance markers;
- hit-test rules;
- movement ownership;
- interruption and cleanup tests.

The framework supports that ownership type, but Step 18 does not pretend the current composite props are separate objects.
