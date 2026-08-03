export type PetName = 'poko' | 'loko';

export type PetState =
  | 'IDLE'
  | 'WALKING_LEFT'
  | 'WALKING_RIGHT'
  | 'SITTING'
  | 'SLEEPING'
  | 'DRAGGED'
  | 'LANDING'
  | 'INTERACTING';

export type ReactionName = 'happy' | 'confused';

export interface AppSettings {
  pet: PetName;
  alwaysOnTop: boolean;
  paused: boolean;
}
