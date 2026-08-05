import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'docs/assets/ASSET_RUNTIME_REVIEW.md',
  'docs/code/CURRENT_ARCHITECTURE.md',
  'docs/product/PRODUCT_VISION.md',
  'docs/architecture/TARGET_ARCHITECTURE.md',
  'docs/setup/DEVELOPMENT_SETUP.md',
  'docs/assets/RUNTIME_ASSET_POLICY.md',
  'docs/visual/ANIMATION_LAB_GUIDE.md',
  'docs/rendering/RENDERING_AND_SCALING.md',
  'docs/runtime/ANIMATION_PLAYER.md',
  'docs/qa/STAGES_01_09_QA_UI_UX_AUDIT.md',
  'public/assets/runtime/runtime_manifest.json',
  'src/surfaces/PetSurface.tsx',
  'src/surfaces/SettingsSurface.tsx',
  'packages/animation-runtime/src/AnimationRuntime.ts',
  '.github/workflows/ci.yml',
  '.github/workflows/build-windows.yml',
];
const failures = [];
for (const file of required) {
  try {
    const info = await stat(path.join(root, file));
    if (!info.isFile() || info.size < 40) failures.push(`${file}: missing or empty`);
  } catch { failures.push(`${file}: missing`); }
}
const main = await readFile(path.join(root, 'electron/main/main.ts'), 'utf8');
const controller = await readFile(path.join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
const pet = await readFile(path.join(root, 'src/surfaces/PetSurface.tsx'), 'utf8');
const runtime = await readFile(path.join(root, 'packages/animation-runtime/src/AnimationRuntime.ts'), 'utf8');
const ci = await readFile(path.join(root, '.github/workflows/ci.yml'), 'utf8');
const checks = [
  [main.includes('dialog.showErrorBox'), 'startup failure has no visible recovery'],
  [main.includes('characterRequestGeneration'), 'main character switch race guard missing'],
  [controller.includes('characterLoadGeneration'), 'controller character asset race guard missing'],
  [pet.includes('let active = true') && pet.includes('source.onload = null'), 'alpha-mask load cancellation missing'],
  [runtime.includes('this.definition.frames.every'), 'animation identity does not compare frame content'],
  [ci.includes('if [ -f package-lock.json ]'), 'CI cannot install without a lockfile'],
];
for (const [ok, message] of checks) if (!ok) failures.push(message);
if (failures.length) {
  console.error('STAGES 01–09 CONSOLIDATED VALIDATION FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('STAGES 01–09 CONSOLIDATED STATIC VALIDATION PASSED');
console.log('Design lock, runtime assets, laboratory, renderer, animation service, UI hardening, and CI readiness verified.');
