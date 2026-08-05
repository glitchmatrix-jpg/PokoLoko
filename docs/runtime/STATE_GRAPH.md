# PokoLoko Step 12 — Legal State Graph

## Rule

The state machine protects physical and visual legality. It does not choose personality or decide what Poko or Loko wants to do. A behavior planner may propose an intention, but this machine alone accepts, rejects, or routes it.

## Families

- **Stable:** front idle, side idle, sitting, sleeping.
- **Transitional:** neutral bridge, walk start/stop, turning, sleep entry, waking, activity entry/exit, recovery.
- **Movement:** walking.
- **Activities:** drink, eat, laptop, music, peeking, playing ball, reading.
- **Interaction:** dragged and social reaction.
- **System:** booting, paused, suspended, recovering, shutting down.

## Core graph

```text
system.booting
  └─> stable.idle_front

stable.idle_front
  ├─> transition.neutral_bridge -> stable.idle_side
  │       └─> transition.walk_start -> movement.walking
  ├─> transition.sleep_entry -> stable.sleeping
  ├─> transition.activity_entry -> activity.*
  └─> interaction.social_reaction -> stable.idle_front

movement.walking
  ├─> transition.walk_stop -> stable.idle_side
  └─> transition.turning -> movement.walking

activity.*
  └─> transition.activity_exit -> stable.idle_front

stable.sleeping
  └─> transition.waking -> stable.idle_front

any interruptible state
  └─> interaction.dragged -> transition.recovering -> stable.idle_front
```

## Asset-truth constraints

The approved pack has sleep-entry sequences but no authoritative wake animation, standing-to-sitting bridge, generic activity pickup/put-down sequence, or dedicated stop animation. The graph therefore declares explicit neutral/recovery transitions rather than pretending those assets exist. Step 07 choreography data supplies holds or curated bridge poses when approved.

Loko's walk preparation may implement `transition.walk_start`. Poko uses the documented neutral start route. Neither character may flip direction while translation is visibly active.

## Completion ownership

- Transitional visual states advance only from `ANIMATION_COMPLETED`.
- Walking advances from `DESTINATION_REACHED`.
- Dragging advances from `DRAG_ENDED`.
- system recovery advances from `RECOVERY_COMPLETED`.
- Stable states end only through a new accepted intention or system interaction.

Every completion carries the current generation. Old generations are ignored.

## Prop invariant

No `activity.*` state can route directly to `movement.walking`. The route always begins with `transition.activity_exit`, clears the prop at a safe marker, returns through neutral posture, and only then starts locomotion.

## Logging

Every request records request ID, reason, source state, target kind, accepted route, fallback, and generation before/after. The log is bounded to 250 entries and contains no private context content.
