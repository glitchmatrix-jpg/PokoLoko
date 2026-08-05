# PokoLoko Reaction and Social Interaction Model

## Purpose

Reactions acknowledge the user without turning PokoLoko into an emotional slot machine. They are short, posture-safe, cooldown-controlled phrases selected from the authoritative runtime vocabulary. Reactions do not bypass the legal state machine, activity prop lifecycle, sleep lifecycle, or drag recovery.

## Approved visual vocabulary

| Character | Reaction | Runtime asset | Use |
|---|---|---|---|
| Poko | curious notice | `poko_idle_look_01` | single click, surprise, long idle |
| Poko | warm response | `poko_idle_blink` | affectionate repeat click, drag release, activity success |
| Poko | overstimulated pause | `poko_idle_look_01` | excessive poking, followed by refractory silence |
| Poko | contextual sadness | `poko_sad_to_crying` | rare explicit context only; never random or caused by absence |
| Loko | quiet notice | `loko_idle_front` | single click, surprise, long idle |
| Loko | deliberate affection | `loko_love_reaction` | repeat click, drag release, activity success; long cooldown |
| Loko | subtle withdrawal | `loko_idle_front` | excessive poking and input collapse |
| Loko | contented hold | `loko_idle_front` | successful focused activity or calm idle |

No angry, sad, or affection animation is fabricated for a character that lacks approved art. Neutral holds are used honestly when the asset vocabulary is restrained.

## Trigger hierarchy

- **Single click:** small acknowledgement.
- **Affectionate repeat click:** warmer response when clicks are close but not spammy.
- **Excessive poking:** one restrained overstimulation reaction, then input is ignored during cooldown.
- **Wake interaction:** routes to the sleep lifecycle; upright social animations are forbidden while lying.
- **Drag release:** may produce a warm response only after landing/recovery completes.
- **Long idle:** rare ambient acknowledgement, not a plea for attention.
- **Activity success:** optional satisfied beat after props are removed and neutral posture is restored.
- **Surprise:** small context-safe notice.
- **Contextual sadness:** Poko-only, rare, explicit reason required, and never tied to user neglect.

## Spam collapse

Only the latest meaningful social intention is considered. Click history is bounded to eight timestamps over a 4.2-second window. Cooldowns and saturation prevent queues from growing. The controller emits either one playable reaction, one deferred request, one wake request, or an ignored diagnostic; it never stores dozens of pending animations.

## Posture and prop safety

- Locked transitions defer social input.
- Sleeping input requests wake.
- Prop-bearing activities request a safe exit before any reaction.
- Reactions return to declared compatible neutral states.
- Drag, character switch, display loss, pause, and shutdown invalidate stale reaction generations.

## Personality timing

Poko acknowledges sooner, escalates warmth more quickly, and recovers from attention faster. Loko responds more slowly, uses affection less often, and has longer refractory periods after excessive clicking.

## Attention memory

The controller stores only bounded session data: recent click times, coarse attention, saturation, reaction cooldowns, and last reaction ID/time. It does not create permanent attachment scores, guilt mechanics, or private activity logs.

## Diagnostics

Every selection records the trigger, chosen reaction, animation, generation, return state, and reason. Ignored or deferred input is also visible. No typed content or private desktop content enters this log.
