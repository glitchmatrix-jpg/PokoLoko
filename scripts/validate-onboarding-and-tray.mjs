import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'src/surfaces/SplashSurface.tsx', 'src/surfaces/OnboardingSurface.tsx',
  'docs/product/FIRST_RUN.md', 'docs/native/TRAY_BEHAVIOR.md',
  'tests/onboarding-and-tray/settings-migration.test.ts',
  'tests/onboarding-and-tray/contracts.test.ts',
  'public/brand/pokoloko.ico', 'public/brand/pokoloko_symbol.png',
  'public/brand/pokoloko_wordmark_horizontal.png', 'public/brand/pokoloko_wordmark_stacked.png',
];
const failures = [];
for (const rel of required) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) failures.push(`missing or empty: ${rel}`);
}
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const main = read('electron/main/main.ts');
const contracts = read('electron/preload/contracts.ts');
const settings = read('electron/services/settings-store.ts');
const factory = read('electron/main/window-factory.ts');
const app = read('src/App.tsx');
const splash = read('src/surfaces/SplashSurface.tsx');
const onboarding = read('src/surfaces/OnboardingSurface.tsx');
const styles = read('src/styles.css');
const controller = read('electron/main/static-pet-controller.ts');

const concepts = [
  [main, 'createSplashWindow'], [main, 'createOnboardingWindow'], [main, 'complete_onboarding'],
  [main, 'Move to this screen'], [main, 'Restart PokoLoko'], [main, 'Quit PokoLoko'],
  [main, "if (!tray || tray.isDestroyed())"], [main, 'screen.getCursorScreenPoint()'],
  [contracts, "z.literal('splash_complete')"], [contracts, "z.literal('complete_onboarding')"],
  [settings, 'CURRENT_SETTINGS_VERSION = 4'], [settings, 'onboardingComplete'], [settings, 'splashEnabled'],
  [factory, "loadSurface(window, 'pet', false)"], [app, '<SplashSurface />'], [app, '<OnboardingSurface />'],
  [splash, '1900'], [splash, 'pokoloko_wordmark_stacked.png'],
  [onboarding, 'Context, never content.'], [onboarding, 'You can switch anytime'],
  [styles, 'image-rendering:pixelated'], [styles, '@media(prefers-reduced-motion:reduce)'],
  [controller, 'moveToDisplay(display: Display)'],
];
for (const [text, term] of concepts) if (!text.includes(term)) failures.push(`required concept missing: ${term}`);

if ((main.match(/new Tray\(/g) ?? []).length !== 1) failures.push('tray must be constructed in exactly one location');
if (/typed text|clipboard|passwords|screenshots|browser history/.test(onboarding) === false) failures.push('privacy explanation incomplete');
if (splash.includes('setInterval')) failures.push('splash must not use an interval');
if (onboarding.includes('localStorage')) failures.push('onboarding must persist through authoritative settings, not localStorage');

if (failures.length) {
  console.error('STEP 22 VALIDATION FAILED');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('STEP 22 VALIDATION PASSED');
console.log('Splash, onboarding, tray identity, persistence, privacy, and lifecycle contracts verified');
