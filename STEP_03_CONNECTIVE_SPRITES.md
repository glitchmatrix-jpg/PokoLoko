# Step 3 — Connective and interaction sprites

Added eleven Poko runtime animations without replacing the authoritative pack:

- poko_idle_breathe
- poko_idle_ear_twitch
- poko_idle_glance_left
- poko_idle_glance_right
- poko_turn_left
- poko_turn_right
- poko_walk_start
- poko_walk_stop
- poko_pickup
- poko_carried_loop
- poko_drop_land

All frames are 128×128 RGBA PNGs, use nearest-neighbour transforms, retain ground_y 112, include per-frame visible bounds and checksums, and declare explicit loop/one-shot behavior.

Runtime choreography:

- drag: pickup → carried loop → drop landing → idle
- walk: directional turn → walk start → walk loop → walk stop → idle

The new sprites are conservative derivatives of the existing Poko art so the application can test motion continuity immediately. They should be visually reviewed in the packaged Windows build before being treated as final hand-drawn production art.
