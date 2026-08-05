import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/interaction/src/types.ts',
  'packages/pet-engine/interaction/src/InteractionController.ts',
  'packages/pet-engine/interaction/src/settling.ts',
  'packages/pet-engine/interaction/src/index.ts',
  'tests/dragging/interaction-controller.test.ts',
  'tests/dragging/settling.test.ts',
  'docs/interaction/DRAGGING_AND_RECOVERY.md',
];
const failures = [];
for (const file of required) if (!existsSync(join(root, file))) failures.push(`missing ${file}`);

const controller = readFileSync(join(root, 'packages/pet-engine/interaction/src/InteractionController.ts'), 'utf8');
const renderer = readFileSync(join(root, 'src/surfaces/PetSurface.tsx'), 'utf8');
const native = readFileSync(join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
const contracts = readFileSync(join(root, 'electron/preload/contracts.ts'), 'utf8');
const routes = readFileSync(join(root, 'packages/pet-engine/state-machine/src/routes.ts'), 'utf8');
const graph = readFileSync(join(root, 'packages/pet-engine/state-machine/src/stateGraph.ts'), 'utf8');

const checks = [
  [controller.includes('dragThresholdPx: 6'), 'drag threshold missing'],
  [controller.includes('grabOffset'), 'cursor/window offset missing'],
  [controller.includes('DOUBLE_CLICKED'), 'double-click distinction missing'],
  [renderer.includes('setPointerCapture'), 'pointer capture missing'],
  [renderer.includes('pointHitsVisiblePixel'), 'alpha-aware start missing'],
  [renderer.includes("type: 'pet_pointer_move'"), 'drag move IPC missing'],
  [native.includes("target: { kind: 'drag' }"), 'authoritative dragged state missing'],
  [native.includes("interruptTranslation('drag-start')"), 'locomotion interruption missing'],
  [native.includes('createSettlePlan'), 'settlement choreography missing'],
  [native.includes('screen.getDisplayNearestPoint'), 'release display selection missing'],
  [native.includes("type: 'RECOVERY_COMPLETED'"), 'physical recovery completion missing'],
  [contracts.includes("z.literal('pet_pointer_down')"), 'typed drag IPC down missing'],
  [contracts.includes("z.literal('pet_pointer_up')"), 'typed drag IPC up missing'],
  [routes.includes("['interaction.dragged', 'transition.recovering', 'stable.idle_front']"), 'drag recovery route missing'],
  [graph.includes("completionEvent:'RECOVERY_COMPLETED'"), 'recovery state does not await physical completion'],
];
for (const [ok, message] of checks) if (!ok) failures.push(message);

if (failures.length) {
  console.error('STEP 13 DRAGGING VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('STEP 13 DRAGGING VALIDATION PASSED');
console.log('Alpha-aware pointer capture, threshold classification, native drag, settlement, and recovery verified statically.');
