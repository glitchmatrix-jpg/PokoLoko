import fs from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredFiles = ['dist/index.html', packageJson.main, 'build/pokoloko.ico'];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) throw new Error(`Package smoke failed; missing ${missing.join(', ')}`);
if (!packageJson.build?.files?.includes('dist/**/*')) throw new Error('electron-builder renderer inclusion is missing.');
if (!packageJson.build?.files?.includes('dist-electron/**/*')) throw new Error('electron-builder main inclusion is missing.');
console.log('Package smoke test passed: build outputs, entrypoint, icon, and builder inclusion verified.');
