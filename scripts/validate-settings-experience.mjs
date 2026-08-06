import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'src/surfaces/SettingsSurface.tsx', 'electron/services/settings-store.ts',
  'electron/preload/contracts.ts', 'docs/product/SETTINGS_REFERENCE.md',
  'docs/privacy/PRIVACY_CONTROLS.md', 'tests/settings/settings-schema.test.ts',
  'tests/settings/settings-contracts.test.ts', 'public/brand/pokoloko_wordmark_horizontal.png',
  'public/brand/pokoloko_symbol.png', 'build/pokoloko.ico',
];
const failures = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing ${file}`);
const surface = fs.readFileSync(path.join(root, 'src/surfaces/SettingsSurface.tsx'), 'utf8');
const store = fs.readFileSync(path.join(root, 'electron/services/settings-store.ts'), 'utf8');
const contracts = fs.readFileSync(path.join(root, 'electron/preload/contracts.ts'), 'utf8');
for (const term of ['Character selection','Activity rhythm','Walking pace','Reduced motion','Context awareness','Open PokoLoko when I sign in','Restore all defaults']) if (!surface.includes(term)) failures.push(`settings UI missing ${term}`);
for (const term of ['walkingSpeed','animationSpeed','launchAtStartup','reducedMotion','fullscreenBehavior','migrateSettings']) if (!store.includes(term)) failures.push(`settings store missing ${term}`);
for (const term of ['set_walking_speed','set_launch_at_startup','set_reduced_motion','reset_settings_defaults','reset_character_behavior']) if (!contracts.includes(term)) failures.push(`IPC contract missing ${term}`);
if (surface.includes('object-fit: contain')) failures.push('unsafe sprite object-fit introduced');
if (failures.length) { console.error('STEP 21 SETTINGS VALIDATION FAILED'); failures.forEach((f) => console.error('-', f)); process.exit(1); }
console.log('STEP 21 SETTINGS VALIDATION PASSED');
console.log(`${required.length} required settings artifacts verified`);
