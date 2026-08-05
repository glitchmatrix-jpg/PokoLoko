import {
  animations,
  type AnimationDefinition,
  type CharacterId,
} from "./animation_registry";
import {
  getAllowedTransitions,
  isTransitionForbidden,
} from "./transition_graph";

export interface RuntimeAnimationState {
  character: CharacterId;
  animationKey: string;
  frameIndex: number;
  elapsedMs: number;
  x: number;
  y: number;
}

function resolveAnimation(
  character: CharacterId,
  animationKey: string,
): AnimationDefinition {
  const registry = animations[character] as Record<string, AnimationDefinition>;
  const animation = registry[animationKey];

  if (!animation) {
    throw new Error(
      `Unknown animation "${animationKey}" for character "${character}".`,
    );
  }

  return animation;
}

/**
 * Resolve the current PNG frame path relative to the packaged asset root.
 */
export function getCurrentFrame(state: RuntimeAnimationState): string {
  const animation = resolveAnimation(state.character, state.animationKey);
  return animation.frames[state.frameIndex] ?? animation.frames[0];
}

/**
 * Advances sprite frames only. It does not move the desktop pet.
 */
export function advanceAnimation(
  state: RuntimeAnimationState,
  deltaMs: number,
): RuntimeAnimationState {
  const animation = resolveAnimation(state.character, state.animationKey);
  const frameDurationMs = 1000 / animation.fps;
  let elapsedMs = state.elapsedMs + deltaMs;
  let frameIndex = state.frameIndex;

  while (elapsedMs >= frameDurationMs) {
    elapsedMs -= frameDurationMs;
    frameIndex += 1;

    if (frameIndex >= animation.frames.length) {
      if (animation.loop) {
        frameIndex = 0;
      } else {
        frameIndex = animation.frames.length - 1;
        break;
      }
    }
  }

  return { ...state, elapsedMs, frameIndex };
}

/**
 * Locomotion is separate from sprite-frame playback.
 * Update the sprite or Electron window X coordinate independently.
 */
export function advanceLocomotion(
  state: RuntimeAnimationState,
  deltaMs: number,
): RuntimeAnimationState {
  const animation = resolveAnimation(state.character, state.animationKey);

  if (!animation.movement.moves_character) {
    return state;
  }

  const deltaSeconds = deltaMs / 1000;

  return {
    ...state,
    x:
      state.x +
      animation.movement.signed_speed_css_px_per_second * deltaSeconds,
  };
}

export function canTransition(
  character: CharacterId,
  fromAnimationId: string,
  toAnimationId: string,
): boolean {
  if (isTransitionForbidden(character, fromAnimationId, toAnimationId)) {
    return false;
  }

  return getAllowedTransitions(character, fromAnimationId).some(
    (edge) => edge.to === toAnimationId,
  );
}
