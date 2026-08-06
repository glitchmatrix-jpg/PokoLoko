import { getActivityDefinition } from './registry.js';
import type { ActivityDefinition, ActivityId, CharacterId, InterruptionLevel } from './types.js';

export type ActivityLevel = 'calm' | 'balanced' | 'lively';
export type ScreenRegion = 'left' | 'center' | 'right';
export type ContextSnapshot = Readonly<{
  enabled: boolean;
  typingActivity: 'none' | 'light' | 'sustained';
  pointerActivity: 'none' | 'light' | 'busy';
  systemIdle: boolean;
  audioActive: boolean;
  fullscreenActive: boolean;
  screenLocked: boolean;
  recentUserInteraction: 'none' | 'light' | 'high';
}>;

export type MindSnapshot = Readonly<{
  energy: number;
  playfulness: number;
  focus: number;
  curiosity: number;
  comfort: number;
  boredom: number;
}>;

export type ActivityHistoryItem = Readonly<{
  activityId: ActivityId;
  character: CharacterId;
  completedAtMs: number;
  interrupted: boolean;
}>;

export type AmbientRoutineId =
  | 'poko_blink'
  | 'poko_glance_left'
  | 'poko_glance_right'
  | 'poko_ear_twitch'
  | 'poko_quiet_breathe'
  | 'poko_calm_hold'
  | 'loko_calm_idle'
  | 'loko_attentive_hold';

export type AmbientRoutine = Readonly<{
  id: AmbientRoutineId;
  character: CharacterId;
  animationId?: string;
  category: 'ambient';
  legalStates: readonly string[];
  legalPostures: readonly string[];
  minIntervalMs: number;
  maxIntervalMs: number;
  durationMs: readonly [number, number];
  interruption: InterruptionLevel;
  weight: number;
  notes: readonly string[];
}>;

export const AMBIENT_ROUTINES: readonly AmbientRoutine[] = [
  {
    id: 'poko_blink', character: 'poko', animationId: 'poko_idle_blink', category: 'ambient',
    legalStates: ['stable.idle_front'], legalPostures: ['standing_front'], minIntervalMs: 5_500, maxIntervalMs: 15_000,
    durationMs: [250, 650], interruption: 'soft', weight: 1.3,
    notes: ['Uses the approved two-frame blink loop as a brief phrase, never as an endless metronome.'],
  },
  {
    id: 'poko_quiet_breathe', character: 'poko', animationId: 'poko_idle_breathe', category: 'ambient',
    legalStates: ['stable.idle_front'], legalPostures: ['standing_front'], minIntervalMs: 4_000, maxIntervalMs: 12_000,
    durationMs: [1_800, 3_400], interruption: 'soft', weight: 1.65,
    notes: ['Primary neutral baseline. Quiet breathing is allowed to be the whole behavior.'],
  },
  {
    id: 'poko_glance_left', character: 'poko', animationId: 'poko_idle_glance_left', category: 'ambient',
    legalStates: ['stable.idle_front'], legalPostures: ['standing_front'], minIntervalMs: 16_000, maxIntervalMs: 38_000,
    durationMs: [500, 900], interruption: 'soft', weight: .78,
    notes: ['True directional glance replacing the quarantined head-shake-looking asset.'],
  },
  {
    id: 'poko_glance_right', character: 'poko', animationId: 'poko_idle_glance_right', category: 'ambient',
    legalStates: ['stable.idle_front'], legalPostures: ['standing_front'], minIntervalMs: 16_000, maxIntervalMs: 38_000,
    durationMs: [500, 900], interruption: 'soft', weight: .78,
    notes: ['Paired directional glance with recency memory to avoid repetition.'],
  },
  {
    id: 'poko_ear_twitch', character: 'poko', animationId: 'poko_idle_ear_twitch', category: 'ambient',
    legalStates: ['stable.idle_front'], legalPostures: ['standing_front'], minIntervalMs: 22_000, maxIntervalMs: 52_000,
    durationMs: [550, 900], interruption: 'soft', weight: .62,
    notes: ['Rare micro-motion; never repeated back-to-back.'],
  },
  {
    id: 'poko_calm_hold', character: 'poko', category: 'ambient',
    legalStates: ['stable.idle_front', 'stable.idle_side'], legalPostures: ['standing_front', 'standing_side'], minIntervalMs: 12_000, maxIntervalMs: 34_000,
    durationMs: [900, 2_300], interruption: 'immediate', weight: .75,
    notes: ['Runtime hold on the current anchor-correct neutral frame; no fabricated animation.'],
  },
  {
    id: 'loko_calm_idle', character: 'loko', animationId: 'loko_idle_front', category: 'ambient',
    legalStates: ['stable.idle_front', 'stable.sitting'], legalPostures: ['standing_front', 'sitting'], minIntervalMs: 8_000, maxIntervalMs: 24_000,
    durationMs: [1_200, 3_800], interruption: 'soft', weight: 1.35,
    notes: ['Longer calm phrase supports Loko’s deliberate rhythm.'],
  },
  {
    id: 'loko_attentive_hold', character: 'loko', category: 'ambient',
    legalStates: ['stable.idle_front', 'stable.sitting'], legalPostures: ['standing_front', 'sitting'], minIntervalMs: 14_000, maxIntervalMs: 38_000,
    durationMs: [1_300, 3_200], interruption: 'immediate', weight: .9,
    notes: ['Neutral hold used as an attentive pause during quiet or typing context.'],
  },
] as const;

