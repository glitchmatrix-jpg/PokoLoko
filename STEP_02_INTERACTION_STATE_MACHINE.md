# Step 02 — Exclusive Interaction State Machine

This step adds one authoritative lifecycle state that prevents dragging, clicking, walking, sleeping, reactions, activities, and planner decisions from competing.

## Lifecycle states

- `idle`
- `pressed`
- `dragging`
- `carried`
- `landing`
- `reacting`
- `walking`
- `performing_activity`
- `sleeping`
- `waking`
- `paused`

The existing public `mode` field remains available for compatibility. The new `interaction` snapshot is the exclusive source of truth for whether autonomous behavior may proceed.

## Drag route

`idle/walking/sleeping/performing_activity/reacting -> pressed -> dragging -> carried -> landing -> idle`

## Guarantees

- Duplicate pointer-down events cannot create duplicate drag sessions.
- A real drag suppresses click and double-click reactions.
- Starting a drag invalidates behavior-planner work and clears stale animation/deadline timers.
- Locomotion stops before the carried state begins.
- Active activities receive an interruption and the activity controller is reset.
- Stale activity completion commands cannot restore idle while the pet is carried or landing.
- Planner decisions are accepted only while both runtime mode and lifecycle state are idle.
- Landing must complete before autonomous planning resumes.
- A press that does not become a drag restores the pre-press state.

## Main files

- `packages/pet-engine/orchestration/src/InteractionLifecycle.ts`
- `packages/pet-engine/orchestration/src/LivingRuntimeController.ts`
- `packages/pet-engine/orchestration/src/types.ts`
- `electron/main/static-pet-controller.ts`
- `electron/preload/contracts.ts`
- `tests/interaction-lifecycle/interaction-lifecycle.test.ts`
- `tests/living-runtime/living-runtime.test.ts`

## Validation

Run on the development machine:

```powershell
npm install
npm run typecheck
npm run test -- tests/interaction-lifecycle/interaction-lifecycle.test.ts tests/living-runtime/living-runtime.test.ts tests/integration/critical-runtime-paths.test.ts
npm run validate:living-runtime
npm run validate:dragging
npm run validate:state-machine
npm run build
```

Manual acceptance:

1. Begin walking, then drag. Walking must stop immediately.
2. Begin an activity, then drag. The activity must not resume during carrying or landing.
3. Drag beyond the threshold and release. No click reaction may fire.
4. Click without dragging. The normal click or wake reaction should still occur.
5. Repeatedly press during a drag. Only one drag session may exist.
6. Release while crossing displays. Landing must finish before planning resumes.
