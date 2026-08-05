import { tuningFor } from '../../tuning/src/index.js';
import type { CharacterId, SleepProfile } from './types.js';

export const SLEEP_PROFILES: Readonly<Record<CharacterId, SleepProfile>> = {
  poko: {
    character: 'poko',
    entryAnimationId: 'poko_sleep_transition',
    primaryLoopAnimationId: 'poko_sleep_loop_02',
    variationLoopAnimationIds: ['poko_sleep_loop_01'],
    wakeStrategy: 'reverse_entry_then_hold',
    wakeHoldMs: tuningFor('poko').sleep.wakeHoldMs,
    minSleepMs: 95_000,
    maxSleepMs: 360_000,
    minWakeProtectionMs: 180_000,
    energySleepThreshold: 0.30,
    lateNightBias: 0.28,
    idleBias: 0.12,
  },
  loko: {
    character: 'loko',
    entryAnimationId: 'loko_sleep_transition',
    primaryLoopAnimationId: 'loko_sleep_loop',
    variationLoopAnimationIds: [],
    wakeStrategy: 'lying_hold_then_neutral',
    wakeHoldMs: tuningFor('loko').sleep.wakeHoldMs,
    minSleepMs: 240_000,
    maxSleepMs: 900_000,
    minWakeProtectionMs: 240_000,
    energySleepThreshold: 0.27,
    lateNightBias: 0.34,
    idleBias: 0.18,
  },
};
