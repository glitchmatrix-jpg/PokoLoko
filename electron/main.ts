import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  Tray,
  type MenuItemConstructorOptions,
} from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Store } from './store.js';
import type { AppSettings, PetName, PetState, ReactionName } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store();

const PET_WINDOW_SIZE = 180;
const BOTTOM_GAP = 0;

const personalities = {
  poko: { speed: 75, idleRange: [2_000, 5_000] as const, sleepWeight: 0.07 },
  loko: { speed: 48, idleRange: [4_000, 9_000] as const, sleepWeight: 0.14 },
};

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let behaviorTimer: NodeJS.Timeout | null = null;
let movementTimer: NodeJS.Timeout | null = null;
let state: PetState = 'IDLE';
let dragOffset = { x: 0, y: 0 };

function randomInteger(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function sendToWindows(channel: string, value: unknown): void {
  if (petWindow && !petWindow.isDestroyed()) petWindow.webContents.send(channel, value);
  if (settingsWindow && !settingsWindow.isDestroyed()) settingsWindow.webContents.send(channel, value);
}

function broadcastSettings(settings = store.get()): AppSettings {
  sendToWindows('settings:changed', settings);
  return settings;
}

function rendererUrl(mode?: 'settings'): string {
  const query = mode ? `?mode=${mode}` : '';
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) return `${devUrl}${query}`;
  return `${pathToFileURL(path.join(app.getAppPath(), 'dist', 'index.html')).toString()}${query}`;
}

function iconPath(name: string): string {
  return path.join(
    app.getAppPath(),
    process.env.VITE_DEV_SERVER_URL ? 'public' : 'dist',
    'icons',
    name,
  );
}

function floorY(window: BrowserWindow): number {
  const display = screen.getDisplayMatching(window.getBounds());
  return display.workArea.y + display.workArea.height - window.getBounds().height - BOTTOM_GAP;
}

function clampWindowToWorkArea(window: BrowserWindow, snapToFloor = false): void {
  const bounds = window.getBounds();
  const area = screen.getDisplayMatching(bounds).workArea;
  const x = Math.max(area.x, Math.min(bounds.x, area.x + area.width - bounds.width));
  const y = snapToFloor
    ? area.y + area.height - bounds.height - BOTTOM_GAP
    : Math.max(area.y, Math.min(bounds.y, area.y + area.height - bounds.height));
  window.setPosition(Math.round(x), Math.round(y), false);
}

function clearBehaviorTimer(): void {
  if (behaviorTimer) clearTimeout(behaviorTimer);
  behaviorTimer = null;
}

function clearMovementTimer(): void {
  if (movementTimer) clearInterval(movementTimer);
  movementTimer = null;
}

function clearAllTimers(): void {
  clearBehaviorTimer();
  clearMovementTimer();
}

function setState(next: PetState): void {
  state = next;
  sendToWindows('behavior', next);
}

function scheduleBehavior(delay?: number): void {
  if (!petWindow || petWindow.isDestroyed() || store.get().paused || state === 'DRAGGED') return;
  clearBehaviorTimer();
  const personality = personalities[store.get().pet];
  behaviorTimer = setTimeout(
    chooseBehavior,
    delay ?? randomInteger(personality.idleRange[0], personality.idleRange[1]),
  );
}

function chooseBehavior(): void {
  if (!petWindow || petWindow.isDestroyed() || store.get().paused || state === 'DRAGGED') return;
  if (state === 'SLEEPING') {
    setState('IDLE');
    scheduleBehavior(randomInteger(1_200, 2_500));
    return;
  }

  const roll = Math.random();
  const personality = personalities[store.get().pet];

  if (roll < 0.45) {
    setState('IDLE');
    scheduleBehavior();
  } else if (roll < 0.75) {
    startWalking();
  } else if (roll < 0.90) {
    setState('SITTING');
    scheduleBehavior(randomInteger(2_000, 4_000));
  } else if (roll < Math.min(0.98, 0.90 + personality.sleepWeight)) {
    setState('SLEEPING');
    scheduleBehavior(randomInteger(7_000, 14_000));
  } else {
    triggerReaction('happy');
  }
}

