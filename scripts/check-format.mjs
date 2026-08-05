import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const ignored = new Set(['node_modules', 'dist', 'dist-electron', 'release', 'coverage', '.git', 'archive']);
const checkedExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml', '.css', '.html']);
const failures = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (checkedExtensions.has(path.extname(entry.name))) await check(full);
  }
}

async function check(file) {
  const text = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  if (text.length && !text.endsWith('\n')) failures.push(`${relative}: missing final newline`);
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) failures.push(`${relative}:${index + 1}: trailing whitespace`);
  });
  if (path.extname(file) === '.json') {
    try { JSON.parse(text); } catch (error) { failures.push(`${relative}: invalid JSON (${error.message})`); }
  }
}

await walk(root);
if (failures.length) {
  console.error('FORMAT HYGIENE CHECK FAILED');
  failures.slice(0, 100).forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('FORMAT HYGIENE CHECK PASSED');

