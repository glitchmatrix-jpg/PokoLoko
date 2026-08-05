import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/locomotion/src/LocomotionEngine.ts',
  'packages/pet-engine/locomotion/src/profiles.ts',
  'packages/pet-engine/locomotion/src/types.ts',
  'packages/pet-engine/locomotion/src/index.ts',
  'tests/locomotion/locomotion-engine.test.ts',
  'tests/locomotion/profiles.test.ts',
  'docs/runtime/LOCOMOTION_ENGINE.md',
  'docs/runtime/WALK_SPEED_TUNING.md',
];
const failures = [];
for (const relative of required) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) failures.push(`missing ${relative}`);
  else if (fs.statSync(file).size < 40) failures.push(`unexpectedly small ${relative}`);
}

const engine = fs.readFileSync(path.join(root, required[0]), 'utf8');
const controller = fs.readFileSync(path.join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
const contracts = fs.readFileSync(path.join(root, 'electron/preload/contracts.ts'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'electron/preload/preload.ts'), 'utf8');
const main = fs.readFileSync(path.join(root, 'electron/main/main.ts'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));

for (const phrase of ['deltaSeconds', 'maximumDeltaMs', 'DESTINATION_REACHED', 'SCREEN_EDGE_REACHED', 'MOVEMENT_INTERRUPTED', 'brakingLimitedSpeed']) {
  if (!engine.includes(phrase)) failures.push(`engine missing ${phrase}`);
}
for (const phrase of ['setPosition(', 'performance.now()', 'moveToGroundX', 'createLocomotionProfile', 'animationFpsForTravelSpeed']) {
  if (!controller.includes(phrase)) failures.push(`controller missing ${phrase}`);
}
for (const phrase of ['move_pet_to', 'move_pet_by', 'stop_pet_movement', 'set_locomotion_activity_level']) {
  if (!contracts.includes(phrase) || !main.includes(phrase)) failures.push(`typed IPC integration missing ${phrase}`);
}
if (!preload.includes('onLocomotionEvent')) failures.push('preload locomotion event subscription missing');

for (const character of ['poko', 'loko']) {
  for (const direction of ['left', 'right']) {
    const id = `${character}_walk_${direction}`;
    const animation = manifest.animations.find((entry) => entry.id === id);
    if (!animation) failures.push(`runtime walk asset missing ${id}`);
    else if (!animation.movement?.suitable) failures.push(`runtime walk asset not movement-suitable ${id}`);
  }
}

// Dependency-free numerical reference checks for arrival and long-gap capping.
function clamp(value, minimum, maximum) { return Math.min(Math.max(value, minimum), maximum); }
function approach(current, target, maximumChange) {
  return current < target ? Math.min(current + maximumChange, target) : Math.max(current - maximumChange, target);
}
function simulate(deltas) {
  const profile = { max: 46, accel: 150, decel: 190, threshold: 0.35, maxDelta: 50 };
  let x = 100; let speed = 0; const destination = 600; let ticks = 0;
  while (Math.abs(destination - x) > profile.threshold && ticks < 5000) {
    const dt = Math.min(deltas[ticks % deltas.length], profile.maxDelta) / 1000;
    const distance = Math.abs(destination - x);
    const target = Math.min(profile.max, Math.sqrt(2 * profile.decel * distance));
    speed = approach(speed, target, (target < speed ? profile.decel : profile.accel) * dt);
    const step = speed * dt;
    if (step >= distance) x = destination;
    else x = clamp(x + step, -100, 900);
    ticks += 1;
  }
  if (Math.abs(destination - x) <= profile.threshold) x = destination;
  return { x, ticks };
}
const regular = simulate([16]);
const irregular = simulate([7, 31, 12, 19, 48]);
if (regular.x !== 600 || irregular.x !== 600) failures.push('reference simulation failed deterministic arrival');
if (regular.ticks >= 5000 || irregular.ticks >= 5000) failures.push('reference simulation did not converge');

if (failures.length) {
  console.error('STEP 10 LOCOMOTION VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('STEP 10 LOCOMOTION VALIDATION PASSED');
console.log('4 directional walk assets verified');
console.log(`regular arrival ticks: ${regular.ticks}`);
console.log(`irregular arrival ticks: ${irregular.ticks}`);
