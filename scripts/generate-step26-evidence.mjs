import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const traceDir = path.join(root, 'docs/qa/traces');
const reportDir = path.join(root, 'reports/performance');
fs.mkdirSync(traceDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const scenarios = [
  ['grounding-single-100', 2601, ['force_idle', 'force_walk', 'simulate_display_change', 'stop_movement']],
  ['mixed-dpi-display-recovery', 2602, ['force_walk', 'simulate_display_change', 'force_idle']],
  ['drag-sleep-wake', 2603, ['force_sleep', 'complete_drag', 'force_wake', 'force_idle']],
  ['activity-prop-interruption', 2604, ['force_activity', 'complete_drag', 'force_idle']],
  ['character-switch-mid-motion', 2605, ['force_walk', 'set_character', 'force_idle']],
  ['pause-resume-fullscreen', 2606, ['set_paused', 'set_context', 'set_paused', 'force_idle']],
];
for (const [name, seed, commands] of scenarios) {
  const events = commands.map((type, index) => ({
    sequence: index + 1,
    monotonicMs: index * 1000,
    category: 'diagnostic',
    severity: 'info',
    name: `qa-template:${type}`,
    details: { evidenceClass: 'deterministic-template-not-native-capture', scenario: name },
    replayCommand: type === 'force_walk' ? { type, region: 'right', durationMs: 4000 }
      : type === 'force_activity' ? { type, activityId: 'reading', durationMs: 8000 }
      : type === 'set_character' ? { type, character: 'loko' }
      : type === 'set_paused' ? { type, paused: index === 0 }
      : type === 'set_context' ? { type, patch: { fullscreenActive: true } }
      : { type },
  }));
  fs.writeFileSync(path.join(traceDir, `${name}.json`), JSON.stringify({
    format: 'pokoloko-diagnostic-trace', version: 1, exportedAtIso: '1970-01-01T00:00:00.000Z', seed, evidenceClass: 'template', events,
  }, null, 2));
}

const synthetic = {
  evidenceClass: 'deterministic-synthetic-baseline',
  warning: 'Not a measurement of Electron, Windows, DWM, GPU, tray, or packaged executable performance.',
  scenarios: [
    { mode: 'idle', durationMinutes: 180, samples: 2160, timerGrowth: 0, listenerGrowth: 0, simulatedMemoryGrowthBytes: 0 },
    { mode: 'walking', durationMinutes: 60, samples: 720, timerGrowth: 0, listenerGrowth: 0, simulatedMovementTicks: 225000 },
    { mode: 'mixed-behavior', durationMinutes: 240, samples: 2880, timerGrowth: 0, listenerGrowth: 0, maximumIdenticalActionStreak: 2 },
  ],
};
fs.writeFileSync(path.join(reportDir, 'synthetic-baseline.json'), JSON.stringify(synthetic, null, 2));
console.log('Generated Step 26 trace templates and synthetic baseline evidence.');
