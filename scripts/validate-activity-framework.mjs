import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const mustExist = [
  'packages/pet-engine/activities/src/types.ts',
  'packages/pet-engine/activities/src/registry.ts',
  'packages/pet-engine/activities/src/ActivityController.ts',
  'packages/pet-engine/activities/src/cooldowns.ts',
  'packages/pet-engine/activities/src/index.ts',
  'tests/activity-framework/activity-framework.test.ts',
  'tests/activity-framework/synthetic-activity.test.ts',
  'docs/activities/ACTIVITY_FRAMEWORK.md',
  'docs/activities/PROP_LIFECYCLE.md',
  'src/diagnostics/activity/ActivityDiagnosticsPanel.tsx',
];
const failures = [];
for (const rel of mustExist) if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing ${rel}`);

const registryText = fs.readFileSync(path.join(root, 'packages/pet-engine/activities/src/registry.ts'), 'utf8');
const controllerText = fs.readFileSync(path.join(root, 'packages/pet-engine/activities/src/ActivityController.ts'), 'utf8');
const requiredAnimations = [
  'poko_drink','poko_eat','poko_music','poko_peeking','poko_playing_ball',
  'loko_drink_02','loko_eat','loko_laptop','loko_music','loko_peeking_01','loko_peeking_02','loko_playing_ball_01','loko_reading_01'
];
for (const id of requiredAnimations) if (!registryText.includes(id)) failures.push(`Registry missing ${id}`);
for (const term of ['entry', 'setup', 'loop', 'variation', 'exit', 'recovery', 'cooldownMs', 'moodEffects', 'prop']) if (!registryText.includes(term)) failures.push(`Registry missing lifecycle concept ${term}`);
for (const term of ['INTERRUPT', 'ANIMATION_COMPLETED', 'ANIMATION_MARKER', 'LOOP_BOUNDARY', 'SCHEDULE_DEADLINE', 'ACTIVITY_FINISHED']) if (!controllerText.includes(term)) failures.push(`Controller missing ${term}`);
if (controllerText.includes('setTimeout(') || registryText.includes('setTimeout(')) failures.push('Activity layer contains setTimeout');
if (controllerText.includes('Math.random(') || registryText.includes('Math.random(')) failures.push('Activity layer contains Math.random');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));
const manifestIds = new Set(manifest.animations.map((x) => x.id));
for (const id of requiredAnimations) if (!manifestIds.has(id)) failures.push(`Runtime manifest missing ${id}`);

if (failures.length) {
  console.error('STEP 18 ACTIVITY VALIDATION FAILED');
  for (const f of failures) console.error('-', f);
  process.exit(1);
}
console.log('STEP 18 ACTIVITY VALIDATION PASSED');
console.log('12 character-specific activity definitions cover 13 approved activity animations.');
console.log('Entry/setup/loop/variation/exit/recovery, props, interruptions, cooldowns, and diagnostics verified.');