export type IntegratedActivityPolicy = Readonly<{
  character: CharacterId;
  activityId: ActivityId;
  availability: 'approved' | 'unsupported_for_character' | 'quarantined';
  personalityWeight: number;
  spontaneousWeight: number;
  contextWeights: Readonly<{
    typingNone: number;
    typingLight: number;
    typingSustained: number;
    audioActive: number;
    quiet: number;
    systemIdle: number;
    pointerBusy: number;
    nearEdge: number;
  }>;
  preferredDurationMs?: readonly [number, number];
  frequencyCap: Readonly<{ minimumGapMs: number; maximumStartsPerHour: number }>;
  notes: readonly string[];
}>;

const policies: readonly IntegratedActivityPolicy[] = [
  {
    character: 'poko', activityId: 'laptop', availability: 'unsupported_for_character', personalityWeight: 0, spontaneousWeight: 0,
    contextWeights: { typingNone: 0, typingLight: 0, typingSustained: 0, audioActive: 1, quiet: 1, systemIdle: 1, pointerBusy: 1, nearEdge: 1 },
    frequencyCap: { minimumGapMs: 0, maximumStartsPerHour: 0 },
    notes: ['No authoritative Poko laptop animation exists; do not fabricate or recolor Loko assets.'],
  },
  {
    character: 'poko', activityId: 'reading', availability: 'unsupported_for_character', personalityWeight: 0, spontaneousWeight: 0,
    contextWeights: { typingNone: 0, typingLight: 0, typingSustained: 0, audioActive: 1, quiet: 1, systemIdle: 1, pointerBusy: 1, nearEdge: 1 },
    frequencyCap: { minimumGapMs: 0, maximumStartsPerHour: 0 },
    notes: ['No authoritative Poko reading animation exists.'],
  },
  {
    character: 'poko', activityId: 'music', availability: 'approved', personalityWeight: 1.35, spontaneousWeight: .65,
    contextWeights: { typingNone: 1, typingLight: .85, typingSustained: .65, audioActive: 1.75, quiet: .15, systemIdle: .75, pointerBusy: .9, nearEdge: 1 },
    preferredDurationMs: [5_000, 13_000], frequencyCap: { minimumGapMs: 180_000, maximumStartsPerHour: 3 },
    notes: ['Audio presence raises probability; it never forces music.'],
  },
  {
    character: 'poko', activityId: 'playing_ball', availability: 'approved', personalityWeight: 1.55, spontaneousWeight: 1.2,
    contextWeights: { typingNone: 1, typingLight: .75, typingSustained: .45, audioActive: 1, quiet: .05, systemIdle: .8, pointerBusy: .7, nearEdge: .55 },
    preferredDurationMs: [6_000, 12_000], frequencyCap: { minimumGapMs: 300_000, maximumStartsPerHour: 2 },
    notes: ['Primary Poko play signature; requires a comfortable region and prop-safe completion.'],
  },
  {
    character: 'poko', activityId: 'drink', availability: 'approved', personalityWeight: .85, spontaneousWeight: .75,
    contextWeights: { typingNone: 1, typingLight: .95, typingSustained: .75, audioActive: 1, quiet: 1.05, systemIdle: 1.1, pointerBusy: .8, nearEdge: .85 },
    frequencyCap: { minimumGapMs: 180_000, maximumStartsPerHour: 3 }, notes: ['Ambient routine only; no thirst meter.'],
  },
  {
    character: 'poko', activityId: 'eat', availability: 'approved', personalityWeight: .95, spontaneousWeight: .8,
    contextWeights: { typingNone: 1, typingLight: .9, typingSustained: .7, audioActive: 1, quiet: 1.05, systemIdle: 1.1, pointerBusy: .75, nearEdge: .8 },
    frequencyCap: { minimumGapMs: 360_000, maximumStartsPerHour: 2 }, notes: ['Ambient routine only; no hunger or guilt mechanics.'],
  },
  {
    character: 'poko', activityId: 'peeking', availability: 'approved', personalityWeight: 1.35, spontaneousWeight: 1.05,
    contextWeights: { typingNone: 1, typingLight: .9, typingSustained: .7, audioActive: 1, quiet: .55, systemIdle: .95, pointerBusy: .75, nearEdge: 2.1 },
    frequencyCap: { minimumGapMs: 240_000, maximumStartsPerHour: 2 }, notes: ['Eligible only with real work-area edge alignment.'],
  },
  {
    character: 'loko', activityId: 'laptop', availability: 'approved', personalityWeight: 1.55, spontaneousWeight: .35,
    contextWeights: { typingNone: .35, typingLight: 1.25, typingSustained: 1.9, audioActive: .9, quiet: 1.15, systemIdle: .55, pointerBusy: .65, nearEdge: .75 },
    preferredDurationMs: [14_000, 42_000], frequencyCap: { minimumGapMs: 360_000, maximumStartsPerHour: 3 },
    notes: ['Typing presence is a weighted influence only; sessions are longer and calmer than Poko’s unsupported concept.'],
  },
  {
    character: 'loko', activityId: 'reading', availability: 'approved', personalityWeight: 1.65, spontaneousWeight: .55,
    contextWeights: { typingNone: .9, typingLight: 1.25, typingSustained: 1.6, audioActive: .7, quiet: 1.35, systemIdle: 1.05, pointerBusy: .55, nearEdge: .7 },
    preferredDurationMs: [14_000, 40_000], frequencyCap: { minimumGapMs: 300_000, maximumStartsPerHour: 3 },
    notes: ['Quiet/focus signature activity; page-safe exit remains mandatory.'],
  },
  {
    character: 'loko', activityId: 'music', availability: 'approved', personalityWeight: .88, spontaneousWeight: .35,
    contextWeights: { typingNone: 1, typingLight: .8, typingSustained: .55, audioActive: 1.55, quiet: .2, systemIdle: .8, pointerBusy: .85, nearEdge: 1 },
    preferredDurationMs: [6_000, 15_000], frequencyCap: { minimumGapMs: 300_000, maximumStartsPerHour: 2 },
    notes: ['Restrained frequency; more listening than exuberant repetition.'],
  },
  {
    character: 'loko', activityId: 'playing_ball', availability: 'approved', personalityWeight: .52, spontaneousWeight: .28,
    contextWeights: { typingNone: 1, typingLight: .6, typingSustained: .3, audioActive: 1, quiet: .05, systemIdle: .65, pointerBusy: .7, nearEdge: .5 },
    preferredDurationMs: [6_000, 11_000], frequencyCap: { minimumGapMs: 600_000, maximumStartsPerHour: 1 },
    notes: ['Rare surprise, never a dominant Loko routine.'],
  },
  {
    character: 'loko', activityId: 'drink', availability: 'approved', personalityWeight: .95, spontaneousWeight: .65,
    contextWeights: { typingNone: 1, typingLight: .95, typingSustained: .8, audioActive: 1, quiet: 1.15, systemIdle: 1.1, pointerBusy: .7, nearEdge: .75 },
    frequencyCap: { minimumGapMs: 210_000, maximumStartsPerHour: 3 }, notes: ['Deliberate settled routine; no thirst meter.'],
  },
  {
    character: 'loko', activityId: 'eat', availability: 'approved', personalityWeight: .86, spontaneousWeight: .55,
    contextWeights: { typingNone: 1, typingLight: .85, typingSustained: .65, audioActive: 1, quiet: 1.15, systemIdle: 1.1, pointerBusy: .65, nearEdge: .75 },
    frequencyCap: { minimumGapMs: 420_000, maximumStartsPerHour: 2 }, notes: ['Quiet ambient routine; no hunger meter.'],
  },
  {
    character: 'loko', activityId: 'peeking', availability: 'approved', personalityWeight: .68, spontaneousWeight: .42,
    contextWeights: { typingNone: 1, typingLight: .8, typingSustained: .6, audioActive: 1, quiet: .5, systemIdle: .9, pointerBusy: .7, nearEdge: 1.9 },
    frequencyCap: { minimumGapMs: 420_000, maximumStartsPerHour: 1 }, notes: ['Lower frequency and longer observation than Poko.'],
  },
] as const;

