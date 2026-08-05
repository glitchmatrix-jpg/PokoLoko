import { createInitialMind } from '../../behavior/src/mind.js';
import { createSessionMemory } from '../../behavior/src/memory.js';
import { CHARACTER_PROFILES } from '../../behavior/src/profiles.js';
import type { CharacterId as BehaviorCharacterId } from '../../behavior/src/types.js';
import type { CharacterId, CharacterProfileBundle } from './types.js';

export function createCharacterProfileBundle<TAsset>(
  character: CharacterId,
  asset: TAsset,
  monotonicMs: number,
): CharacterProfileBundle<TAsset, (typeof CHARACTER_PROFILES)[BehaviorCharacterId], ReturnType<typeof createInitialMind>, ReturnType<typeof createSessionMemory>> {
  const behaviorCharacter = character as BehaviorCharacterId;
  return {
    character,
    asset,
    behaviorProfile: CHARACTER_PROFILES[behaviorCharacter],
    initialMind: createInitialMind(behaviorCharacter),
    sessionMemory: createSessionMemory(monotonicMs),
    neutralPosture: 'idle_front',
  };
}
