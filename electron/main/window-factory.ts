import { app, BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rendererUrl, type Surface } from '../services/asset-paths.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const preloadPath = path.join(currentDirectory, '..', 'preload', 'preload.js');

function secureWebPreferences(): BrowserWindowConstructorOptions['webPreferences'] {
  return {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    devTools: !app.isPackaged && !process.env.POKOLOKO_DISABLE_DEVTOOLS,
  };
}

export function createSplashWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 720, height: 440, transparent: true, frame: false, resizable: false, movable: true,
    minimizable: false, maximizable: false, fullscreenable: false, skipTaskbar: true, show: false,
    hasShadow: false, alwaysOnTop: true, backgroundColor: '#00000000', webPreferences: secureWebPreferences(),
  });
  window.center();
  void loadSurface(window, 'splash');
  return window;
}

export function createOnboardingWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 900, height: 680, minWidth: 720, minHeight: 560, show: false,
    backgroundColor: '#17121d', title: 'Welcome to PokoLoko',
    webPreferences: secureWebPreferences(),
  });
  window.center();
  void loadSurface(window, 'onboarding');
  return window;
}

export function createPetWindow(alwaysOnTop: boolean): BrowserWindow {
  const window = new BrowserWindow({
    width: 160,
    height: 160,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    hasShadow: false,
    alwaysOnTop,
    backgroundColor: '#00000000',
    webPreferences: secureWebPreferences(),
  });
  window.setAlwaysOnTop(alwaysOnTop, 'floating');
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  window.setIgnoreMouseEvents(true, { forward: true });
  void loadSurface(window, 'pet', false);
  return window;
}

export function createUtilityWindow(surface: Exclude<Surface, 'pet' | 'lab-preview'>): BrowserWindow {
  const window = new BrowserWindow({
    width: surface === 'settings' ? 1080 : 900,
    height: surface === 'settings' ? 760 : 680,
    minWidth: surface === 'settings' ? 480 : 520,
    minHeight: 420,
    show: false,
    backgroundColor: '#17121d',
    title: surface === 'settings' ? 'PokoLoko Settings' : 'PokoLoko Diagnostics',
    webPreferences: secureWebPreferences(),
  });
  void loadSurface(window, surface);
  return window;
}

export function createLabPreviewWindow(animationId?: string): BrowserWindow {
  const window = new BrowserWindow({
    width: 420,
    height: 360,
    transparent: true,
    frame: false,
    resizable: true,
    show: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: secureWebPreferences(),
  });
  const target = rendererUrl('lab-preview') + (animationId ? `&animation=${encodeURIComponent(animationId)}` : '');
  void window.loadURL(target).then(() => window.show());
  return window;
}

async function loadSurface(window: BrowserWindow, surface: Surface, showWhenReady = true): Promise<void> {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (url !== window.webContents.getURL()) event.preventDefault(); });
  if (showWhenReady) window.once('ready-to-show', () => window.show());
  await window.loadURL(rendererUrl(surface));
}