function startWalking(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  clearMovementTimer();

  const display = screen.getDisplayMatching(petWindow.getBounds());
  const area = display.workArea;
  const current = petWindow.getBounds();
  const minX = area.x;
  const maxX = area.x + area.width - current.width;
  const targetX = randomInteger(minX, maxX);

  if (Math.abs(targetX - current.x) < 8) {
    setState('IDLE');
    scheduleBehavior(600);
    return;
  }

  const direction: PetState = targetX < current.x ? 'WALKING_LEFT' : 'WALKING_RIGHT';
  const speed = personalities[store.get().pet].speed;
  let previousTime = Date.now();
  setState(direction);

  movementTimer = setInterval(() => {
    if (!petWindow || petWindow.isDestroyed() || store.get().paused || state === 'DRAGGED') {
      clearMovementTimer();
      return;
    }

    const now = Date.now();
    const deltaSeconds = Math.min((now - previousTime) / 1_000, 0.05);
    previousTime = now;

    const bounds = petWindow.getBounds();
    const step = speed * deltaSeconds;
    let x = bounds.x + (direction === 'WALKING_RIGHT' ? step : -step);
    const reached = direction === 'WALKING_RIGHT' ? x >= targetX : x <= targetX;
    if (reached) x = targetX;

    petWindow.setPosition(Math.round(x), floorY(petWindow), false);

    if (reached) {
      clearMovementTimer();
      setState('IDLE');
      scheduleBehavior();
    }
  }, 16);
}

function triggerReaction(reaction: ReactionName): void {
  if (state === 'DRAGGED') return;
  clearAllTimers();
  setState('INTERACTING');
  sendToWindows('reaction', reaction);
  if (!store.get().paused) scheduleBehavior(reaction === 'confused' ? 2_200 : 1_800);
}

function setPet(pet: PetName): AppSettings {
  clearAllTimers();
  const settings = store.set({ pet });
  sendToWindows('pet:changed', pet);
  tray?.setToolTip(pet === 'poko' ? 'Poko' : 'Loko');
  rebuildTrayMenu();
  setState('IDLE');
  scheduleBehavior(500);
  return broadcastSettings(settings);
}

function togglePause(): AppSettings {
  const settings = store.set({ paused: !store.get().paused });
  clearAllTimers();
  setState('IDLE');
  rebuildTrayMenu();
  if (!settings.paused) scheduleBehavior(500);
  return broadcastSettings(settings);
}

function toggleAlwaysOnTop(): AppSettings {
  const settings = store.set({ alwaysOnTop: !store.get().alwaysOnTop });
  petWindow?.setAlwaysOnTop(settings.alwaysOnTop, 'floating');
  rebuildTrayMenu();
  return broadcastSettings(settings);
}

function trayMenuTemplate(): MenuItemConstructorOptions[] {
  const settings = store.get();
  return [
    {
      label: 'Choose Pet',
      submenu: (['poko', 'loko'] as PetName[]).map((pet) => ({
        label: pet === 'poko' ? 'Poko' : 'Loko',
        type: 'radio',
        checked: settings.pet === pet,
        click: () => setPet(pet),
      })),
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: settings.alwaysOnTop,
      click: () => toggleAlwaysOnTop(),
    },
    {
      label: settings.paused ? 'Resume Pet' : 'Pause Pet',
      click: () => togglePause(),
    },
    { label: 'Open Settings', click: () => createSettingsWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ];
}

function rebuildTrayMenu(): Menu {
  const menu = Menu.buildFromTemplate(trayMenuTemplate());
  tray?.setContextMenu(menu);
  return menu;
}

function createTray(): void {
  let icon = nativeImage.createFromPath(iconPath('poko-32.png'));
  if (icon.isEmpty()) icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip(store.get().pet === 'poko' ? 'Poko' : 'Loko');
  rebuildTrayMenu();
  tray.on('double-click', () => createSettingsWindow());
}

function hardenWindow(window: BrowserWindow): void {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    const allowed = process.env.VITE_DEV_SERVER_URL
      ? url.startsWith(process.env.VITE_DEV_SERVER_URL)
      : url.startsWith('file:');
    if (!allowed) event.preventDefault();
  });
}

