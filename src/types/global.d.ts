import type { AppSettings, PetName, PetState, ReactionName } from './animation';

export {};

declare global {
  interface Window {
    pokoAPI: {
      getSettings: () => Promise<AppSettings>;
      setPet: (pet: PetName) => Promise<AppSettings>;
      togglePause: () => Promise<AppSettings>;
      toggleAlwaysOnTop: () => Promise<AppSettings>;
      startDrag: (x: number, y: number) => void;
      dragMove: (x: number, y: number) => void;
      endDrag: () => void;
      react: (reaction: ReactionName) => void;
      showContextMenu: () => void;
      openSettings: () => void;
      onPetChanged: (callback: (pet: PetName) => void) => () => void;
      onBehavior: (callback: (state: PetState) => void) => () => void;
      onReaction: (callback: (reaction: ReactionName) => void) => () => void;
      onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
    };
  }
}
