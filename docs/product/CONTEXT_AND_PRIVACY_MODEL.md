# Context and Privacy Model

## Privacy promise

PokoLoko may respond to the **presence, duration, and intensity** of local activity. It never reads or stores the content of that activity.

## Context signals

| Signal | Allowed observation | Example use | Storage | Default/opt-out rule |
|---|---|---|---|---|
| Typing activity | Aggregate key-event presence/rate only; never key identity or text | Raise laptop/reading likelihood | Rolling short-lived counters only | Separate contextual-awareness toggle; clearly explained |
| Pointer activity | Movement/click intensity and recent presence | Curiosity, quieting, avoidance of busy region | Session-only | Context toggle disables behavior influence |
| System idle | OS idle duration | Rest, sleep, quiet activity | Current duration only | May remain on by default if disclosed; user can disable context |
| Audio playback | Boolean playback/activity presence, not media title/content | Music activity becomes plausible | No history | Optional; off when contextual awareness is off |
| Time of day | Local clock bucket | Late-hour calm/sleep weighting | Current bucket only | Optional behavior modifier |
| Fullscreen app | Boolean fullscreen state and display | Quiet/hide/reposition behavior | No history | Explicit quiet/fullscreen setting |
| Lock/unlock | OS session state | Pause while locked; gentle resume | Last transition timestamp only | Required operational signal, no content |
| System resume | Resume event and elapsed suspension | Reorient or wake gently | Last resume time in session | Required operational signal |
| Recent direct interaction | Click/drag timestamps and counts | Social response, saturation, cooldown | Session-only | Necessary for interaction correctness |
| Active application category | Broad local category only, if technically reliable and opt-in | Study/work calm behavior | No executable-title history | Off by default; not required for v0.1 |

## Explicitly forbidden data

PokoLoko must never inspect, capture, infer, transmit, or persist:

- typed characters or words;
- passwords;
- clipboard contents;
- screenshots or screen pixels;
- document contents;
- message or email contents;
- browser history or page content;
- media titles or transcripts;
- filenames unrelated to app operation;
- microphone or camera input;
- persistent per-app behavioral dossiers.

## Data lifecycle

- Context counters live in memory and decay quickly.
- Session rhythm may persist only when needed for crash recovery, and should omit sensitive context.
- Preferences persist locally.
- No cloud account or analytics is required for the core product.
- Diagnostic logs redact or omit activity-content fields because such fields should not exist.

## Opt-out model

Users receive independent controls for:

- contextual awareness;
- typing/activity response;
- audio-presence response;
- time-of-day rhythm;
- fullscreen quiet behavior;
- sound;
- diagnostics.

Turning contextual awareness off leaves direct interactions and autonomous personality functioning through internal rhythm only.

## Context interpretation rules

Context changes action scores; it does not issue commands.

Bad:

> Typing detected → open laptop immediately.

Correct:

> Sustained typing raises focus-oriented activity scores, subject to posture legality, character preference, recent history, cooldown, energy, and chance.

## Fullscreen and focus restraint

When fullscreen is active:

- suppress spontaneous play and sound;
- reduce movement;
- optionally hide or move the pet from the active display according to settings;
- preserve drag and tray control;
- resume gently afterward.

## Transparency requirements

The onboarding and settings language must explain contextual awareness in plain terms: “PokoLoko can notice that you are typing or that the computer is idle, but it never reads what you type.” No vague “smart awareness” label is acceptable.
