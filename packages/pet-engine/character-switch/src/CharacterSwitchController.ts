import type {
  CharacterId,
  CharacterProfileBundle,
  CharacterProfileLoader,
  CharacterSwitchCommand,
  CharacterSwitchRequest,
  CharacterSwitchResult,
  CharacterSwitchSnapshot,
} from './types.js';

function finite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

export class CharacterSwitchController<TBundle extends CharacterProfileBundle = CharacterProfileBundle> {
  private value: CharacterSwitchSnapshot<TBundle>;

  public constructor(
    initialCharacter: CharacterId,
    private readonly loader: CharacterProfileLoader<TBundle>,
    initialBundle?: TBundle,
  ) {
    this.value = {
      phase: 'idle',
      character: initialCharacter,
      generation: 0,
      presentationGeneration: 0,
      ...(initialBundle ? { bundle: initialBundle } : {}),
    };
  }

  public snapshot(): CharacterSwitchSnapshot<TBundle> {
    return this.value;
  }

  public async request(request: CharacterSwitchRequest): Promise<CharacterSwitchResult<TBundle>> {
    finite(request.monotonicMs, 'monotonicMs');
    if (request.character === this.value.character && this.value.phase === 'idle') {
      return this.result([], false, 'requested character is already active');
    }

    const generation = this.value.generation + 1;
    this.value = {
      ...this.value,
      phase: 'preparing',
      requestedCharacter: request.character,
      generation,
      failure: undefined,
    };

    const commands: CharacterSwitchCommand[] = [
      { kind: 'cancel_planner', generation },
      { kind: 'cancel_activity', generation },
      { kind: 'stop_locomotion', generation },
      { kind: 'invalidate_animation', generation },
      { kind: 'clear_props', generation },
      { kind: 'prepare_neutral_presentation', character: request.character, generation },
    ];

    try {
      const bundle = await this.loader.load(request.character, generation);
      if (this.value.generation !== generation || this.value.requestedCharacter !== request.character) {
        return this.result(commands, false, 'superseded character load ignored');
      }
      const presentationGeneration = this.value.presentationGeneration + 1;
      this.value = {
        phase: 'idle',
        character: request.character,
        generation,
        presentationGeneration,
        bundle,
      };
      commands.push({
        kind: 'commit_character',
        character: request.character,
        generation,
        presentationGeneration,
      });
      return this.result(commands, true);
    } catch (error) {
      if (this.value.generation !== generation) {
        return this.result(commands, false, 'superseded failed load ignored');
      }
      const message = error instanceof Error ? error.message : String(error);
      this.value = {
        ...this.value,
        phase: 'failed',
        requestedCharacter: undefined,
        failure: message,
      };
      commands.push({ kind: 'publish_switch_failed', character: request.character, generation, error: message });
      return this.result(commands, false, message);
    }
  }

  public invalidate(reason = 'external interruption'): CharacterSwitchResult<TBundle> {
    const generation = this.value.generation + 1;
    this.value = {
      ...this.value,
      phase: 'recovering',
      generation,
      requestedCharacter: undefined,
      failure: reason,
    };
    return this.result([
      { kind: 'cancel_planner', generation },
      { kind: 'cancel_activity', generation },
      { kind: 'stop_locomotion', generation },
      { kind: 'invalidate_animation', generation },
      { kind: 'clear_props', generation },
    ], true);
  }

  public recoverToIdle(): CharacterSwitchResult<TBundle> {
    this.value = { ...this.value, phase: 'idle', requestedCharacter: undefined, failure: undefined };
    return this.result([], true);
  }

  public acceptsEvent(character: CharacterId, generation: number): boolean {
    return character === this.value.character && generation === this.value.generation && this.value.phase === 'idle';
  }

  private result(
    commands: readonly CharacterSwitchCommand[],
    accepted: boolean,
    ignoredReason?: string,
  ): CharacterSwitchResult<TBundle> {
    return {
      snapshot: this.value,
      commands,
      accepted,
      ...(ignoredReason ? { ignoredReason } : {}),
    };
  }
}
