import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, powerMonitor, screen, Tray, type MenuItemConstructorOptions } from 'electron';
import { createLabPreviewWindow, createOnboardingWindow, createPetWindow, createSplashWindow, createUtilityWindow } from './window-factory.js';
import { windowCommandSchema } from '../preload/contracts.js';
import { packagedAssetPath } from '../services/asset-paths.js';
import { Logger } from '../services/logger.js';
import { SettingsStore } from '../services/settings-store.js';
import { validateRuntimeAssetsAtStartup } from '../services/runtime-assets.js';
import { StaticPetController } from './static-pet-controller.js';
import { ContextSensorService } from '../services/context-sensor-service.js';
import { readFile, writeFile } from 'node:fs/promises';
import type { DiagnosticTrace } from '../../packages/pet-engine/diagnostics/src/index.js';

const logger = new Logger('main');
const iconPath = packagedAssetPath('brand', 'pokoloko.ico');
const trayMarkPath = packagedAssetPath('brand', 'pokoloko_symbol.png');

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let diagnosticsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let labPreviewWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let onboardingWindow: BrowserWindow | null = null;
let startupFlowCompleted = false;
let store: SettingsStore;
let staticPet: StaticPetController | null = null;
let contextSensor: ContextSensorService | null = null;

function showCompanion(): void {
  startupFlowCompleted = true;
  if (!store.get().paused) petWindow?.showInactive();
}

function closeSplashAndContinue(): void {
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
  splashWindow = null;
  if (!store.get().onboardingComplete) {
    if (!onboardingWindow || onboardingWindow.isDestroyed()) {
      onboardingWindow = createOnboardingWindow();
      onboardingWindow.once('closed', () => { onboardingWindow = null; if (!store.get().onboardingComplete) showCompanion(); });
    }
    onboardingWindow.show(); onboardingWindow.focus();
    return;
  }
  showCompanion();
}

function beginStartupExperience(): void {
  const settings = store.get();
  if (settings.splashEnabled) {
    splashWindow = createSplashWindow();
    splashWindow.once('closed', () => { splashWindow = null; });
    return;
  }
  closeSplashAndContinue();
}

function broadcastSettings(): void {
  if (!store) return;
  const snapshot = store.get();
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) window.webContents.send('settings:public', snapshot);
  });
}


function focusOrCreateSettings(): void {
  if (!settingsWindow || settingsWindow.isDestroyed()) {
    settingsWindow = createUtilityWindow('settings');
    settingsWindow.once('closed', () => { settingsWindow = null; });
  }
  settingsWindow.show();
  settingsWindow.focus();
}

function focusOrCreateDiagnostics(): void {
  if (!diagnosticsWindow || diagnosticsWindow.isDestroyed()) {
    diagnosticsWindow = createUtilityWindow('diagnostics');
    diagnosticsWindow.once('closed', () => { diagnosticsWindow = null; });
  }
  diagnosticsWindow.show();
  diagnosticsWindow.focus();
}


function focusOrCreateLabPreview(animationId?: string): void {
  if (!labPreviewWindow || labPreviewWindow.isDestroyed()) {
    labPreviewWindow = createLabPreviewWindow(animationId);
    labPreviewWindow.once('closed', () => { labPreviewWindow = null; });
  }
  labPreviewWindow.show();
  labPreviewWindow.focus();
}

let characterRequestGeneration = 0;

async function applyCharacter(character: 'poko' | 'loko'): Promise<boolean> {
  const requestGeneration = ++characterRequestGeneration;
  const committed = await staticPet?.setCharacter(character);
  if (requestGeneration !== characterRequestGeneration || committed !== true) return false;
  store.update({ selectedCharacter: character });
  broadcastSettings();
  createTray();
  return true;
}

function applyLocomotionLevel(level: 'calm' | 'balanced' | 'lively'): void {
  store.update({ activityLevel: level });
  broadcastSettings();
  staticPet?.setActivityLevel(level);
  createTray();
}


function applyWalkingSpeed(level: 'calm' | 'balanced' | 'lively'): void {
  store.update({ walkingSpeed: level });
  broadcastSettings();
  staticPet?.setWalkingSpeed(level);
  createTray();
}

function applyLaunchAtStartup(enabled: boolean): void {
  store.update({ launchAtStartup: enabled });
  app.setLoginItemSettings({ openAtLogin: enabled });
  broadcastSettings();
}

