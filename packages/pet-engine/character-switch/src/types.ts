export type CharacterId = 'poko' | 'loko';
export type SwitchPhase = 'idle' | 'preparing' | 'committing' | 'recovering' | 'failed';
export type StablePosture = 'idle_front' | 'idle_side' | 'sitting' | 'sleeping';

export type CharacterProfileBundle<TAsset = unknown, TBehavior = unknown, TMind = unknown, TMemory = unknown> = Readonly<{
  character: CharacterId;
  asset: TAsset;
  behaviorProfile: TBehavior;
  initialMind: TMind;
  sessionMemory: TMemory;
  neutralPosture: StablePosture;
}>;

export type CharacterSwitchSnapshot<TBundle = unknown> = Readonly<{
  phase: SwitchPhase;
  character: CharacterId;
  requestedCharacter?: CharacterId;
  generation: number;
  presentationGeneration: number;
  bundle?: TBundle;
  failure?: string;
}>;

export type CharacterSwitchRequest = Readonly<{
  character: CharacterId;
  monotonicMs: number;
  reason: 'settings' | 'tray' | 'diagnostics' | 'restart_restore' | 'recovery';
}>;

export type CharacterSwitchCommand =
  | Readonly<{ kind: 'cancel_planner'; generation: number }>
  | Readonly<{ kind: 'cancel_activity'; generation: number }>
  | Readonly<{ kind: 'stop_locomotion'; generation: number }>
  | Readonly<{ kind: 'invalidate_animation'; generation: number }>
  | Readonly<{ kind: 'clear_props'; generation: number }>
  | Readonly<{ kind: 'prepare_neutral_presentation'; character: CharacterId; generation: number }>
  | Readonly<{ kind: 'commit_character'; character: CharacterId; generation: number; presentationGeneration: number }>
  | Readonly<{ kind: 'publish_switch_failed'; character: CharacterId; generation: number; error: string }>;

export type CharacterSwitchResult<TBundle = unknown> = Readonly<{
  snapshot: CharacterSwitchSnapshot<TBundle>;
  commands: readonly CharacterSwitchCommand[];
  accepted: boolean;
  ignoredReason?: string;
}>;

export interface CharacterProfileLoader<TBundle> {
  load(character: CharacterId, generation: number): Promise<TBundle>;
}
