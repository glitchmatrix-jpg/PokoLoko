# PokoLoko Privacy Controls

PokoLoko context awareness is local, optional, content-blind, and disabled by default.

## Approved signals

- coarse pointer activity;
- system idle duration;
- broad time-of-day band;
- fullscreen state;
- lock and resume state;
- recent direct interaction with the pet.

Typing-presence and audio-state adapters remain unavailable until reviewed platform implementations can guarantee that only activity presence is exposed.

## Never collected

PokoLoko does not read or retain individual keystrokes, typed text, clipboard contents, screenshots, passwords, messages, URLs, browser history, window titles, document names, or document contents.

## Immediate disablement

Turning context awareness off stops polling, clears short-lived context history, emits a disabled context snapshot, and removes contextual scoring from future behavior decisions. Fullscreen behavior is separately configurable as quiet, hidden, or unchanged.

## Retention

Context is held only as a small current-session snapshot and bounded recent interaction state. It is not uploaded, sold, profiled, or persisted as a history.
