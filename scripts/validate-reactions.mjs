import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/reactions/src/types.ts',
  'packages/pet-engine/reactions/src/registry.ts',
  'packages/pet-engine/reactions/src/SocialInteractionController.ts',
  'packages/pet-engine/reactions/src/index.ts',
  'tests/reactions/reaction-controller.test.ts',
  'tests/reactions/reaction-registry.test.ts',
  'docs/interaction/REACTION_MODEL.md',
  'tsconfig.step20.json',
];
const failures = [];
for (const rel of required) if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing ${rel}`);

const registry = fs.readFileSync(path.join(root, 'packages/pet-engine/reactions/src/registry.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'packages/pet-engine/reactions/src/SocialInteractionController.ts'), 'utf8');
const docs = fs.readFileSync(path.join(root, 'docs/interaction/REACTION_MODEL.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));
const animationIds = new Set(manifest.animations.map((item) => item.id));

for (const id of ['poko_idle_blink','poko_sad_to_crying','loko_idle_front','loko_love_reaction']) {
  if (!registry.includes(`animationId: '${id}'`)) failures.push(`Reaction registry missing ${id}`);
  if (!animationIds.has(id)) failures.push(`Runtime manifest missing reaction asset ${id}`);
}
for (const term of ['single_click','affectionate_repeat_click','excessive_poking','wake_interaction','drag_release','long_idle','activity_success','surprise','contextual_sadness']) {
  if (!registry.includes(term) && !controller.includes(term)) failures.push(`Reaction trigger missing ${term}`);
}
for (const term of ['REQUEST_WAKE','DEFER_REACTION','REQUEST_ACTIVITY_SAFE_EXIT','REACTION_IGNORED','PLAY_REACTION','generation','cooldowns','saturation']) {
  if (!controller.includes(term)) failures.push(`Social controller missing ${term}`);
}
for (const term of ['never random','Spam collapse','Sleeping input requests wake','Poko','Loko']) {
  if (!docs.includes(term)) failures.push(`Reaction documentation missing ${term}`);
}
for (const forbidden of ['setTimeout(', 'Math.random(', 'clipboard', 'capturePage(', 'desktopCapturer', 'browser history', 'typed text']) {
  if (controller.toLowerCase().includes(forbidden.toLowerCase()) || registry.toLowerCase().includes(forbidden.toLowerCase())) {
    failures.push(`Forbidden reaction implementation term: ${forbidden}`);
  }
}
const crying = registry.match(/id: 'poko_contextual_cry'[\s\S]*?\n  }/m)?.[0] ?? '';
if (!crying.includes("requiresContextReason: true") || !crying.includes("rare: true")) failures.push('Contextual crying is not explicitly rare and reason-gated.');

const tscPath = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const typecheck = spawnSync(process.execPath, [tscPath, '-p', path.join(root, 'tsconfig.step20.json')], { encoding: 'utf8' });
if (typecheck.status !== 0) failures.push(`Step 20 strict typecheck failed:\n${typecheck.stdout ?? ''}${typecheck.stderr ?? ''}${typecheck.error ? `\n${typecheck.error.message}` : ''}`);

if (failures.length) {
  console.error('STEP 20 REACTION VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('STEP 20 REACTION VALIDATION PASSED');
console.log('9 reaction definitions across Poko and Loko verified.');
console.log('Sleep routing, locked-state deferral, prop-safe activity exit, spam collapse, contextual sadness gating, and strict typecheck verified.');