function applyContextSnapshot(snapshot: ReturnType<ContextSensorService['getSnapshot']>): void {
  const settings = store.get();
  if (settings.fullscreenBehavior === 'hide') {
    if (snapshot.fullscreenActive) petWindow?.hide();
    else if (!settings.paused) petWindow?.showInactive();
  }
  const effective = settings.fullscreenBehavior === 'unchanged'
    ? { ...snapshot, fullscreenActive: false }
    : snapshot;
  staticPet?.updateContext(effective);
  BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('context:snapshot', snapshot));
}

function applyScale(scale: 1 | 2 | 3): void {
  store.update({ sizeScale: scale });
  broadcastSettings();
  staticPet?.setScale(scale);
  createTray();
}

function createTray(): void {
  const settings = store.get();
  if (!tray || tray.isDestroyed()) {
    const image = nativeImage.createFromPath(trayMarkPath);
    const fallback = nativeImage.createFromPath(iconPath);
    tray = new Tray(image.isEmpty() ? fallback : image.resize({ width: 16, height: 16, quality: 'best' }));
    tray.setToolTip('PokoLoko');
    tray.on('double-click', () => focusOrCreateSettings());
  }

  const developerItems: MenuItemConstructorOptions[] = (!app.isPackaged || settings.diagnosticsEnabled) ? [
    { type: 'separator' },
    { label: 'Diagnostics', click: focusOrCreateDiagnostics },
    { label: 'Animation laboratory', click: () => focusOrCreateLabPreview() },
  ] : [];

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: petWindow?.isVisible() ? 'Hide companion' : 'Show companion', click: () => {
      if (petWindow?.isVisible()) petWindow.hide(); else petWindow?.showInactive();
      createTray();
    } },
    { label: settings.paused ? 'Resume' : 'Pause', click: () => {
      const paused = !store.get().paused; store.update({ paused }); broadcastSettings(); staticPet?.setPaused(paused);
      if (!paused && startupFlowCompleted) petWindow?.showInactive(); createTray();
    } },
    { label: settings.soundEnabled ? 'Mute sounds' : 'Unmute sounds', click: () => {
      store.update({ soundEnabled: !store.get().soundEnabled }); broadcastSettings(); createTray();
    } },
    { type: 'separator' },
    {
      label: 'Switch companion',
      submenu: [
        { label: 'Poko', type: 'radio', checked: settings.selectedCharacter === 'poko', click: () => { void applyCharacter('poko'); } },
        { label: 'Loko', type: 'radio', checked: settings.selectedCharacter === 'loko', click: () => { void applyCharacter('loko'); } },
      ],
    },
    {
      label: 'Activity rhythm',
      submenu: [
        { label: 'Calm', type: 'radio', checked: settings.activityLevel === 'calm', click: () => applyLocomotionLevel('calm') },
        { label: 'Balanced', type: 'radio', checked: settings.activityLevel === 'balanced', click: () => applyLocomotionLevel('balanced') },
        { label: 'Lively', type: 'radio', checked: settings.activityLevel === 'lively', click: () => applyLocomotionLevel('lively') },
      ],
    },
    { label: 'Move to this screen', click: () => {
      const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
      void staticPet?.moveToDisplay(display);
      petWindow?.showInactive();
    } },
    { type: 'separator' },
    { label: 'Settings…', click: focusOrCreateSettings },
    { label: 'Restart PokoLoko', click: () => { app.relaunch(); app.exit(0); } },
    ...developerItems,
    { type: 'separator' },
    { label: 'Quit PokoLoko', click: () => app.quit() },
  ]));
}

