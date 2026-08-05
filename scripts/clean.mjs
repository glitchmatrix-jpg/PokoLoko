import fs from 'node:fs';
for (const directory of ['dist', 'dist-electron']) fs.rmSync(directory, { recursive: true, force: true });
