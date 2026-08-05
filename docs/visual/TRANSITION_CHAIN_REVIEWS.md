# PokoLoko — Transition Chain Reviews

## Review policy

A chain is acceptable only when posture, direction, prop ownership and interruption recovery remain explicit. Runtime holds are choreography—not fabricated animation frames.

## Poko expressive chain

`idle_blink → intention hold → direction right → walk_right → neutral hold → music setup → music loop → prop-safe exit → idle_blink`

- The idle-to-side-walk orientation gap requires a neutral orientation hold until a dedicated turn bridge is approved.
- Music may use a soft interruption at a phrase boundary.
- Exit must return through a prop/effect-safe frame; music notes are composite.

## Loko focused chain

`idle_front → intention hold → direction right → walk_right → neutral hold → laptop setup → laptop loop → prop-safe exit → idle_front`

- Laptop entry requires seated/prop setup choreography; direct front-idle to laptop is not approved.
- Laptop is deferred-interruption because the prop is composite.
- The final laptop frames must be reviewed in the lab to select a stable work subset and exit frame.

## Sleep chains

- `poko_sleep_transition → poko_sleep_loop_01` is posture-compatible and locked during the short transition.
- `loko_sleep_transition → loko_sleep_loop` is posture-compatible and locked during the short transition.
- Neither character may jump from sleep directly to walking; wake routing remains required.

## Mirrored locomotion

Both generated left-facing sequences must always be shown next to their original right-facing sources. Anchor X inversion and visual parity are inspectable in the side-by-side lab view. No prop-bearing sequence may be mirrored automatically.

## Interruption simulation

The lab exposes every frame deterministically. During engine integration, each frame becomes an interruption test point with the activity interruption level and prop-safe recovery rule shown from the manifest.
