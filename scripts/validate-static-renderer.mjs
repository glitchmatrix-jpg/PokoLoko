import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'electron/main/static-pet-controller.ts',
  'electron/services/display-grounding.ts',
  'electron/services/static-pet-assets.ts',
  'src/surfaces/PetSurface.tsx',
  'src/shared/assetUrl.ts',
  'docs/rendering/RENDERING_AND_SCALING.md',
  'docs/rendering/HIT_TESTING.md',
  'docs/rendering/DISPLAY_GROUNDING_TESTS.md',
  'tests/unit/display-grounding.test.ts',
  'tests/unit/asset-url.test.ts',
];
const failures = [];
for (const relative of required) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) failures.push(`missing ${relative}`);
  else if (fs.statSync(target).size < 100) failures.push(`too small ${relative}`);
}

const renderer = fs.readFileSync(path.join(root, 'src/surfaces/PetSurface.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const factory = fs.readFileSync(path.join(root, 'electron/main/window-factory.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
const contracts = fs.readFileSync(path.join(root, 'electron/preload/contracts.ts'), 'utf8');

const assertions = [
  [renderer.includes('getImageData'), 'renderer does not sample alpha'],
  [renderer.includes('presentation.spriteOffset'), 'renderer ignores sprite offset'],
  [renderer.includes('presentation.canvasSize * presentation.scale'), 'renderer does not use integer manifest scale'],
  [styles.includes('image-rendering: pixelated'), 'pixelated rendering missing'],
  [styles.includes('object-fit: fill'), 'fixed frame fill policy missing'],
  [factory.includes("backgroundColor: '#00000000'"), 'transparent native background missing'],
  [factory.includes('setIgnoreMouseEvents(true, { forward: true })'), 'initial mouse pass-through missing'],
  [controller.includes('computeStaticPetGeometry'), 'grounding geometry not used'],
  [controller.includes('loadStaticPetAsset'), 'authoritative manifest asset selection missing'],
  [contracts.includes('safeIntegerScaleSchema'), 'safe integer scale contract missing'],
];
for (const [ok, message] of assertions) if (!ok) failures.push(message);

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/runtime/runtime_manifest.json'), 'utf8'));
for (const id of ['poko_idle_blink', 'loko_idle_front']) {
  const animation = manifest.animations.find((entry) => entry.id === id);
  if (!animation) failures.push(`static animation missing: ${id}`);
  else if (animation.anchor.ground_y !== 112) failures.push(`unexpected ground anchor for ${id}`);
}

if (failures.length) {
  console.error('STEP 08 STATIC RENDERER VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('STEP 08 STATIC RENDERER VALIDATION PASSED');
console.log('Authoritative Poko/Loko frames, integer scaling, grounding, and alpha hit testing verified statically.');
