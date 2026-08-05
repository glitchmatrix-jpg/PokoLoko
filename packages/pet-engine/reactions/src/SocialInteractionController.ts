import { reactionsFor } from './registry.js';
import type { AttentionMemory, ReactionCommand, ReactionDefinition, ReactionRandomSource, ReactionResult, ReactionTrigger, SocialInput, SocialState } from './types.js';

const CLICK_WINDOW_MS = 4200;
const DOUBLE_CLICK_WINDOW_MS = 360;
const ATTENTION_DECAY_MS = 18000;
const MAX_CLICK_HISTORY = 8;

export const createAttentionMemory = (): AttentionMemory => ({
  clickTimesMs: [], recentAttention: 0, saturation: 0, cooldowns: {}
});

const triggerForClick = (times: readonly number[], nowMs: number): ReactionTrigger => {
  const recent = times.filter((time) => nowMs - time <= CLICK_WINDOW_MS);
  if (recent.length >= 6) return 'excessive_poking';
  if (recent.length >= 2 && nowMs - recent[recent.length - 2]! <= DOUBLE_CLICK_WINDOW_MS * 2) return 'affectionate_repeat_click';
  return 'single_click';
};

const mapTrigger = (input: SocialInput, clickTimes: readonly number[]): ReactionTrigger => {
  if (input.type === 'click' || input.type === 'double_click') return triggerForClick(clickTimes, input.nowMs);
  if (input.type === 'drag_release') return 'drag_release';
  if (input.type === 'activity_success') return 'activity_success';
  if (input.type === 'surprise') return 'surprise';
  if (input.type === 'contextual_sadness') return 'contextual_sadness';
  return 'long_idle';
};

const sampleDuration = (definition: ReactionDefinition, rng: ReactionRandomSource): number => {
  const [min, max] = definition.durationMs;
  return min + rng.nextInt(max - min + 1);
};

export class SocialInteractionController {
  private generation = 0;
  private memory: AttentionMemory;

  constructor(private readonly rng: ReactionRandomSource, initial: AttentionMemory = createAttentionMemory()) {
    this.memory = initial;
  }

  snapshot(): AttentionMemory { return this.memory; }

  handle(state: SocialState, input: SocialInput): ReactionResult {
    this.generation += 1;
    const decayedAttention = Math.max(0, this.memory.recentAttention - Math.max(0, input.nowMs - (this.memory.lastReactionAtMs ?? input.nowMs)) / ATTENTION_DECAY_MS);
    const isClick = input.type === 'click' || input.type === 'double_click';
    const clickTimes = isClick
      ? [...this.memory.clickTimesMs.filter((time) => input.nowMs - time <= CLICK_WINDOW_MS), input.nowMs].slice(-MAX_CLICK_HISTORY)
      : this.memory.clickTimesMs.filter((time) => input.nowMs - time <= CLICK_WINDOW_MS);
    const trigger = state.sleeping || state.posture === 'lying_sleep' ? 'wake_interaction' : mapTrigger(input, clickTimes);
    const saturation = trigger === 'excessive_poking' ? Math.min(1, this.memory.saturation + 0.35) : Math.max(0, this.memory.saturation - 0.08);
    this.memory = { ...this.memory, clickTimesMs: clickTimes, recentAttention: Math.min(1, decayedAttention + (isClick ? 0.16 : 0.06)), saturation };

    if (state.sleeping || state.posture === 'lying_sleep') {
      return this.result([{ type: 'REQUEST_WAKE', reason: `Sleep-specific ${trigger}; upright reaction suppressed.`, generation: this.generation }]);
    }
    if (state.stateInterruption === 'locked' || state.posture === 'transition_locked') {
      return this.result([{ type: 'DEFER_REACTION', trigger, reason: 'Locked posture transition must finish.', generation: this.generation }]);
    }
    if (state.activeActivity?.propVisible) {
      return this.result([
        { type: 'REQUEST_ACTIVITY_SAFE_EXIT', reason: `Social ${trigger} waits for prop-safe boundary.`, generation: this.generation },
        { type: 'DEFER_REACTION', trigger, reason: 'Reaction deferred until activity prop is safely removed.', generation: this.generation }
      ]);
    }

    const candidates = reactionsFor(state.character, trigger).filter((item) => item.legalPostures.includes(state.posture));
    const eligible = candidates.filter((item) => {
      const until = this.memory.cooldowns[item.id] ?? 0;
      if (input.nowMs < until) return false;
      if (item.requiresContextReason && !input.contextReason) return false;
      return true;
    });
    if (eligible.length === 0) return this.result([{ type: 'REACTION_IGNORED', reason: `No eligible ${trigger} reaction for ${state.character}/${state.posture}; spam collapsed or cooling down.`, generation: this.generation }]);

    // Rare reactions are less likely unless directly contextual; stable sorting keeps seeded tests reproducible.
    const weighted = eligible.map((item) => ({ item, weight: item.rare ? 0.35 : 1 }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let pick = this.rng.nextFloat() * total;
    const selected = weighted.find((entry) => (pick -= entry.weight) <= 0)?.item ?? weighted[0]!.item;
    const durationMs = sampleDuration(selected, this.rng);
    this.memory = {
      ...this.memory,
      lastReactionAtMs: input.nowMs,
      lastReactionId: selected.id,
      recentAttention: Math.max(0, Math.min(1, this.memory.recentAttention + selected.attentionEffect)),
      cooldowns: { ...this.memory.cooldowns, [selected.id]: input.nowMs + selected.cooldownMs }
    };
    return {
      memory: this.memory,
      selectedReaction: selected,
      commands: [
        { type: 'PLAY_REACTION', reactionId: selected.id, animationId: selected.animationId, generation: this.generation, returnState: selected.returnState, durationMs },
        { type: 'DIAGNOSTIC', message: `${selected.id} selected for ${trigger}; returns to ${selected.returnState}.`, generation: this.generation }
      ]
    };
  }

  resetForCharacterSwitch(): AttentionMemory {
    this.generation += 1;
    this.memory = createAttentionMemory();
    return this.memory;
  }

  private result(commands: readonly ReactionCommand[]): ReactionResult { return { memory: this.memory, commands }; }
}
