import { tuningFor } from '../../tuning/src/index.js';
import { CHARACTER_PROFILES } from './profiles.js';
import { randomRange, SeededRandom } from './random.js';
import type {
  ActivityId,
  AmbientPhraseId,
  AmbientStep,
  CandidateScore,
  PetIntention,
  PlannerDecision,
  PlannerInput,
  RandomSource,
  ScoreBreakdown,
  ScreenRegion,
} from './types.js';

const LEVEL = { calm: .7, balanced: 1, lively: 1.32 } as const;
const ACTIVITY_COOLDOWN: Readonly<Record<ActivityId, number>> = {
  drink: 180_000,
  eat: 360_000,
  laptop: 420_000,
  music: 360_000,
  peeking: 240_000,
  playing_ball: 420_000,
  reading: 420_000,
};

const AMBIENT_COOLDOWN: Readonly<Record<AmbientPhraseId, number>> = {
  poko_quiet_breathe: 4_000,
  poko_notice_left: 18_000,
  poko_notice_right: 18_000,
  poko_ear_twitch: 24_000,
  poko_inspect_desktop: 42_000,
  loko_quiet_watch: 5_000,
  loko_attentive_pause: 24_000,
};

const duration = (rng: RandomSource, min: number, max: number, scale: number): number =>
  randomRange(rng, min * scale, max * scale);

function lastTime(input: PlannerInput, key: string): number | undefined {
  return [...input.memory.recentActivities].reverse().find((item) => item.id === key)?.completedAtMs;
}

function recency(input: PlannerInput, key: string, cooldown: number): number {
  const time = lastTime(input, key);
  if (time === undefined) return 1;
  const age = input.nowMs - time;
  if (age < cooldown) return 0;
  return Math.min(1, .22 + (age - cooldown) / Math.max(cooldown, 1));
}

/** Penalise the full recent window, not merely the immediately previous choice. */
function historyPenalty(input: PlannerInput, key: string): number {
  const recent = input.memory.recentActivities.slice(-8).reverse();
  let penalty = 1;
  recent.forEach((item, index) => {
    if (item.id !== key) return;
    const strength = Math.max(.12, .52 - index * .07);
    penalty *= item.interrupted ? .82 : strength;
  });
  return Math.max(.08, penalty);
}

function immediateRepeat(input: PlannerInput, key: string): boolean {
  return input.memory.recentActivities.at(-1)?.id === key;
}

function score(
  base: number,
  physical: number,
  context: number,
  personality: number,
  drives: number,
  repetition: number,
  cooldown: number,
  activityLevel: number,
  reasons: string[],
): ScoreBreakdown {
  const finalScore = Math.max(0, base * physical * context * personality * drives * repetition * cooldown * activityLevel);
  return { base, physical, context, personality, drives, repetition, cooldown, activityLevel, finalScore, reasons };
}

function regionChoice(input: PlannerInput, rng: RandomSource): ScreenRegion {
  const options: ScreenRegion[] = ['left', 'center', 'right'];
  const recent = input.memory.recentRegions.slice(-2);
  const available = options.filter((region) => region !== input.currentRegion && !recent.includes(region));
  const fallback = options.filter((region) => region !== input.currentRegion);
  const source = available.length ? available : fallback;
  return source[rng.nextInt(source.length)] ?? 'center';
}

function ambientSteps(phraseId: AmbientPhraseId): readonly AmbientStep[] {
  switch (phraseId) {
    case 'poko_quiet_breathe':
      return [{ animationId: 'poko_idle_breathe', durationMs: 2_600, loop: true }];
    case 'poko_notice_left':
      return [
        { animationId: 'poko_idle_glance_left', durationMs: 620 },
        { animationId: 'poko_idle_blink', durationMs: 360 },
        { animationId: 'poko_idle_breathe', durationMs: 1_550, loop: true },
      ];
    case 'poko_notice_right':
      return [
        { animationId: 'poko_idle_glance_right', durationMs: 620 },
        { animationId: 'poko_idle_blink', durationMs: 360 },
        { animationId: 'poko_idle_breathe', durationMs: 1_550, loop: true },
      ];
    case 'poko_ear_twitch':
      return [
        { animationId: 'poko_idle_ear_twitch', durationMs: 720 },
        { animationId: 'poko_idle_breathe', durationMs: 1_350, loop: true },
      ];
    case 'poko_inspect_desktop':
      return [
        { animationId: 'poko_idle_glance_left', durationMs: 620 },
        { animationId: 'poko_idle_glance_right', durationMs: 620 },
        { animationId: 'poko_idle_blink', durationMs: 360 },
        { animationId: 'poko_idle_breathe', durationMs: 1_800, loop: true },
      ];
    case 'loko_quiet_watch':
      return [{ animationId: 'loko_idle_front', durationMs: 3_600, loop: true }];
    case 'loko_attentive_pause':
      return [{ animationId: 'loko_idle_front', durationMs: 2_500, loop: true }];
  }
}

