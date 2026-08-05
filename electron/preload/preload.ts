import { contextBridge, ipcRenderer } from 'electron';
import {
  appInfoSchema,
  contextPrivacySettingsSchema,
  contextSnapshotSchema,
  locomotionEventSchema,
  livingRuntimeSnapshotSchema,
  diagnosticSnapshotSchema,
  publicSettingsSchema,
  staticPetPresentationSchema,
  windowCommandSchema,
  type AppInfo,
  type ContextPrivacySettings,
  type ContextSnapshot,
  type LocomotionEvent,
  type LivingRuntimeSnapshot,
  type DiagnosticSnapshot,
  type PublicSettings,
  type StaticPetPresentation,
  type WindowCommand,
} from './contracts.js';

export type PokoLokoApi = {
  getAppInfo(): Promise<AppInfo>;
  getPublicSettings(): Promise<PublicSettings>;
  onPublicSettings(listener: (settings: PublicSettings) => void): () => void;
  sendWindowCommand(command: WindowCommand): Promise<void>;
  getStaticPetPresentation(): Promise<StaticPetPresentation>;
  onStaticPetPresentation(listener: (presentation: StaticPetPresentation) => void): () => void;
  onLocomotionEvent(listener: (event: LocomotionEvent) => void): () => void;
  getLivingRuntimeSnapshot(): Promise<LivingRuntimeSnapshot>;
  getDiagnosticSnapshot(): Promise<DiagnosticSnapshot>;
  onLivingRuntimeSnapshot(listener: (snapshot: LivingRuntimeSnapshot) => void): () => void;
  getContextSnapshot(): Promise<ContextSnapshot>;
  getContextSettings(): Promise<ContextPrivacySettings>;
  onContextSnapshot(listener: (snapshot: ContextSnapshot) => void): () => void;
};

const api: PokoLokoApi = Object.freeze({
  async getAppInfo() {
    return appInfoSchema.parse(await ipcRenderer.invoke('app:get-info'));
  },
  async getPublicSettings() {
    return publicSettingsSchema.parse(await ipcRenderer.invoke('settings:get-public'));
  },
  onPublicSettings(listener) {
    const handler = (_event: Electron.IpcRendererEvent, raw: unknown) => listener(publicSettingsSchema.parse(raw));
    ipcRenderer.on('settings:public', handler);
    return () => ipcRenderer.removeListener('settings:public', handler);
  },
  async sendWindowCommand(command) {
    await ipcRenderer.invoke('window:command', windowCommandSchema.parse(command));
  },
  async getContextSnapshot() {
    return contextSnapshotSchema.parse(await ipcRenderer.invoke('context:get-snapshot'));
  },
  async getContextSettings() {
    return contextPrivacySettingsSchema.parse(await ipcRenderer.invoke('context:get-settings'));
  },
  onContextSnapshot(listener) {
    const handler = (_event: Electron.IpcRendererEvent, raw: unknown) => listener(contextSnapshotSchema.parse(raw));
    ipcRenderer.on('context:snapshot', handler);
    return () => ipcRenderer.removeListener('context:snapshot', handler);
  },
  async getDiagnosticSnapshot() { return diagnosticSnapshotSchema.parse(await ipcRenderer.invoke('diagnostics:get-snapshot')); },
  async getLivingRuntimeSnapshot() {
    return livingRuntimeSnapshotSchema.parse(await ipcRenderer.invoke('pet:get-living-runtime'));
  },
  onLivingRuntimeSnapshot(listener) {
    const handler = (_event: Electron.IpcRendererEvent, raw: unknown) => listener(livingRuntimeSnapshotSchema.parse(raw));
    ipcRenderer.on('pet:living-runtime', handler);
    return () => ipcRenderer.removeListener('pet:living-runtime', handler);
  },
  async getStaticPetPresentation() {
    return staticPetPresentationSchema.parse(await ipcRenderer.invoke('pet:get-static-presentation'));
  },
  onLocomotionEvent(listener) {
    const handler = (_event: Electron.IpcRendererEvent, raw: unknown) => listener(locomotionEventSchema.parse(raw));
    ipcRenderer.on('pet:locomotion-event', handler);
    return () => ipcRenderer.removeListener('pet:locomotion-event', handler);
  },
  onStaticPetPresentation(listener) {
    const handler = (_event: Electron.IpcRendererEvent, raw: unknown) => listener(staticPetPresentationSchema.parse(raw));
    ipcRenderer.on('pet:static-presentation', handler);
    return () => ipcRenderer.removeListener('pet:static-presentation', handler);
  },
});

contextBridge.exposeInMainWorld('pokoloko', api);
