import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'package.json', 'vite.config.ts', 'tsconfig.base.json', 'tsconfig.renderer.json',
  'tsconfig.electron.json', 'electron/main/main.ts', 'electron/main/window-factory.ts',
  'electron/preload/preload.ts', 'electron/preload/contracts.ts',
  'src/main.tsx', 'src/App.tsx', 'src/surfaces/PetSurface.tsx',
  'src/surfaces/SettingsSurface.tsx', 'src/surfaces/DiagnosticsSurface.tsx',
  'build/pokoloko.ico', 'public/brand/pokoloko.ico',
  '.github/workflows/ci.yml', 'docs/setup/DEVELOPMENT_SETUP.md',
  'docs/setup/BUILD_AND_PACKAGE.md', 'docs/setup/NATIVE_WINDOW_FLAGS.md'
];
const failures = [];
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) failures.push(`missing or empty: ${file}`);
}
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const script of ['dev','typecheck','lint','test','build','package:dir','package:win','smoke:package','validate']) {
  if (!packageJson.scripts?.[script]) failures.push(`missing script: ${script}`);
}
const main = fs.readFileSync(path.join(root, 'electron/main/main.ts'), 'utf8');
const windows = fs.readFileSync(path.join(root, 'electron/main/window-factory.ts'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'electron/preload/preload.ts'), 'utf8');
for (const token of ['contextIsolation: true','nodeIntegration: false','sandbox: true','transparent: true','skipTaskbar: true']) {
  if (!(main + windows).includes(token)) failures.push(`native/security token missing: ${token}`);
}
if (!preload.includes('contextBridge.exposeInMainWorld')) failures.push('typed preload bridge missing');
const allText = [...fs.readdirSync(path.join(root, 'electron'), { recursive: true }), ...fs.readdirSync(path.join(root, 'src'), { recursive: true })]
  .filter((entry) => typeof entry === 'string' && /\.(ts|tsx)$/.test(entry))
  .map((entry) => {
    const base = fs.existsSync(path.join(root, 'electron', entry)) ? 'electron' : 'src';
    return fs.readFileSync(path.join(root, base, entry), 'utf8');
  }).join('\n');
for (const forbidden of ['chooseBehavior(', 'scheduleBehavior(', 'WALKING_LEFT', 'WALKING_RIGHT', 'animations.json', 'sleepWeight']) {
  if (allText.includes(forbidden)) failures.push(`legacy behavior leaked: ${forbidden}`);
}
if (failures.length) {
  console.error('FOUNDATION STATIC VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log(`FOUNDATION STATIC VALIDATION PASSED (${required.length} required files)`);
console.log('No legacy behavior or old animation manifest is active.');
