import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, PetName, PetState, ReactionName } from './types.js';

type Unsubscribe = () => void;

function subscribe<T>(channel: string, callback: (value: T) => void): Unsubscribe {
  const listener = (_event: Electron.IpcRendererEvent, value: T) => callback(value);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('pokoAPI', {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  setPet: (pet: PetName): Promise<AppSettings> => ipcRenderer.invoke('settings:pet', pet),
  togglePause: (): Promise<AppSettings> => ipcRenderer.invoke('settings:pause'),
  toggleAlwaysOnTop: (): Promise<AppSettings> => ipcRenderer.invoke('settings:top'),
  startDrag: (x: number, y: number): void => ipcRenderer.send('drag:start', { x, y }),
  dragMove: (x: number, y: number): void => ipcRenderer.send('drag:move', { x, y }),
  endDrag: (): void => ipcRenderer.send('drag:end'),
  react: (reaction: ReactionName): void => ipcRenderer.send('pet:react', reaction),
  showContextMenu: (): void => ipcRenderer.send('menu:context'),
  openSettings: (): void => ipcRenderer.send('settings:open'),
  onPetChanged: (callback: (pet: PetName) => void): Unsubscribe =>
    subscribe<PetName>('pet:changed', callback),
  onBehavior: (callback: (state: PetState) => void): Unsubscribe =>
    subscribe<PetState>('behavior', callback),
  onReaction: (callback: (reaction: ReactionName) => void): Unsubscribe =>
    subscribe<ReactionName>('reaction', callback),
  onSettingsChanged: (callback: (settings: AppSettings) => void): Unsubscribe =>
    subscribe<AppSettings>('settings:changed', callback),
});
