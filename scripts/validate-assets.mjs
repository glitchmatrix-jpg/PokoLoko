import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'public', 'assets', 'animations.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const required = ['idle', 'walk_left', 'walk_right', 'sit', 'sleep_transition', 'sleep_loop', 'wake', 'happy', 'confused', 'pet_reaction', 'dragged', 'landing'];
let frameCount = 0;
const errors = [];

for (const pet of ['poko', 'loko']) {
  if (!manifest[pet]) {
    errors.push(`Missing character manifest: ${pet}`);
    continue;
  }
  for (const animation of required) {
    const definition = manifest[pet][animation];
    if (!definition) {
      errors.push(`${pet}: missing animation '${animation}'`);
      continue;
    }
    if (!Number.isFinite(definition.fps) || definition.fps <= 0) errors.push(`${pet}/${animation}: invalid fps`);
    if (!Array.isArray(definition.frames) || definition.frames.length === 0) {
      errors.push(`${pet}/${animation}: no frames`);
      continue;
    }
    const dimensions = new Set();
    for (const relative of definition.frames) {
      if (relative.startsWith('/')) errors.push(`${pet}/${animation}: absolute path breaks packaged file URLs: ${relative}`);
      const file = path.join(root, 'public', relative);
      try {
        await stat(file);
        const buffer = await readFile(file);
        if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
          errors.push(`${pet}/${animation}: invalid PNG ${relative}`);
          continue;
        }
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        dimensions.add(`${width}x${height}`);
        frameCount += 1;
      } catch {
        errors.push(`${pet}/${animation}: missing frame ${relative}`);
      }
    }
    if (dimensions.size > 1) errors.push(`${pet}/${animation}: mixed frame sizes ${[...dimensions].join(', ')}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Asset validation passed: ${frameCount} PNG frames across 24 required animations.`);
