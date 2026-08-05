import { spawnSync } from 'node:child_process';

const commands = [
  ['node', ['scripts/validate-runtime-assets.mjs', '.']],
  ['node', ['scripts/validate-animation-lab.mjs', '.']],
  ['node', ['scripts/validate-static-renderer.mjs', '.']],
];
for (const [command, args] of commands) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('STEP 08 DEPENDENCY-FREE VALIDATION PASSED');
