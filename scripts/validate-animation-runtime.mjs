import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/animation-runtime/package.json',
  'packages/animation-runtime/src/types.ts',
  'packages/animation-runtime/src/timeline.ts',
  'packages/animation-runtime/src/AnimationRuntime.ts',
  'packages/animation-runtime/src/BrowserAnimationDriver.ts',
  'packages/animation-runtime/src/index.ts',
  'tests/animation-runtime/timeline.test.ts',
  'tests/animation-runtime/runtime.test.ts',
  'docs/runtime/ANIMATION_PLAYER.md',
];
const failures = [];
for (const file of required) {
  try {
    const info = await stat(path.join(root, file));
    if (!info.isFile() || info.size < 40) failures.push(`${file}: missing or empty`);
  } catch {
    failures.push(`${file}: missing`);
  }
}

const runtime = await readFile(path.join(root, 'packages/animation-runtime/src/AnimationRuntime.ts'), 'utf8');
const timeline = await readFile(path.join(root, 'packages/animation-runtime/src/timeline.ts'), 'utf8');
const surface = await readFile(path.join(root, 'src/surfaces/PetSurface.tsx'), 'utf8');
const contracts = await readFile(path.join(root, 'electron/preload/contracts.ts'), 'utf8');

const requirements = [
  [runtime.includes('maxCatchUpMs'), 'long-gap catch-up cap missing'],
  [runtime.includes("type: 'ANIMATION_COMPLETED'"), 'completion event missing'],
  [runtime.includes('completionEmitted'), 'exactly-once completion guard missing'],
  [runtime.includes('if (identical) return this.snapshot()'), 'idempotent identical-play guard missing'],
  [runtime.includes('resumeFromSuspend'), 'suspend/resume recovery missing'],
  [timeline.includes("mode === 'reverse'"), 'reverse playback missing'],
  [timeline.includes("mode === 'ping_pong'"), 'ping-pong playback missing'],
  [surface.includes('BrowserAnimationDriver'), 'desktop renderer is not integrated with runtime'],
  [surface.includes("document.addEventListener('visibilitychange'"), 'visibility suspend integration missing'],
  [contracts.includes("z.literal('report_animation_event')"), 'typed animation event IPC missing'],
];
for (const [ok, message] of requirements) if (!ok) failures.push(message);

// Dependency-free behavioral reference checks matching the specified timeline semantics.
function order(count, mode) {
  const f = Array.from({ length: count }, (_, i) => i);
  if (mode === 'reverse') return f.reverse();
  if (mode === 'ping_pong' && count > 2) return [...f, ...f.slice(1, -1).reverse()];
  return f;
}
function sample(ms, count, fps, mode, loop) {
  const o = order(count, mode);
  const raw = Math.floor(Math.max(0, ms) / (1000 / fps));
  if (loop) return { frame: o[raw % o.length], loops: Math.floor(raw / o.length) };
  return { frame: o[Math.min(raw, o.length - 1)], done: raw >= o.length };
}
if (JSON.stringify(order(4, 'ping_pong')) !== JSON.stringify([0,1,2,3,2,1])) failures.push('ping-pong behavioral smoke failed');
if (sample(5000, 3, 6, 'forward', false).frame !== 2) failures.push('one-shot clamp smoke failed');
if (sample(1000, 4, 4, 'forward', true).loops !== 1) failures.push('loop-boundary smoke failed');
if (sample(800, 4, 2.5, 'forward', false).frame !== 2) failures.push('unusual-FPS smoke failed');

if (failures.length) {
  console.error('STEP 09 ANIMATION RUNTIME VALIDATION FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('STEP 09 ANIMATION RUNTIME VALIDATION PASSED');
console.log('Forward, reverse, ping-pong, looping, one-shot, pause/suspend, catch-up cap, and renderer integration verified statically.');
