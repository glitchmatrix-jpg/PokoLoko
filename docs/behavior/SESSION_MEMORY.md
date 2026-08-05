# Session Memory

Session memory uses bounded queues for the last 12 activities, 16 transitions, 16 recent disturbances, and 8 screen regions. It records only category IDs and monotonic timestamps. It does not retain typed text, window titles, URLs, screenshots, messages, clipboard content, or long-term inferred preferences.

Immediate repeats are rejected or heavily penalized. Hard and soft cooldowns prevent laptop, reading, music, food, and ball play from becoming repetitive. Sleep is suppressed for at least three minutes after waking. Interrupted activities are remembered so they do not restart immediately.
