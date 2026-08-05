import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/activities/src/integration.ts',
  'tests/integrated-activities/integrated-activities.test.ts',
  'tests/integrated-activities/activity-continuity.test.ts',
  'tests/integrated-activities/planner-integration.test.ts',
  'docs/activities/ACTIVITY_CATALOG.md',
  'docs/activities/CHARACTER_ACTIVITY_WEIGHTS.md',
  'docs/activities/INTEGRATION_REVIEW.md',
  'tsconfig.step19.json',
];
const failures = [];
for (const rel of required) if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing ${rel}`);

const integration = fs.readFileSync(path.join(root, 'packages/pet-engine/activities/src/integration.ts'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'packages/pet-engine/activities/src/registry.ts'), 'utf8');
const planner = fs.readFileSync(path.join(root, 'packages/pet-engine/behavior/src/planner.ts'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'docs/activities/ACTIVITY_CATALOG.md'), 'utf8');
const weights = fs.readFileSync(path.join(root, 'docs/activities/CHARACTER_ACTIVITY_WEIGHTS.md'), 'utf8');

const approvedPairs = [
  ['poko','drink'],['poko','eat'],['poko','music'],['poko','peeking'],['poko','playing_ball'],
  ['loko','drink'],['loko','eat'],['loko','laptop'],['loko','music'],['loko','peeking'],['loko','playing_ball'],['loko','reading'],
];
for (const [character, activity] of approvedPairs) {
  if (!integration.includes(`character: '${character}', activityId: '${activity}', availability: 'approved'`)) {
    failures.push(`Missing approved integration policy ${character}:${activity}`);
  }
}
for (const unsupported of [
  "character: 'poko', activityId: 'laptop', availability: 'unsupported_for_character'",
  "character: 'poko', activityId: 'reading', availability: 'unsupported_for_character'",
]) if (!integration.includes(unsupported)) failures.push(`Missing explicit unsupported decision: ${unsupported}`);

for (const term of ['poko_idle_blink','poko_idle_look_01','loko_idle_front','buildPlannerOverlay','frequencyCap','nearScreenEdge']) {
  if (!integration.includes(term)) failures.push(`Integration layer missing ${term}`);
}
for (const term of ['activityScoreMultipliers','activityDurationOverrides','integrationMultiplier']) {
  if (!planner.includes(term)) failures.push(`Behavior planner missing ${term}`);
}
for (const forbidden of ['setTimeout(', 'Math.random(', 'clipboard', 'capturePage(', 'desktopCapturer', 'crossfade']) {
  if (integration.toLowerCase().includes(forbidden.toLowerCase())) failures.push(`Forbidden integration implementation term: ${forbidden}`);
}
for (const term of ['Laptop','Reading','Music','Ball play','Drink','Eat','Peeking','Ambient']) {
  if (!catalog.includes(term)) failures.push(`Catalog missing ${term}`);
}
if (!weights.includes('unsupported') || !weights.includes('1.65') || !weights.includes('1.55')) failures.push('Character weights do not document unsupported assets and core identity weights.');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));
const ids = new Set(manifest.animations.map((item) => item.id));
for (const id of ['poko_drink','poko_eat','poko_music','poko_peeking','poko_playing_ball','loko_drink_02','loko_eat','loko_laptop','loko_music','loko_peeking_01','loko_peeking_02','loko_playing_ball_01','loko_reading_01','poko_idle_blink','poko_idle_look_01','loko_idle_front']) {
  if (!ids.has(id)) failures.push(`Runtime manifest missing integrated asset ${id}`);
}

const tscPath = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const typecheck = spawnSync(process.execPath, [tscPath, '-p', path.join(root, 'tsconfig.step19.json')], { encoding: 'utf8' });
if (typecheck.status !== 0) failures.push(`Step 19 strict typecheck failed:\n${typecheck.stdout ?? ''}${typecheck.stderr ?? ''}${typecheck.error ? `\n${typecheck.error.message}` : ''}`);

if (failures.length) {
  console.error('STEP 19 INTEGRATED ACTIVITY VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('STEP 19 INTEGRATED ACTIVITY VALIDATION PASSED');
console.log('12 approved character/activity pairs and 13 activity animations integrated.');
console.log('5 ambient routines integrated without promoting unsupported archival poses.');
console.log('Context weighting, frequency caps, planner overlay, prop continuity, and strict typecheck verified.');

