import { SLEEP_PROFILES } from './profiles.js';
import type { CharacterId, SleepContext, SleepSettings } from './types.js';

export type SleepEligibility = Readonly<{
  eligible: boolean;
  score: number;
  reasons: readonly string[];
}>;

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

export function isHourInQuietRange(hour: number, start: number, end: number): boolean {
  if (start === end) return true;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

export function scoreSleepEligibility(
  character: CharacterId,
  context: SleepContext,
  settings: SleepSettings,
  localHour: number,
): SleepEligibility {
  const profile = SLEEP_PROFILES[character];
  const reasons: string[] = [];
  if (context.wakeDurationMs < profile.minWakeProtectionMs) {
    return { eligible: false, score: 0, reasons: ['post-wake protection active'] };
  }
  if (context.recentHighInteraction) reasons.push('recent interaction lowers sleep likelihood');
  let score = clamp((profile.energySleepThreshold - context.energy) * 2.4 + 0.18);
  if (context.timeBand === 'late_night') { score += profile.lateNightBias; reasons.push('late-night bias'); }
  if (context.systemIdle) { score += profile.idleBias; reasons.push('system idle'); }
  const quietHours = settings.quietHoursEnabled && isHourInQuietRange(localHour, settings.quietHoursStart, settings.quietHoursEnd);
  if (quietHours || context.quietMode) { score += 0.10; reasons.push('quiet context'); }
  if (!settings.dailyRhythmEnabled) { score -= profile.lateNightBias; reasons.push('daily rhythm disabled'); }
  if (context.recentHighInteraction) score -= 0.22;
  score = clamp(score);
  if (context.energy > 0.72 && !context.systemIdle) reasons.push('high energy');
  return { eligible: score >= 0.32, score, reasons };
}