function createPetWindow(): void {
  const display = screen.getPrimaryDisplay();
  petWindow = new BrowserWindow({
    width: PET_WINDOW_SIZE,
    height: PET_WINDOW_SIZE,
    x: display.workArea.x + Math.round((display.workArea.width - PET_WINDOW_SIZE) / 2),
    y: display.workArea.y + display.workArea.height - PET_WINDOW_SIZE - BOTTOM_GAP,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: store.get().alwaysOnTop,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  hardenWindow(petWindow);
  petWindow.setAlwaysOnTop(store.get().alwaysOnTop, 'floating');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadURL(rendererUrl()).catch((error) => console.error('Failed to load pet window:', error));

  petWindow.once('ready-to-show', () => {
    petWindow?.showInactive();
    sendToWindows('pet:changed', store.get().pet);
    sendToWindows('settings:changed', store.get());
    setState('IDLE');
    scheduleBehavior(700);
  });

  petWindow.on('closed', () => {
    petWindow = null;
    clearAllTimers();
  });
}

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 410,
    height: 470,
    minWidth: 410,
    minHeight: 470,
    resizable: false,
    title: 'Poko Settings',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  hardenWindow(settingsWindow);
  settingsWindow.loadURL(rendererUrl('settings')).catch((error) =>
    console.error('Failed to load settings window:', error),
  );
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => createSettingsWindow());

  app.whenReady().then(() => {
    store.init();
    createPetWindow();
    createTray();

    const reposition = () => {
      if (petWindow && !petWindow.isDestroyed()) clampWindowToWorkArea(petWindow, true);
    };
    screen.on('display-metrics-changed', reposition);
    screen.on('display-removed', reposition);
  });

  app.on('activate', () => {
    if (!petWindow) createPetWindow();
  });
}

ipcMain.handle('settings:get', () => store.get());
ipcMain.handle('settings:pet', (_event, pet: PetName) => setPet(pet));
ipcMain.handle('settings:pause', () => togglePause());
ipcMain.handle('settings:top', () => toggleAlwaysOnTop());

ipcMain.on('settings:open', () => createSettingsWindow());
ipcMain.on('menu:context', () => rebuildTrayMenu().popup({ window: petWindow ?? undefined }));
ipcMain.on('pet:react', (_event, reaction: ReactionName) => triggerReaction(reaction));

ipcMain.on('drag:start', (_event, point: { x: number; y: number }) => {
  if (!petWindow || petWindow.isDestroyed()) return;
  clearAllTimers();
  const bounds = petWindow.getBounds();
  dragOffset = { x: point.x - bounds.x, y: point.y - bounds.y };
  setState('DRAGGED');
});

ipcMain.on('drag:move', (_event, point: { x: number; y: number }) => {
  if (!petWindow || petWindow.isDestroyed() || state !== 'DRAGGED') return;
  const display = screen.getDisplayNearestPoint({ x: point.x, y: point.y });
  const area = display.workArea;
  const bounds = petWindow.getBounds();
  const x = Math.max(area.x, Math.min(point.x - dragOffset.x, area.x + area.width - bounds.width));
  const y = Math.max(area.y, Math.min(point.y - dragOffset.y, area.y + area.height - bounds.height));
  petWindow.setPosition(Math.round(x), Math.round(y), false);
});

ipcMain.on('drag:end', () => {
  if (!petWindow || petWindow.isDestroyed() || state !== 'DRAGGED') return;
  clampWindowToWorkArea(petWindow, true);
  setState('LANDING');
  scheduleBehavior(850);
});