function registerIpc(): void {
  ipcMain.handle('app:get-info', () => ({ version: app.getVersion(), platform: process.platform, packaged: app.isPackaged }));
  ipcMain.handle('settings:get-public', () => store.get());
  ipcMain.handle('context:get-snapshot', () => contextSensor?.getSnapshot());
  ipcMain.handle('context:get-settings', () => store.get().contextAwareness);
  ipcMain.handle('diagnostics:get-snapshot', () => { if(!staticPet)throw new Error('Diagnostics are not ready.'); return staticPet.getDiagnosticSnapshot(); });
  ipcMain.handle('pet:get-living-runtime', () => {
    if (!staticPet) throw new Error('Living runtime is not ready.');
    return staticPet.getLivingRuntimeSnapshot();
  });
  ipcMain.handle('pet:get-static-presentation', () => {
    if (!staticPet) throw new Error('Static pet controller is not ready.');
    return staticPet.getPresentation();
  });
  ipcMain.handle('window:command', async (_event, raw: unknown) => {
    const command = windowCommandSchema.parse(raw);
    if (command.type === 'open_settings') focusOrCreateSettings();
    if (command.type === 'open_diagnostics') focusOrCreateDiagnostics();
    if(command.type==='diagnostics_command') await staticPet?.applyDiagnosticCommand(command.command);
    if(command.type==='diagnostics_export_trace'&&staticPet){const result=await dialog.showSaveDialog({title:'Export PokoLoko diagnostic trace',defaultPath:'pokoloko-diagnostic-trace.json',filters:[{name:'JSON',extensions:['json']}]});if(!result.canceled&&result.filePath)await writeFile(result.filePath,JSON.stringify(staticPet.exportDiagnosticTrace(),null,2),'utf8');}
    if(command.type==='diagnostics_replay_trace'&&staticPet){const result=await dialog.showOpenDialog({title:'Replay PokoLoko diagnostic trace',properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(!result.canceled&&result.filePaths[0]){const trace=JSON.parse(await readFile(result.filePaths[0],'utf8')) as DiagnosticTrace; if(trace.format!=='pokoloko-diagnostic-trace'||trace.version!==1)throw new Error('Unsupported diagnostic trace.'); await staticPet.replayDiagnosticTrace(trace);}}
    if (command.type === 'splash_complete') closeSplashAndContinue();
    if (command.type === 'complete_onboarding') {
      const current = store.get();
      const switched = await applyCharacter(command.character);
      if (!switched) throw new Error('The selected companion could not be prepared. Please try again.');
      store.update({
        onboardingComplete: true,
        activityLevel: command.activityLevel,
        contextAwareness: { ...current.contextAwareness, enabled: command.contextEnabled },
      });
      applyLocomotionLevel(command.activityLevel);
      const snapshot = contextSensor?.updateSettings(store.get().contextAwareness);
      if (snapshot) applyContextSnapshot(snapshot);
      broadcastSettings(); createTray();
      if (onboardingWindow && !onboardingWindow.isDestroyed()) onboardingWindow.close();
      onboardingWindow = null;
      showCompanion();
    }
    if (command.type === 'open_lab_preview') {
      if (labPreviewWindow && !labPreviewWindow.isDestroyed()) labPreviewWindow.close();
      focusOrCreateLabPreview(command.animationId);
    }
    if (command.type === 'hide_current') BrowserWindow.fromWebContents(_event.sender)?.hide();
    if (command.type === 'move_pet_to_current_screen') { const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()); await staticPet?.moveToDisplay(display); petWindow?.showInactive(); }
    if (command.type === 'restart_companion') { app.relaunch(); app.exit(0); }
    if (command.type === 'set_splash_enabled') { store.update({ splashEnabled: command.enabled }); broadcastSettings(); }
    if (command.type === 'set_pet_hit_test') staticPet?.setInteractive(command.interactive);
    if (command.type === 'set_static_character') await applyCharacter(command.character);
    if (command.type === 'set_static_scale') applyScale(command.scale);
    if (command.type === 'set_locomotion_activity_level') applyLocomotionLevel(command.level);
    if (command.type === 'set_walking_speed') applyWalkingSpeed(command.level);
    if (command.type === 'set_pet_paused') { store.update({ paused: command.paused }); broadcastSettings(); staticPet?.setPaused(command.paused); createTray(); }
    if (command.type === 'set_quiet_mode') { store.update({ quietMode: command.quiet }); broadcastSettings(); staticPet?.setQuietMode(command.quiet); createTray(); }
    if (command.type === 'set_always_on_top') { store.update({ alwaysOnTop: command.enabled }); broadcastSettings(); petWindow?.setAlwaysOnTop(command.enabled, 'floating'); createTray(); }
    if (command.type === 'set_sound_enabled') { store.update({ soundEnabled: command.enabled }); broadcastSettings(); }
    if (command.type === 'set_launch_at_startup') applyLaunchAtStartup(command.enabled);
    if (command.type === 'set_reduced_motion') { store.update({ reducedMotion: command.enabled }); broadcastSettings(); staticPet?.setReducedMotion(command.enabled); }
    if (command.type === 'set_fullscreen_behavior') { store.update({ fullscreenBehavior: command.behavior }); broadcastSettings(); }
    if (command.type === 'set_diagnostics_enabled') { store.update({ diagnosticsEnabled: command.enabled }); broadcastSettings(); createTray(); }
    if (command.type === 'reset_character_behavior') await staticPet?.resetBehaviorProfile(command.character);
    if (command.type === 'reset_settings_defaults') {
      const defaults = store.reset();
      app.setLoginItemSettings({ openAtLogin: defaults.launchAtStartup });
      await applyCharacter(defaults.selectedCharacter);
      applyScale(defaults.sizeScale);
      applyLocomotionLevel(defaults.activityLevel);
      applyWalkingSpeed(defaults.walkingSpeed);
      staticPet?.setPaused(defaults.paused);
      staticPet?.setQuietMode(defaults.quietMode);
      staticPet?.setReducedMotion(defaults.reducedMotion);
      petWindow?.setAlwaysOnTop(defaults.alwaysOnTop, 'floating');
      const snapshot = contextSensor?.updateSettings(defaults.contextAwareness);
      if (snapshot) applyContextSnapshot(snapshot);
      broadcastSettings();
      createTray();
    }
    if (command.type === 'set_context_privacy') {
      const settings = store.update({ contextAwareness: command.settings }).contextAwareness;
      broadcastSettings();
      const snapshot = contextSensor?.updateSettings(settings);
      if (snapshot) applyContextSnapshot(snapshot);
    }
    if (command.type === 'move_pet_to') await staticPet?.moveToGroundX(command.destinationX);
    if (command.type === 'move_pet_by') await staticPet?.moveBy(command.deltaX);
    if (command.type === 'stop_pet_movement') await staticPet?.stopMovement(command.reason ?? 'renderer-stop');
    if (command.type === 'pet_pointer_down') { contextSensor?.notePetInteraction(command.monotonicMs); await staticPet?.handlePointerDown(command); }
    if (command.type === 'pet_pointer_move') await staticPet?.handlePointerMove(command);
    if (command.type === 'pet_pointer_up') { contextSensor?.notePetInteraction(command.monotonicMs); await staticPet?.handlePointerUp(command); }
    if (command.type === 'pet_pointer_cancel') await staticPet?.cancelPointerInteraction(command.reason);
    if (command.type === 'report_animation_event') {
      await staticPet?.handleAnimationEvent(command.event);
      if (command.event.type === 'ANIMATION_COMPLETED') logger.debug('Animation completed', command.event);
    }
  });
}

function registerDisplayRecovery(): void {
  screen.on('display-added', (_event, display) => {
    staticPet?.handleDisplayTopologyChange(`display-added:${display.id}`);
  });
  screen.on('display-removed', (_event, display) => {
    staticPet?.handleDisplayTopologyChange(`display-removed:${display.id}`);
  });
  screen.on('display-metrics-changed', (_event, display, changedMetrics) => {
    staticPet?.handleDisplayTopologyChange(`display-metrics:${display.id}:${changedMetrics.join(',')}`);
  });
}

function installProcessGuards(): void {
  process.on('uncaughtException', (error) => logger.error('Uncaught exception', error));
  process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error));
}