const byKey = new Map(policies.map((item) => [`${item.character}:${item.activityId}`, item]));

export function getIntegratedActivityPolicy(character: CharacterId, activityId: ActivityId): IntegratedActivityPolicy | undefined {
  return byKey.get(`${character}:${activityId}`);
}

export function getApprovedIntegratedActivities(character: CharacterId): readonly ActivityDefinition[] {
  return policies
    .filter((item) => item.character === character && item.availability === 'approved')
    .map((item) => getActivityDefinition(character, item.activityId))
    .filter((item): item is ActivityDefinition => Boolean(item));
}

export type EligibilityInput = Readonly<{
  character: CharacterId;
  activityId: ActivityId;
  nowMs: number;
  state: string;
  posture: string;
  currentRegion: ScreenRegion;
  nearScreenEdge: boolean;
  activityLevel: ActivityLevel;
  quietMode: boolean;
  context: ContextSnapshot;
  mind: MindSnapshot;
  history: readonly ActivityHistoryItem[];
}>;

export type EligibilityResult = Readonly<{
  eligible: boolean;
  scoreMultiplier: number;
  reasons: readonly string[];
  blockers: readonly string[];
  preferredDurationMs?: readonly [number, number];
}>;

const levelMultiplier: Readonly<Record<ActivityLevel, number>> = { calm: .72, balanced: 1, lively: 1.28 };

