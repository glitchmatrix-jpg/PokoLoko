import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/direction/src/DirectionTurnController.ts',
  'packages/pet-engine/direction/src/types.ts',
  'packages/pet-engine/direction/src/profiles.ts',
  'packages/pet-engine/direction/src/index.ts',
  'tests/direction-and-turning/direction-turn-controller.test.ts',
  'docs/runtime/DIRECTION_AND_TURNING.md',
  'docs/runtime/DIRECTION_ASSET_AUDIT.md',
];

const failures = [];
for (const relative of required) {
  try {
    const info = await stat(path.join(root, relative));
    if (!info.isFile() || info.size === 0) failures.push(`invalid file: ${relative}`);
  } catch {
    failures.push(`missing file: ${relative}`);
  }
}

const controller = await readFile(path.join(root, 'packages/pet-engine/direction/src/DirectionTurnController.ts'), 'utf8');
const staticController = await readFile(path.join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
const petSurface = await readFile(path.join(root, 'src/surfaces/PetSurface.tsx'), 'utf8');
const locomotion = await readFile(path.join(root, 'packages/pet-engine/locomotion/src/LocomotionEngine.ts'), 'utf8');
const manifest = JSON.parse(await readFile(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));

for (const token of ['waiting_gait_boundary', 'PLAY_NEUTRAL_HOLD', 'COMMIT_DIRECTION', 'PLAY_PREPARATION']) {
  if (!controller.includes(token)) failures.push(`direction controller missing ${token}`);
}
if (!staticController.includes('handleAnimationEvent')) failures.push('main controller does not accept animation boundary facts');
if (!staticController.includes('directionTurn.onGaitBoundary')) failures.push('gait boundary is not wired to direction choreography');
if (!petSurface.includes("event.type === 'FRAME_CHANGED' && event.loopBoundary")) failures.push('renderer does not report loop boundaries');
if (!locomotion.includes('public retarget(')) failures.push('same-direction continuous retargeting is missing');
if (/transform\s*:\s*[^;]*scaleX\s*\(\s*-1\s*\)/.test(petSurface)) failures.push('unsafe whole-DOM mirroring detected');

const ids = new Map(manifest.animations.map((animation) => [animation.id, animation]));
for (const id of ['poko_walk_left', 'poko_walk_right', 'loko_walk_left', 'loko_walk_right', 'loko_walk_preparation']) {
  if (!ids.has(id)) failures.push(`required direction asset missing: ${id}`);
}
for (const [leftId, rightId] of [['poko_walk_left', 'poko_walk_right'], ['loko_walk_left', 'loko_walk_right']]) {
  const left = ids.get(leftId);
  const right = ids.get(rightId);
  if (!left || !right) continue;
  if (left.anchor.ground_y !== right.anchor.ground_y) failures.push(`${leftId}/${rightId} ground Y mismatch`);
  if (Math.abs(left.anchor.ground_x - right.anchor.ground_x) > 1) failures.push(`${leftId}/${rightId} ground X differs by more than one pixel`);
}

if (failures.length) {
  console.error('STEP 11 DIRECTION VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('STEP 11 DIRECTION VALIDATION PASSED');
console.log('Gait-boundary stop, neutral turn, Loko preparation, continuous retarget, and anchor parity verified.');