installProcessGuards();

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();
else {
  app.on('second-instance', () => { petWindow?.show(); focusOrCreateSettings(); });
  app.whenReady().then(async () => {
    await validateRuntimeAssetsAtStartup(logger);
    store = new SettingsStore();
    const settings = store.load();
    registerIpc();
    petWindow = createPetWindow(settings.alwaysOnTop);
    staticPet = new StaticPetController(petWindow, {
      character: settings.selectedCharacter,
      scale: settings.sizeScale,
    });
    await staticPet.initialize();
    staticPet.setActivityLevel(settings.activityLevel);
    staticPet.setWalkingSpeed(settings.walkingSpeed);
    staticPet.setReducedMotion(settings.reducedMotion);
    app.setLoginItemSettings({ openAtLogin: settings.launchAtStartup });
    staticPet.setPaused(settings.paused);
    staticPet.setQuietMode(settings.quietMode);
    contextSensor = new ContextSensorService(logger, settings.contextAwareness);
    contextSensor.start((snapshot) => applyContextSnapshot(snapshot));
    powerMonitor.on('lock-screen', () => contextSensor?.noteLock(true));
    powerMonitor.on('unlock-screen', () => { contextSensor?.noteLock(false); contextSensor?.noteResume(); });
    powerMonitor.on('resume', () => contextSensor?.noteResume());
    registerDisplayRecovery();
    createTray();
    beginStartupExperience();
    logger.info('PokoLoko static renderer started', { packaged: app.isPackaged });
  }).catch((error: unknown) => {
    logger.error('Application startup failed', error);
    const message = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox('PokoLoko could not start', `${message}\n\nThe application will now close.`);
    app.quit();
  });
}

app.on('activate', () => { if (startupFlowCompleted) petWindow?.showInactive(); else if (onboardingWindow) onboardingWindow.show(); else if (splashWindow) splashWindow.show(); });
app.on('window-all-closed', () => { /* tray application remains alive */ });
app.on('before-quit', () => {
  contextSensor?.stop();
  contextSensor = null;
  staticPet?.dispose();
  splashWindow?.destroy(); onboardingWindow?.destroy();
  tray?.destroy();
  tray = null;
  logger.info('PokoLoko shutting down');
});
