import type { ActivityDefinition, ActivityId, CharacterId, InterruptionLevel } from './types.js';

const interruption = (
  loop: InterruptionLevel,
  immediateRecoveryState: string,
  markers: readonly string[] = ['loop_boundary'],
): ActivityDefinition['interruption'] => ({
  entry: 'locked', setup: 'locked', loop, variation: loop, exit: 'locked', recovery: 'locked',
  immediateRecoveryState, deferredSafeMarkers: markers,
});

const base = {
  legalEntryStates: ['stable.idle_front', 'stable.sitting'],
  destination: { required: false, policy: 'stay_here' as const },
  variations: [] as ActivityDefinition['variations'],
  cooldownMs: { min: 120_000, max: 360_000, categoryMin: 75_000 },
};

export const ACTIVITY_REGISTRY: readonly ActivityDefinition[] = [
  {
    ...base, id: 'drink', character: 'poko', label: 'Have a drink', category: 'spontaneous',
    triggerTags: ['awake', 'calm'], legalEntryPostures: ['standing_front', 'sitting'],
    entry: [{ kind: 'hold', durationMs: 180, note: 'neutral low-posture routing before composite prop appears' }],
    setup: [{ kind: 'prop', action: 'appear', propId: 'drink_container' }],
    loop: [{ kind: 'animation', animationId: 'poko_drink', safeExitMarkers: ['loop_boundary'] }],
    duration: { kind: 'loop_count', min: 1, max: 2 }, interruption: interruption('deferred', 'stable.idle_front'),
    exit: [{ kind: 'hold', durationMs: 140, note: 'finish sip phrase at container-safe frame' }, { kind: 'prop', action: 'remove', propId: 'drink_container' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering', note: 'clear composite prop then neutral idle' }],
    moodEffects: { energy: 0.03, comfort: 0.06, boredom: -0.08 },
    prop: { propId: 'drink_container', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['poko_drink'], knownLimitations: ['No dedicated authored cup pickup or put-down frame.'],
  },
  {
    ...base, id: 'eat', character: 'poko', label: 'Snack', category: 'spontaneous',
    triggerTags: ['awake', 'settled'], legalEntryPostures: ['standing_front', 'sitting'],
    entry: [{ kind: 'hold', durationMs: 220, note: 'settle before food scene' }], setup: [{ kind: 'prop', action: 'appear', propId: 'food_and_container' }],
    loop: [{ kind: 'animation', animationId: 'poko_eat', safeExitMarkers: ['loop_boundary', 'subscene_boundary'] }],
    duration: { kind: 'one_shot' }, interruption: interruption('deferred', 'stable.idle_front', ['subscene_boundary', 'loop_boundary']),
    exit: [{ kind: 'prop', action: 'remove', propId: 'food_and_container' }, { kind: 'hold', durationMs: 180, note: 'neutral digestion beat' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering' }], moodEffects: { comfort: 0.08, energy: 0.02, boredom: -0.1 },
    prop: { propId: 'food_and_container', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['poko_eat'], knownLimitations: ['Food and drink sub-scenes must not be reversed or ping-ponged.'],
  },
  {
    ...base, id: 'music', character: 'poko', label: 'Dance to music', category: 'contextual',
    triggerTags: ['audio_active', 'playful'], legalEntryPostures: ['standing_front'],
    entry: [{ kind: 'hold', durationMs: 120, note: 'notice-audio beat' }], setup: [],
    loop: [{ kind: 'animation', animationId: 'poko_music', safeExitMarkers: ['loop_boundary'] }],
    variations: [{ id: 'quiet_beat', weight: 0.25, steps: [{ kind: 'hold', durationMs: 260, note: 'brief listening pause' }] }],
    duration: { kind: 'time_range', minMs: 5_000, maxMs: 14_000, exitAtSafeBoundary: true }, interruption: interruption('soft', 'stable.idle_front'),
    exit: [{ kind: 'hold', durationMs: 160, note: 'finish musical phrase before notes clear' }], recovery: [{ kind: 'transition', targetState: 'stable.idle_front' }],
    cooldownMs: { min: 180_000, max: 480_000, categoryMin: 120_000 }, moodEffects: { playfulness: 0.12, sociability: 0.04, boredom: -0.2, energy: -0.03 },
    prop: { propId: 'music_notes', ownership: 'composite_frame', appearsDuring: 'loop', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['poko_music'], knownLimitations: [],
  },
  {
    ...base, id: 'peeking', character: 'poko', label: 'Peek over the edge', category: 'spontaneous',
    triggerTags: ['curious', 'near_edge'], legalEntryStates: ['stable.idle_front', 'stable.idle_side'], legalEntryPostures: ['standing_front', 'standing_side'],
    destination: { required: true, policy: 'screen_edge' }, entry: [{ kind: 'transition', targetState: 'transition.activity_entry', note: 'move to approved edge alignment first' }],
    setup: [{ kind: 'prop', action: 'appear', propId: 'ledge' }], loop: [{ kind: 'animation', animationId: 'poko_peeking', loops: 1, safeExitMarkers: ['withdrawn'] }],
    duration: { kind: 'one_shot' }, interruption: interruption('deferred', 'stable.idle_front', ['withdrawn']),
    exit: [{ kind: 'prop', action: 'remove', propId: 'ledge', marker: 'withdrawn' }], recovery: [{ kind: 'transition', targetState: 'transition.recovering' }],
    cooldownMs: { min: 240_000, max: 600_000, categoryMin: 150_000 }, moodEffects: { curiosity: 0.08, boredom: -0.16 },
    prop: { propId: 'ledge', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', disappearsAtMarker: 'withdrawn', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['poko_peeking'], knownLimitations: ['Native window must be aligned to a real work-area edge.'],
  },
  {
    ...base, id: 'playing_ball', character: 'poko', label: 'Play with the ball', category: 'spontaneous',
    triggerTags: ['playful', 'energetic'], legalEntryPostures: ['standing_front', 'standing_side'], destination: { required: true, policy: 'comfortable_region' },
    entry: [{ kind: 'hold', durationMs: 180, note: 'orient toward clear play space' }], setup: [{ kind: 'prop', action: 'appear', propId: 'blue_ball' }],
    loop: [{ kind: 'animation', animationId: 'poko_playing_ball', safeExitMarkers: ['ball_rest', 'loop_boundary'] }], duration: { kind: 'one_shot' },
    interruption: interruption('deferred', 'stable.idle_side', ['ball_rest', 'loop_boundary']),
    exit: [{ kind: 'prop', action: 'remove', propId: 'blue_ball', marker: 'ball_rest' }, { kind: 'hold', durationMs: 180, note: 'celebration settles' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering' }], cooldownMs: { min: 300_000, max: 720_000, categoryMin: 180_000 },
    moodEffects: { playfulness: 0.18, energy: -0.1, boredom: -0.25, comfort: 0.03 },
    prop: { propId: 'blue_ball', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', disappearsAtMarker: 'ball_rest', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['poko_playing_ball'], knownLimitations: ['Authored ball trajectory is embedded in composite frames.'],
  },
  {
    ...base, id: 'drink', character: 'loko', label: 'Have a drink', category: 'spontaneous', triggerTags: ['awake', 'calm'], legalEntryPostures: ['sitting', 'standing_front'],
    entry: [{ kind: 'hold', durationMs: 240, note: 'Loko settles deliberately before drinking' }], setup: [{ kind: 'prop', action: 'appear', propId: 'green_drink_container' }],
    loop: [{ kind: 'animation', animationId: 'loko_drink_02', safeExitMarkers: ['loop_boundary'] }], duration: { kind: 'loop_count', min: 1, max: 3 },
    interruption: interruption('deferred', 'stable.sitting'), exit: [{ kind: 'hold', durationMs: 180, note: 'container-safe final hold' }, { kind: 'prop', action: 'remove', propId: 'green_drink_container' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering' }], moodEffects: { comfort: 0.08, focus: 0.02, boredom: -0.06 },
    prop: { propId: 'green_drink_container', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_drink_02'], knownLimitations: ['No dedicated authored container teardown.'],
  },
  {
    ...base, id: 'eat', character: 'loko', label: 'Eat quietly', category: 'spontaneous', triggerTags: ['settled', 'calm'], legalEntryPostures: ['sitting', 'standing_front'],
    entry: [{ kind: 'hold', durationMs: 260, note: 'quiet seated setup' }], setup: [{ kind: 'prop', action: 'appear', propId: 'food_and_blue_container' }],
    loop: [{ kind: 'animation', animationId: 'loko_eat', safeExitMarkers: ['subscene_boundary', 'loop_boundary'] }], duration: { kind: 'one_shot' },
    interruption: interruption('deferred', 'stable.sitting', ['subscene_boundary', 'loop_boundary']), exit: [{ kind: 'prop', action: 'remove', propId: 'food_and_blue_container' }, { kind: 'hold', durationMs: 220, note: 'settled finish' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering' }], moodEffects: { comfort: 0.1, energy: 0.03, boredom: -0.07 },
    prop: { propId: 'food_and_blue_container', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_eat'], knownLimitations: ['Consumption semantics require forward one-shot playback.'],
  },
  {
    ...base, id: 'laptop', character: 'loko', label: 'Work on the laptop', category: 'contextual', triggerTags: ['typing_active', 'focused'], legalEntryPostures: ['sitting', 'standing_front'],
    entry: [{ kind: 'hold', durationMs: 300, note: 'sit and compose before laptop appears' }], setup: [{ kind: 'prop', action: 'appear', propId: 'laptop' }],
    loop: [{ kind: 'animation', animationId: 'loko_laptop', safeExitMarkers: ['loop_boundary', 'neutral_typing_frame'] }],
    variations: [{ id: 'focus_pause', weight: 0.35, steps: [{ kind: 'hold', durationMs: 420, note: 'brief focused pause at a neutral typing frame' }] }],
    duration: { kind: 'time_range', minMs: 9_000, maxMs: 28_000, exitAtSafeBoundary: true }, interruption: interruption('deferred', 'stable.sitting', ['neutral_typing_frame', 'loop_boundary']),
    exit: [{ kind: 'hold', durationMs: 260, note: 'close/remove choreography substitute at neutral frame' }, { kind: 'prop', action: 'remove', propId: 'laptop' }],
    recovery: [{ kind: 'transition', targetState: 'transition.recovering' }], cooldownMs: { min: 240_000, max: 720_000, categoryMin: 150_000 },
    moodEffects: { focus: 0.15, comfort: 0.04, boredom: -0.12, energy: -0.04 },
    prop: { propId: 'laptop', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_laptop'], knownLimitations: ['No authored laptop close frame; exit uses neutral-frame hold.'],
  },
  {
    ...base, id: 'music', character: 'loko', label: 'Listen to music', category: 'contextual', triggerTags: ['audio_active', 'calm'], legalEntryPostures: ['standing_front', 'sitting'],
    entry: [{ kind: 'hold', durationMs: 220, note: 'quiet listening setup' }], setup: [], loop: [{ kind: 'animation', animationId: 'loko_music', safeExitMarkers: ['loop_boundary', 'pre_orb_boundary'] }],
    variations: [{ id: 'orb_climax', weight: 0.15, steps: [{ kind: 'hold', durationMs: 300, note: 'orb climax is rare and must finish before exit' }] }],
    duration: { kind: 'time_range', minMs: 7_000, maxMs: 20_000, exitAtSafeBoundary: true }, interruption: interruption('soft', 'stable.idle_front', ['pre_orb_boundary', 'loop_boundary']),
    exit: [{ kind: 'hold', durationMs: 220, note: 'finish phrase and clear notes/orb' }], recovery: [{ kind: 'transition', targetState: 'stable.idle_front' }],
    moodEffects: { comfort: 0.1, focus: 0.05, boredom: -0.1 }, prop: { propId: 'music_notes_and_orb', ownership: 'composite_frame', appearsDuring: 'loop', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_music'], knownLimitations: ['Orb frames are treated as a variation/climax, not an endlessly repeated loop.'],
  },
  {
    ...base, id: 'peeking', character: 'loko', label: 'Observe from an edge', category: 'spontaneous', triggerTags: ['curious', 'near_edge'], legalEntryStates: ['stable.idle_front', 'stable.idle_side'], legalEntryPostures: ['standing_front', 'standing_side'],
    destination: { required: true, policy: 'screen_edge' }, entry: [{ kind: 'transition', targetState: 'transition.activity_entry', note: 'align to edge' }], setup: [{ kind: 'prop', action: 'appear', propId: 'ledge' }],
    loop: [{ kind: 'animation', animationId: 'loko_peeking_02', safeExitMarkers: ['withdrawn'] }], variations: [{ id: 'floor_peek', weight: 0.3, steps: [{ kind: 'animation', animationId: 'loko_peeking_01', loops: 1, safeExitMarkers: ['withdrawn'] }] }],
    duration: { kind: 'loop_count', min: 1, max: 2 }, interruption: interruption('deferred', 'stable.idle_front', ['withdrawn']),
    exit: [{ kind: 'prop', action: 'remove', propId: 'ledge', marker: 'withdrawn' }], recovery: [{ kind: 'transition', targetState: 'transition.recovering' }],
    moodEffects: { curiosity: 0.06, comfort: 0.02, boredom: -0.1 }, prop: { propId: 'ledge', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', disappearsAtMarker: 'withdrawn', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_peeking_02', 'loko_peeking_01'], knownLimitations: ['Requires reliable native edge alignment.'],
  },
  {
    ...base, id: 'playing_ball', character: 'loko', label: 'Play with the ball', category: 'spontaneous', triggerTags: ['playful', 'surprise'], legalEntryPostures: ['standing_front', 'standing_side'],
    destination: { required: true, policy: 'comfortable_region' }, entry: [{ kind: 'hold', durationMs: 260, note: 'deliberate orientation to play space' }], setup: [{ kind: 'prop', action: 'appear', propId: 'orange_ball' }],
    loop: [{ kind: 'animation', animationId: 'loko_playing_ball_01', safeExitMarkers: ['ball_rest', 'loop_boundary'] }], duration: { kind: 'one_shot' }, interruption: interruption('deferred', 'stable.idle_side', ['ball_rest', 'loop_boundary']),
    exit: [{ kind: 'prop', action: 'remove', propId: 'orange_ball', marker: 'ball_rest' }], recovery: [{ kind: 'transition', targetState: 'transition.recovering' }],
    cooldownMs: { min: 420_000, max: 900_000, categoryMin: 240_000 }, moodEffects: { playfulness: 0.12, energy: -0.08, boredom: -0.18 },
    prop: { propId: 'orange_ball', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', disappearsAtMarker: 'ball_rest', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_playing_ball_01'], knownLimitations: [],
  },
  {
    ...base, id: 'reading', character: 'loko', label: 'Read a book', category: 'contextual', triggerTags: ['quiet', 'focused', 'typing_active'], legalEntryPostures: ['sitting', 'standing_front'],
    entry: [{ kind: 'hold', durationMs: 320, note: 'settle into reading posture' }], setup: [{ kind: 'prop', action: 'appear', propId: 'green_book' }],
    loop: [{ kind: 'animation', animationId: 'loko_reading_01', safeExitMarkers: ['loop_boundary', 'page_rest'] }], variations: [{ id: 'page_pause', weight: 0.4, steps: [{ kind: 'hold', durationMs: 480, note: 'rest at page-safe frame' }] }],
    duration: { kind: 'time_range', minMs: 12_000, maxMs: 36_000, exitAtSafeBoundary: true }, interruption: interruption('deferred', 'stable.sitting', ['page_rest', 'loop_boundary']),
    exit: [{ kind: 'hold', durationMs: 300, note: 'book-close substitute at neutral page frame' }, { kind: 'prop', action: 'remove', propId: 'green_book' }], recovery: [{ kind: 'transition', targetState: 'transition.recovering' }],
    cooldownMs: { min: 300_000, max: 900_000, categoryMin: 180_000 }, moodEffects: { focus: 0.16, comfort: 0.08, boredom: -0.14, energy: -0.02 },
    prop: { propId: 'green_book', ownership: 'composite_frame', appearsDuring: 'setup', disappearsDuring: 'exit', interruptionRecovery: 'finish_phrase' },
    sourceAnimations: ['loko_reading_01'], knownLimitations: ['No authored book-close frame; exit uses a page-safe hold.'],
  },
] as const;

export function getActivityDefinition(character: CharacterId, id: ActivityId): ActivityDefinition | undefined {
  return ACTIVITY_REGISTRY.find((item) => item.character === character && item.id === id);
}

export function getCharacterActivities(character: CharacterId): readonly ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter((item) => item.character === character);
}

