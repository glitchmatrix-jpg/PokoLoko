import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const planner = read('packages/pet-engine/behavior/src/planner.ts');
const types = read('packages/pet-engine/behavior/src/types.ts');
const runtime = read('packages/pet-engine/orchestration/src/LivingRuntimeController.ts');
const integration = read('packages/pet-engine/activities/src/integration.ts');

for (const token of [
  'poko_quiet_breathe', 'poko_notice_left', 'poko_notice_right', 'poko_ear_twitch',
  'poko_inspect_desktop', 'loko_quiet_watch', 'loko_attentive_pause', 'historyPenalty',
  "kind: 'ambient'", 'playAmbientStep', 'finishAmbientPhrase', 'cancelAmbientPhrase',
]) {
  if (!(planner + types + runtime).includes(token)) failures.push(`Missing ${token}`);
}
if ((planner + integration).includes('poko_idle_look_01')) failures.push('Quarantined poko_idle_look_01 remains in normal behavior code.');
for (const animation of ['poko_idle_breathe','poko_idle_glance_left','poko_idle_glance_right','poko_idle_ear_twitch']) {
  if (!planner.includes(animation)) failures.push(`Planner phrase missing ${animation}`);
}
if (!runtime.includes('this.ambientPhrase === null')) failures.push('Planner is not gated during an ambient phrase.');
if (!runtime.includes("rememberActivity(this.memory, phrase.phraseId")) failures.push('Ambient completion is not recorded in session memory.');
if (!planner.includes("immediateRepeat(input, ambient.id) ? 0")) failures.push('Ambient immediate-repeat prevention missing.');
if (!planner.includes('characterSpectacleScale')) failures.push('Large-activity restraint missing.');

if (failures.length) {
  console.error('STEP 4 INTENTION VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Step 4 intention validation passed');
console.log('Ambient phrases, recency memory, repetition suppression, quiet baselines, and asset quarantine verified');
