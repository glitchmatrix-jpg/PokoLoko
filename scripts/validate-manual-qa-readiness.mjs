import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'packages/performance-monitor/src/PerformanceSampler.ts',
  'tests/performance/performance-sampler.test.ts',
  'docs/qa/MANUAL_QA_MATRIX.md',
  'docs/qa/LONG_SESSION_REPORT.md',
  'docs/qa/PERFORMANCE_REPORT.md',
  'docs/qa/RELEASE_BLOCKERS.md',
  'reports/performance/synthetic-baseline.json',
  '.github/workflows/windows-manual-qa-build.yml',
];
const failures = required.filter((file) => !fs.existsSync(path.join(root, file))).map((file) => `missing ${file}`);
const traceDir = path.join(root, 'docs/qa/traces');
const traces = fs.existsSync(traceDir) ? fs.readdirSync(traceDir).filter((file) => file.endsWith('.json')) : [];
if (traces.length < 6) failures.push(`expected at least 6 diagnostic trace templates; found ${traces.length}`);
const controller = fs.readFileSync(path.join(root, 'electron/main/static-pet-controller.ts'), 'utf8');
for (const token of ['PerformanceSampler', 'startPerformanceSampling', 'stopPerformanceSampling', 'noteWindowMove', 'performance:this.performanceSampler.summarize()']) {
  if (!controller.includes(token)) failures.push(`static controller missing ${token}`);
}
const blockers = fs.readFileSync(path.join(root, 'docs/qa/RELEASE_BLOCKERS.md'), 'utf8');
if (!blockers.includes('OPEN — NATIVE WINDOWS EXECUTION REQUIRED')) failures.push('native Windows blocker is not explicitly open');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if ((packageJson.scripts.validate.match(/validate:automated-tests/g) ?? []).length !== 1) failures.push('validate chain repeats automated-test validator');
if (failures.length) {
  console.error('STEP 26 READINESS VALIDATION FAILED'); failures.forEach((f) => console.error('-', f)); process.exit(1);
}
console.log(`Step 26 manual-QA readiness validation passed (${traces.length} trace templates).`);
