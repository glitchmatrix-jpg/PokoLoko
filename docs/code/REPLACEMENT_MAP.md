# Replacement Map

## File-level decisions

| Current path | Decision | Replacement responsibility |
|---|---|---|
| `electron/main.ts` | REPLACE | Thin composition root plus pet controller, window service, tray service, display service, settings service, context service, typed IPC router |
| `electron/preload.cts` | REFACTOR | Versioned, validated bridge generated/shared from IPC contract |
| `electron/store.ts` | KEEP_WITH_MINOR_CHANGES | Versioned local settings repository with migrations/tests |
| `electron/types.ts` | REPLACE | Shared domain, settings, IPC, presentation, and event types |
| `src/components/Pet.tsx` | REPLACE | Presentation-only pet surface; no behavior inference |
| `src/components/Sprite.tsx` | REPLACE | Fixed-canvas animation renderer with numerical anchors, diagnostics, and hit mask |
| `src/hooks/useSpriteAnimation.ts` | REPLACE | Deterministic animation runtime/service with explicit completion and playback modes |
| `src/components/Settings.tsx` | REPLACE | Branded PokoLoko settings/product experience |
| `src/App.tsx` | REFACTOR | Explicit surface router and error/loading boundaries |
| `src/types/*` | REPLACE | Imports from shared generated/types package |
| `src/styles.css` | REPLACE | Final brand system and coordinate-safe pet presentation |
| `public/assets/**` | DELETE | Generated runtime subset from authoritative asset pack |
| `public/icons/**` | DELETE | Final authoritative `pokoloko(1).ico` and derived brand assets |
| `scripts/validate-assets.mjs` | REFACTOR | Comprehensive runtime-manifest and image QA validator |
| `scripts/dev.mjs` | REFACTOR | Reliable concurrent process manager with fail-fast behavior |
| `package.json` | REFACTOR | Final PokoLoko identity, lockfile, tests, lint, deterministic scripts, build metadata |
| `.github/workflows/build-windows.yml` | REFACTOR | Lockfile install, tests, cache, checksums, signed/unsigned release strategy |
| documentation claims | REPLACE | Evidence-based docs generated from completed tests |

## Functional replacement map

| Existing capability | New subsystem | Preserve behavior? |
|---|---|---|
| Random behavior timeout | Behavior planner + pet mind + cooldown/session memory | No; replace semantics |
| Native walking interval | Locomotion controller | Preserve visible goal, replace implementation |
| Renderer animation inference | Authoritative presentation state | No |
| Manifest `next` | State-machine transition graph | Preserve useful metadata only |
| Drag IPC | Interaction controller + versioned drag session | Preserve gesture, replace protocol |
| Work-area clamping | Display/ground service | Preserve API knowledge, replace geometry |
| Click reactions | Social interaction planner | Preserve idea, redesign response logic |
| Pet switching | Character lifecycle controller | Preserve user capability, replace reset semantics |
| Pause | Global simulation mode | Preserve capability, redesign resumability |
| Tray | Native shell service | Preserve capability, redesign identity/menu synchronization |
| Settings JSON | Versioned settings repository | Preserve local persistence approach |
| Asset validation | Runtime asset pipeline QA | Preserve automated-gate principle |

## Deletion gate

Legacy behavior may not be copied into the clean redesign unless a Step 03/04 specification explicitly cites a KEEP decision. “It already works” is not sufficient evidence.
