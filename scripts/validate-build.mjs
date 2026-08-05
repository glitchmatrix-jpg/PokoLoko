import fs from 'node:fs';
import path from 'node:path';

const required = ['dist/index.html', 'dist-electron/electron/main/main.js', 'dist-electron/electron/preload/preload.js'];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) throw new Error(`Build validation failed; missing: ${missing.join(', ')}`);
const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
if (!html.includes('./assets/')) throw new Error('Renderer build does not use relative packaged asset paths.');
console.log(`Build validation passed (${required.length} required outputs).`);
