import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(process.argv[2] ?? '.');
const release = path.join(root, 'release');
const newline = String.fromCharCode(10);

fs.mkdirSync(release, { recursive: true });

const excluded = new Set(['BUILD_HASHES.txt']);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'win-unpacked') {
        walk(filePath);
      }
    } else if (!excluded.has(entry.name)) {
      files.push(filePath);
    }
  }
}

if (fs.existsSync(release)) {
  walk(release);
}

const additionalFiles = [
  path.join(root, 'package.json'),
  path.join(root, 'public/assets/runtime/runtime_manifest.json'),
  path.join(
    root,
    'archive/source-assets/user-supplied/Poko_Loko_Asset_Pack_v1(1).zip',
  ),
  path.join(root, 'build/pokoloko.ico'),
];

for (const filePath of additionalFiles) {
  if (fs.existsSync(filePath)) {
    files.push(filePath);
  }
}

const lines = [
  `PokoLoko build hashes generated ${new Date().toISOString()}`,
  'Algorithm: SHA-256',
  '',
];

for (const filePath of [...new Set(files)].sort()) {
  const hash = crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');

  const relativePath = path.relative(root, filePath).replaceAll('\\', '/');
  lines.push(`${hash}  ${relativePath}`);
}

fs.writeFileSync(
  path.join(release, 'BUILD_HASHES.txt'),
  lines.join(newline) + newline,
);

console.log(`Hashed ${files.length} files.`);
