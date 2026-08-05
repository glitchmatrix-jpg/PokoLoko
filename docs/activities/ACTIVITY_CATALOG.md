# PokoLoko — Integrated Activity Catalog

## Purpose

This catalog is the authoritative Step 19 integration layer between the behavior planner, context summary, legal state machine, rich activity controller, and approved runtime assets. Context can raise or lower eligibility; it never starts an animation directly.

## Poko

| Activity | Role | Approved asset | Entry / exit truth | Frequency and personality |
|---|---|---|---|---|
| Drink | Ambient spontaneous | `poko_drink` | Neutral low-posture hold → composite container → finish phrase → prop-free idle | Occasional; no thirst meter |
| Eat | Ambient spontaneous | `poko_eat` | Settled hold → food scene → forward-only subscene completion → neutral beat | Infrequent; no hunger meter |
| Music | Contextual or spontaneous | `poko_music` | Notice-audio hold → musical phrase → phrase-safe note clear | Strong Poko preference; audio raises probability only |
| Peeking | Edge exploration | `poko_peeking` | Move to a real work-area edge → ledge composite → withdraw marker → neutral recovery | Curious and uncommon |
| Ball play | Signature spontaneous play | `poko_playing_ball` | Clear play region → ball appears → authored one-shot phrase → ball-rest removal → side/neutral recovery | Strongest Poko play routine; hard frequency cap |
| Laptop | Unsupported | none | Not integrated | No asset fabrication |
| Reading | Unsupported | none | Not integrated | No asset fabrication |

## Loko

| Activity | Role | Approved asset | Entry / exit truth | Frequency and personality |
|---|---|---|---|---|
| Laptop | Contextual focus | `loko_laptop` | Deliberate settling hold → laptop composite → long safe-boundary session → neutral prop removal | Typing raises probability; long calm sessions |
| Reading | Contextual focus | `loko_reading_01` | Settle → book composite → page-safe loops/pauses → page-rest exit | Strong Loko signature |
| Music | Contextual or spontaneous | `loko_music` | Quiet listening setup → phrase → safe note clear | Restrained and infrequent |
| Ball play | Rare spontaneous surprise | `loko_playing_ball_01` | Play-space setup → one-shot phrase → ball-rest recovery | Maximum once per hour |
| Drink | Ambient spontaneous | `loko_drink_02` | Deliberate hold → container composite → safe phrase → seated recovery | Calm and occasional |
| Eat | Ambient spontaneous | `loko_eat` | Quiet setup → forward-only food sequence → settled finish | Infrequent; no need meter |
| Peeking | Edge observation | `loko_peeking_01` + `loko_peeking_02` | Real-edge alignment → authored peek phrases → withdrawn recovery | Lower frequency than Poko |

## Ambient life vocabulary

Ambient phrases are not prop activities and do not enter the heavy activity lifecycle:

- Poko blink: `poko_idle_blink`, used as a brief irregular phrase.
- Poko look: `poko_idle_look_01`, curiosity-weighted and skip-prone.
- Poko calm hold: runtime hold on the current anchor-correct neutral frame.
- Loko calm idle: `loko_idle_front`, used in longer deliberate phrases.
- Loko attentive hold: neutral hold during quiet or focused context.

There are no approved standalone yawn, stretch, or ear-only sequences in the runtime pack. The integration layer does not invent them or split unapproved archival frames. They remain unsupported until a later asset decision explicitly promotes them.

## Context behavior

- Typing presence increases Loko laptop and reading scores; it never commands either.
- Audio-active increases music scores; spontaneous music remains possible at a lower weight.
- Busy pointer activity suppresses long focus and high-motion play.
- Fullscreen, lock, and quiet mode suppress high-salience activities.
- Peeking requires confirmed edge alignment.
- Context disabled means activities remain possible through personality and spontaneous weights only.

## Continuity rule

Every prop-bearing routine exits through a phrase boundary, marker, neutral hold, or recovery route declared in the Step 18 definition. Arbitrary crossfades are prohibited.
