# Interaction Model

## Principle

Interaction should feel like touching a small inhabitant, not operating a toolbar. Every input maps to one clear intention, respects current posture, and avoids queues of stale reactions.

## Hierarchy

### Hover

Default behavior is visual only: pointer-aware hit testing and optional subtle attention after a dwell. Hover does not continuously animate, chase the cursor, or block desktop input outside the visible pet region.

- short hover: no required response;
- sustained hover: small look or attention shift if stable and cooldown permits;
- hover during sleep: no automatic wake;
- opt-out: contextual awareness off disables hover-driven behavior.

### Single click

A single click requests social acknowledgment. The planner chooses a posture-compatible response based on character, recent attention, mood, and cooldown.

- does not forcibly interrupt LOCKED transition frames;
- may be deferred to a safe phrase boundary during prop activities;
- repeated clicks are coalesced rather than queued.

### Repeated click

Repeated clicks update `recentAttention` and interaction saturation. Reactions progress naturally:

- Poko: delight → saturation → mild boundary response;
- Loko: acknowledgment → disengagement → mild annoyance.

No crying, punishment, permanent mood damage, or “you abandoned me” messaging.

### Double click

Double click is a distinct high-value gesture. It may request an affectionate reaction or open a compact interaction affordance, depending on final UI testing. It must not also emit two single-click reactions.

### Drag

Drag is authoritative and IMMEDIATE:

1. hit test visible pet region;
2. cancel locomotion and pending intention;
3. enter dragged state;
4. preserve pointer offset;
5. move smoothly across displays;
6. on release, resolve current display and ground;
7. settle through a valid recovery pose;
8. return to a stable state and replan.

The pet never fights the pointer, continues walking while held, or teleports horizontally on release.

### Right click

Right click opens a compact native/context menu. It should not trigger a social reaction. Core actions:

- pause/resume;
- switch character;
- quiet mode;
- move to current display;
- settings;
- quit.

### Tray

The tray is the reliable control center. State indicators must match the authoritative runtime. It supports pause, character switch, activity level, settings, restart pet, and quit without duplicating the full settings interface.

### Settings

Settings are explicit user control, not an in-world interaction. Changes propagate safely, validate immediately, and never leave the pet in an illegal state.

### Quiet mode

Quiet mode reduces autonomous movement, suppresses nonessential sound, favors stillness and calm activities, and delays spontaneous play. It does not freeze dragging, hide essential controls, or imply that the pet is upset.

## Gesture conflict rules

- pointer movement threshold distinguishes click from drag;
- double-click timeout suppresses duplicate single-click actions;
- right click never begins drag;
- only one direct-interaction intention may be active;
- interaction spam is coalesced into attention intensity, not animation queues.

## Interruption levels

### IMMEDIATE
Applies to drag, shutdown, display loss, critical repositioning, and character switch. Current action exits through the safest available emergency route.

### SOFT
Applies to single click, contextual attention, and minor environmental changes. The current activity acknowledges at a safe phrase or posture boundary.

### DEFERRED
Applies to new autonomous intentions while a prop is held or an activity is mid-phrase. The action completes its defined exit segment first.

### LOCKED
Applies only to very short transition fragments whose interruption would create visual corruption. Drag and shutdown still override through emergency recovery.

## Input accessibility

- settings and tray actions remain keyboard accessible;
- reduced-motion mode lowers transition intensity and spontaneous movement, not functionality;
- size uses safe integer scaling only;
- pointer hit areas remain usable without becoming giant invisible blockers.