function ambientIntention(phraseId: AmbientPhraseId): PetIntention {
  const steps = ambientSteps(phraseId);
  return { kind: 'ambient', phraseId, steps, durationMs: steps.reduce((sum, step) => sum + step.durationMs, 0) };
}

export class BehaviorPlanner {
  private readonly rng: RandomSource;

  public constructor(seedOrSource: number | RandomSource) {
    this.rng = typeof seedOrSource === 'number' ? new SeededRandom(seedOrSource) : seedOrSource;
  }

  public decide(input: PlannerInput): PlannerDecision {
    if (input.settings.paused) return { intention: null, seedState: this.rng.state(), candidates: [], reason: 'planner-paused' };

    const profile = CHARACTER_PROFILES[input.character];
    const level = LEVEL[input.settings.activityLevel];
    const tuning = tuningFor(input.character);
    const candidates: CandidateScore[] = [];
    const add = (key: string, breakdown: ScoreBreakdown, factory: (rng: RandomSource) => PetIntention): void => {
      if (breakdown.finalScore > 0) candidates.push({ key, breakdown, intentionFactory: factory });
    };
    const quiet = input.settings.quietMode || input.context.fullscreenActive || input.context.screenLocked;

    if (input.state === 'stable.sleeping') {
      const attention = input.context.recentUserInteraction === 'high' ? 2 : 1;
      add('wake', score(1, 1, attention, 1, Math.max(.2, input.mind.energy), 1, 1, 1, ['sleeping state allows wake']),
        (rng) => ({ kind: 'wake', durationMs: duration(rng, 800, 1_800, profile.durationScale) }));
    } else {
      const quietBias = quiet ? 1.9 : input.context.systemIdle ? 1.35 : 1;
      const idleRepeatPenalty = immediateRepeat(input, 'remain_idle') ? .4 : historyPenalty(input, 'remain_idle');
      add('idle', score(1, 1, quietBias, profile.intentionWeights.idle, .72 + input.mind.comfort * .75,
        idleRepeatPenalty, 1, input.settings.activityLevel === 'lively' ? .78 : 1,
        ['quiet time is valid behaviour', 'neutral holds prevent animation noise']),
      (rng) => {
        const [min, max] = tuning.behavior.idleHoldMs[input.settings.activityLevel];
        return { kind: 'remain_idle', durationMs: duration(rng, min, max, 1) };
      });

      const ambientCandidates: readonly Readonly<{ id: AmbientPhraseId; weight: number; reasons: readonly string[] }>[] = input.character === 'poko'
        ? [
            { id: 'poko_quiet_breathe', weight: quiet ? 2.3 : 1.45, reasons: ['breathing is Poko’s neutral baseline'] },
            { id: 'poko_notice_left', weight: input.context.pointerActivity === 'light' ? 1.4 : .68, reasons: ['light pointer movement can attract a glance'] },
            { id: 'poko_notice_right', weight: input.context.pointerActivity === 'light' ? 1.4 : .68, reasons: ['light pointer movement can attract a glance'] },
            { id: 'poko_ear_twitch', weight: .72 + input.mind.curiosity * .35, reasons: ['small irregular motion adds life without spectacle'] },
            { id: 'poko_inspect_desktop', weight: quiet ? .25 : .48 + input.mind.curiosity * .5, reasons: ['rare connected inspection phrase'] },
          ]
        : [
            { id: 'loko_quiet_watch', weight: quiet ? 2.5 : 1.7, reasons: ['Loko prefers sustained calm observation'] },
            { id: 'loko_attentive_pause', weight: input.context.typingActivity !== 'none' ? 1.25 : .58, reasons: ['typing context supports restrained attention'] },
          ];

      for (const ambient of ambientCandidates) {
        const cooldown = recency(input, ambient.id, AMBIENT_COOLDOWN[ambient.id]);
        const repeat = immediateRepeat(input, ambient.id) ? 0 : historyPenalty(input, ambient.id);
        add(`ambient:${ambient.id}`, score(1, 1, 1, ambient.weight, .8 + input.mind.comfort * .4,
          repeat, cooldown, 1, [...ambient.reasons, `recency=${repeat.toFixed(2)}`]),
        () => ambientIntention(ambient.id));
      }

      if (!quiet && input.state !== 'stable.sitting') {
        add('walk', score(1, 1, 1, profile.intentionWeights.walk,
          .25 + input.mind.energy * .38 + input.mind.curiosity * .27 + input.mind.boredom * .42,
          immediateRepeat(input, 'walk') ? 0 : historyPenalty(input, 'walk'), recency(input, 'walk', input.character === 'poko' ? 38_000 : 70_000), level,
          ['novelty and boredom support movement', `${input.character} movement cadence applied`]),
        (rng) => {
          const [min, max] = tuning.behavior.walkDurationMs[input.settings.activityLevel];
          return { kind: 'walk', destinationRegion: regionChoice(input, rng), durationMs: duration(rng, min, max, 1) };
        });
      }

      const sinceWake = input.nowMs - input.memory.lastWakeAtMs;
      const sleepCooldown = sinceWake < tuning.sleep.minimumAwakeAfterWakeMs ? 0 : 1;
      add('sleep', score(1, 1, input.context.localTimeBand === 'late_night' ? 1.45 : input.context.systemIdle ? 1.2 : .8,
        profile.intentionWeights.sleep, Math.max(.05, 1 - input.mind.energy) * 1.5,
        immediateRepeat(input, 'sleep') ? 0 : historyPenalty(input, 'sleep'), sleepCooldown,
        input.settings.activityLevel === 'lively' ? .75 : 1, ['energy and time band support rest']),
      (rng) => {
        const [min, max] = tuning.sleep.durationMs[input.settings.activityLevel];
        return { kind: 'sleep', durationMs: duration(rng, min, max, 1) };
      });

      if (input.mind.recentAttention > .25 && !quiet) {
        add('social', score(.72, 1, 1, profile.intentionWeights.social,
          .35 + input.mind.sociability + .42 * input.mind.recentAttention,
          immediateRepeat(input, 'social_reaction') ? 0 : historyPenalty(input, 'social_reaction'),
          recency(input, 'social_reaction', 30_000), 1, ['recent attention supports a restrained response']),
        (rng) => ({
          kind: 'social_reaction',
          reaction: input.mind.interruptionLoad > profile.interactionSaturation ? 'annoyed' : input.character === 'loko' ? 'subtle' : 'warm',
          durationMs: duration(rng, 900, 2_400, profile.durationScale),
        }));
      }

      for (const id of input.legalActivities) {
        if (quiet && !['reading', 'laptop', 'drink'].includes(id)) continue;
        let context = 1;
        const reasons: string[] = [];
        if (id === 'laptop' || id === 'reading') {
          context *= input.context.typingActivity === 'sustained' ? 1.8 : input.context.typingActivity === 'light' ? 1.25 : .8;
          reasons.push('typing/focus context');
        }
        if (id === 'music') {
          context *= input.context.audioActive ? 1.75 : .82;
          reasons.push('audio context');
        }
        if (id === 'playing_ball' || id === 'peeking') {
          context *= input.context.pointerActivity === 'busy' ? .55 : 1;
          reasons.push('play context');
        }
        const drive = id === 'reading' || id === 'laptop'
          ? .35 + input.mind.focus * 1.1
          : id === 'playing_ball' || id === 'music'
            ? .28 + input.mind.playfulness * .78 + input.mind.energy * .35
            : .48 + input.mind.boredom * .36;
        const integrationMultiplier = input.activityScoreMultipliers?.[id] ?? 1;
        if (integrationMultiplier <= 0) continue;
        const repeatPenalty = immediateRepeat(input, id) ? 0 : historyPenalty(input, id);
        const characterSpectacleScale = input.character === 'poko' ? .82 : .64;
        reasons.push(`integration=${integrationMultiplier.toFixed(2)}`, `memory=${repeatPenalty.toFixed(2)}`);
        const range = input.activityDurationOverrides?.[id] ?? [7_000, 22_000] as const;
        add(`activity:${id}`, score(.68, 1, context, profile.activityWeights[id] * integrationMultiplier,
          drive, repeatPenalty, recency(input, id, ACTIVITY_COOLDOWN[id]), level * characterSpectacleScale, reasons),
        (rng) => ({ kind: 'activity', activityId: id, durationMs: duration(rng, range[0], range[1], profile.durationScale) }));
      }
    }

    candidates.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
    if (!candidates.length) return { intention: null, seedState: this.rng.state(), candidates: [], reason: 'no-valid-candidate' };
    const total = candidates.reduce((sum, candidate) => sum + candidate.breakdown.finalScore, 0);
    let roll = this.rng.nextFloat() * total;
    let winner = candidates.at(-1)!;
    for (const candidate of candidates) {
      roll -= candidate.breakdown.finalScore;
      if (roll <= 0) { winner = candidate; break; }
    }
    return {
      intention: winner.intentionFactory(this.rng),
      seedState: this.rng.state(),
      candidates: candidates.map((candidate) => ({
        key: candidate.key,
        score: Number(candidate.breakdown.finalScore.toFixed(4)),
        reasons: candidate.breakdown.reasons,
      })),
      reason: `selected ${winner.key} from ${candidates.length} legal candidates`,
    };
  }
}
