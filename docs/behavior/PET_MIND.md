# Pet Mind

The Pet Mind is a hidden, session-limited influence model. It tracks energy, playfulness, focus, sociability, curiosity, comfort, boredom, recent attention, interruption load, wake duration, and a derived mood. These are never presented as health bars and never punish the user for leaving.

Mind updates are pure functions driven by coarse events and elapsed monotonic time. Poko begins more playful, curious, social, and energetic. Loko begins calmer, more focused, comfortable, and deliberate. Values decay or recover gradually and are clamped to 0–1.

No user-content data is accepted by this package. Session mind and context history are not persisted across restarts.
