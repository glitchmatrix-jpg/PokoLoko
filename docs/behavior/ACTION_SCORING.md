# Action Scoring

The planner is called only at stable decision points. It filters actions by legal state and the caller-provided legal activity list, then scores context fit, character profile, internal drives, repetition, cooldown, activity level, and quiet-mode constraints. Controlled weighted sampling preserves surprise without allowing nonsense.

Every decision returns ranked diagnostics with scores and concise content-blind reasons. Production code injects a local session seed; tests use fixed seeds. `Math.random()` is not used by behavior code.

Calm lowers movement/activity pressure, balanced preserves authored weights, and lively increases eligible motion/activity without making transitions illegal. Pause returns no intention. Quiet/fullscreen/locked context suppresses walking and noisy play while retaining calm options.
