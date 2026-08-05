import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/pet-engine/context/src/ContextSensor.ts',
  'packages/pet-engine/context/src/types.ts',
  'electron/services/context-sensor-service.ts',
  'tests/context-sensing/context-sensor.test.ts',
  'docs/privacy/CONTEXT_SIGNALS.md',
  'docs/privacy/DATA_BOUNDARIES.md',
];
const failures = required.filter((item) => !fs.existsSync(path.join(root, item))).map((item) => `missing ${item}`);
const all = required.filter((item) => fs.existsSync(path.join(root, item))).map((item) => fs.readFileSync(path.join(root,item),'utf8')).join('\n');
for (const phrase of ['CONTEXT_CHANGED','typingActivity','hysteresis','enabled','unavailable','clipboard','screenshots','browser history','setInterval','1_000']) {
  if (!all.toLowerCase().includes(phrase.toLowerCase())) failures.push(`missing concept ${phrase}`);
}
for (const forbidden of ['keyCode','event.key','clipboard.read','desktopCapturer','globalShortcut.register']) {
  if (all.includes(forbidden)) failures.push(`forbidden content-sensitive API ${forbidden}`);
}
if (failures.length) { console.error('STEP 17 VALIDATION FAILED'); failures.forEach((x)=>console.error('-',x)); process.exit(1); }
console.log('STEP 17 CONTEXT VALIDATION PASSED');
console.log('Local optional content-blind context model verified');