export function evaluateIntegratedActivity(input: EligibilityInput): EligibilityResult {
  const definition = getActivityDefinition(input.character, input.activityId);
  const policy = getIntegratedActivityPolicy(input.character, input.activityId);
  const blockers: string[] = [];
  const reasons: string[] = [];
  if (!definition || !policy || policy.availability !== 'approved') blockers.push('No approved authoritative activity for this character.');
  if (definition && !definition.legalEntryStates.includes(input.state)) blockers.push(`State ${input.state} is not a legal entry state.`);
  if (definition && !definition.legalEntryPostures.includes(input.posture)) blockers.push(`Posture ${input.posture} is not a legal entry posture.`);
  if ((input.quietMode || input.context.fullscreenActive || input.context.screenLocked) && !['laptop', 'reading', 'drink', 'eat'].includes(input.activityId)) blockers.push('Quiet/fullscreen/lock suppresses this activity.');
  if (input.activityId === 'peeking' && !input.nearScreenEdge) blockers.push('Peeking requires an aligned real screen edge.');

  const recent = input.history.filter((item) => item.character === input.character && item.activityId === input.activityId);
  const latest = recent.at(-1);
  if (latest && policy && input.nowMs - latest.completedAtMs < policy.frequencyCap.minimumGapMs) blockers.push('Activity minimum gap is still active.');
  if (policy) {
    const hourStarts = recent.filter((item) => input.nowMs - item.completedAtMs < 3_600_000).length;
    if (hourStarts >= policy.frequencyCap.maximumStartsPerHour) blockers.push('Hourly activity cap reached.');
  }
  if (blockers.length || !policy) {
    const result: EligibilityResult = { eligible: false, scoreMultiplier: 0, reasons, blockers };
    return policy?.preferredDurationMs ? { ...result, preferredDurationMs: policy.preferredDurationMs } : result;
  }

  let context = input.context.enabled ? 1 : policy.spontaneousWeight;
  const cw = policy.contextWeights;
  if (input.context.enabled) {
    context *= input.context.typingActivity === 'sustained' ? cw.typingSustained : input.context.typingActivity === 'light' ? cw.typingLight : cw.typingNone;
    if (input.context.audioActive) context *= cw.audioActive;
    if (input.context.systemIdle) context *= cw.systemIdle;
    if (input.context.pointerActivity === 'busy') context *= cw.pointerBusy;
    if (input.nearScreenEdge) context *= cw.nearEdge;
  }
  if (input.quietMode) context *= cw.quiet;

  const drive = input.activityId === 'laptop' || input.activityId === 'reading'
    ? .35 + input.mind.focus * 1.1 + input.mind.comfort * .25
    : input.activityId === 'music' || input.activityId === 'playing_ball'
      ? .3 + input.mind.playfulness * .9 + input.mind.energy * .45
      : input.activityId === 'peeking'
        ? .35 + input.mind.curiosity * 1.1
        : .55 + input.mind.comfort * .35 + input.mind.boredom * .25;

  const interruptionPenalty = latest?.interrupted ? .35 : 1;
  const multiplier = Math.max(0, policy.personalityWeight * context * drive * interruptionPenalty * levelMultiplier[input.activityLevel]);
  reasons.push(`personality=${policy.personalityWeight.toFixed(2)}`);
  reasons.push(`context=${context.toFixed(2)}`);
  reasons.push(`drive=${drive.toFixed(2)}`);
  reasons.push(`activity-level=${levelMultiplier[input.activityLevel].toFixed(2)}`);
  if (latest?.interrupted) reasons.push('recent interrupted session penalty');
  const result: EligibilityResult = { eligible: multiplier > 0, scoreMultiplier: Number(multiplier.toFixed(4)), reasons, blockers };
  return policy.preferredDurationMs ? { ...result, preferredDurationMs: policy.preferredDurationMs } : result;
}

