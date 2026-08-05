# PokoLoko Data Boundaries

## Never collected

PokoLoko must never inspect or retain:

- characters or keys pressed;
- typed text;
- clipboard contents;
- passwords;
- screenshots or screen pixels;
- messages or email contents;
- browser history, URLs, or page contents;
- document names or contents;
- persistent logs of desktop activity;
- inferred long-term psychological or productivity profiles.

## Local and ephemeral

Context is processed in the local Electron main process. The planner receives only coarse values such as `typingActivity: sustained` or `systemIdle: true`. Current-session state is bounded and discarded when context is disabled or the app exits.

No context data is transmitted, synchronized, sold, or exposed to advertisers. No analytics dependency is included.

## Permissions and availability

A signal is active only when:

1. the global Context Awareness switch is on;
2. the individual signal switch is on;
3. a reviewed provider reports the signal as available.

Content-blind presence is not equivalent to content access. PokoLoko should say what it can observe in ordinary language and show unavailable signals honestly.

## Active-app category

Step 17 does not collect foreground window titles, executable paths, URLs, or document names. Coarse app category remains unsupported until a future adapter can prove it needs no identifying content. The behavior engine cannot depend on it.