export function getAmbientRoutines(character: CharacterId): readonly AmbientRoutine[] {
  return AMBIENT_ROUTINES.filter((item) => item.character === character);
}

export type PlannerOverlay = Readonly<{
  legalActivities: readonly ActivityId[];
  scoreMultipliers: Readonly<Partial<Record<ActivityId, number>>>;
  durationOverrides: Readonly<Partial<Record<ActivityId, readonly [number, number]>>>;
  diagnostics: readonly Readonly<{ activityId: ActivityId; eligible: boolean; scoreMultiplier: number; reasons: readonly string[]; blockers: readonly string[] }>[];
}>;

export function buildPlannerOverlay(input: Omit<EligibilityInput, 'activityId'>): PlannerOverlay {
  const definitions = getApprovedIntegratedActivities(input.character);
  const scoreMultipliers: Partial<Record<ActivityId, number>> = {};
  const durationOverrides: Partial<Record<ActivityId, readonly [number, number]>> = {};
  const diagnostics: Array<{ activityId: ActivityId; eligible: boolean; scoreMultiplier: number; reasons: readonly string[]; blockers: readonly string[] }> = [];
  for (const definition of definitions) {
    const result = evaluateIntegratedActivity({ ...input, activityId: definition.id });
    diagnostics.push({ activityId: definition.id, eligible: result.eligible, scoreMultiplier: result.scoreMultiplier, reasons: result.reasons, blockers: result.blockers });
    if (!result.eligible) continue;
    scoreMultipliers[definition.id] = result.scoreMultiplier;
    if (result.preferredDurationMs) durationOverrides[definition.id] = result.preferredDurationMs;
  }
  return {
    legalActivities: diagnostics.filter((item) => item.eligible).map((item) => item.activityId),
    scoreMultipliers,
    durationOverrides,
    diagnostics,
  };
}
