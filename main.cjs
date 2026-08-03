const { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const WINDOW = { width: 180, height: 180 };
let petWindow;
let settingsWindow;
let tray;
let dragOffset = null;
let settings = { pet: 'poko', paused: false, alwaysOnTop: true };

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const value = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    settings = { ...settings, ...value };
  } catch {}
}

function saveSettings() {
  const target = settingsPath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temp = `${target}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(settings, null, 2));
  fs.renameSync(temp, target);
}

function broadcastSettings() {
  for (const win of [petWindow, settingsWindow]) {
    if (win && !win.isDestroyed()) win.webContents.send('settings:changed', settings);
  }
  rebuildTrayMenu();
}

function patchSettings(patch) {
  settings = { ...settings, ...patch };
  saveSettings();
  if (petWindow && !petWindow.isDestroyed()) petWindow.setAlwaysOnTop(settings.alwaysOnTop, 'floating');
  broadcastSettings();
  return settings;
}

function workAreaForPoint(point) {
  return screen.getDisplayNearestPoint(point).workArea;
}

function clampPetToDisplay() {
  if (!petWindow || petWindow.isDestroyed()) return;
  const bounds = petWindow.getBounds();
  const area = screen.getDisplayMatching(bounds).workArea;
  const x = Math.max(area.x, Math.min(bounds.x, area.x + area.width - bounds.width));
  const y = area.y + area.height - bounds.height;
  petWindow.setPosition(Math.round(x), Math.round(y), false);
}

function iconDataUrl() {
  const fill = settings.pet === 'poko' ? '#f29cb2' : '#f2d4a5';
  const ears = settings.pet === 'poko'
    ? '<path d="M17 20 20 7l10 10M47 20 44 7 34 17"/>'
    : '<ellipse cx="23" cy="12" rx="6" ry="12"/><ellipse cx="41" cy="12" rx="6" ry="12"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g fill="${fill}" stroke="#5b3a48" stroke-width="3" stroke-linejoin="round">${ears}<ellipse cx="32" cy="37" rx="24" ry="21"/></g><ellipse cx="25" cy="35" rx="3" ry="5" fill="#362330"/><ellipse cx="39" cy="35" rx="3" ry="5" fill="#362330"/><path d="M28 44q4 4 8 0" fill="none" stroke="#362330" stroke-width="2" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function createPetWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  petWindow = new BrowserWindow({
    width: WINDOW.width,
    height: WINDOW.height,
    x: Math.round(area.x + area.width / 2 - WINDOW.width / 2),
    y: area.y + area.height - WINDOW.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: settings.alwaysOnTop,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  petWindow.setAlwaysOnTop(settings.alwaysOnTop, 'floating');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadFile('index.html', { query: { mode: 'pet' } });
  petWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  petWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  petWindow.on('closed', () => { petWindow = undefined; });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({
    width: 430,
    height: 390,
    resizable: false,
    title: 'PokoLoko Settings',
    backgroundColor: '#17131a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  settingsWindow.loadFile('index.html', { query: { mode: 'settings' } });
  settingsWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  settingsWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  settingsWindow.on('closed', () => { settingsWindow = undefined; });
}

function menuTemplate() {
  return [
    {
      label: 'Choose Pet',
      submenu: [
        { label: 'Poko', type: 'radio', checked: settings.pet === 'poko', click: () => patchSettings({ pet: 'poko' }) },
        { label: 'Loko', type: 'radio', checked: settings.pet === 'loko', click: () => patchSettings({ pet: 'loko' }) }
      ]
    },
    { type: 'separator' },
    { label: settings.paused ? 'Resume Pet' : 'Pause Pet', click: () => patchSettings({ paused: !settings.paused }) },
    { label: 'Always on Top', type: 'checkbox', checked: settings.alwaysOnTop, click: (item) => patchSettings({ alwaysOnTop: item.checked }) },
    { label: 'Open Settings', click: createSettingsWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ];
}

function rebuildTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  tray.setImage(nativeImage.createFromDataURL(iconDataUrl()).resize({ width: 20, height: 20 }));
  tray.setToolTip(`PokoLoko — ${settings.pet === 'poko' ? 'Poko' : 'Loko'}`);
  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate()));
}

function createTray() {
  tray = new Tray(nativeImage.createFromDataURL(iconDataUrl()).resize({ width: 20, height: 20 }));
  tray.on('double-click', createSettingsWindow);
  rebuildTrayMenu();
}

function registerIpc() {
  ipcMain.handle('settings:get', () => settings);
  ipcMain.handle('settings:set-pet', (_event, pet) => {
    if (!['poko', 'loko'].includes(pet)) throw new Error('Invalid pet');
    return patchSettings({ pet });
  });
  ipcMain.handle('settings:set-paused', (_event, paused) => patchSettings({ paused: Boolean(paused) }));
  ipcMain.handle('settings:set-always-on-top', (_event, value) => patchSettings({ alwaysOnTop: Boolean(value) }));
  ipcMain.on('settings:open', createSettingsWindow);
  ipcMain.on('menu:context', () => Menu.buildFromTemplate(menuTemplate()).popup({ window: petWindow }));
  ipcMain.on('pet:drag-start', (_event, point) => {
    if (!petWindow || petWindow.isDestroyed()) return;
    const [x, y] = petWindow.getPosition();
    dragOffset = { x: point.x - x, y: point.y - y };
    petWindow.webContents.send('pet:command', 'dragged');
  });
  ipcMain.on('pet:drag-move', (_event, point) => {
    if (!petWindow || !dragOffset) return;
    petWindow.setPosition(Math.round(point.x - dragOffset.x), Math.round(point.y - dragOffset.y), false);
  });
  ipcMain.on('pet:drag-end', () => {
    if (!petWindow || !dragOffset) return;
    dragOffset = null;
    clampPetToDisplay();
    petWindow.webContents.send('pet:command', 'landing');
  });
  ipcMain.on('pet:move', (_event, x) => {
    if (!petWindow || settings.paused || dragOffset) return;
    const bounds = petWindow.getBounds();
    const area = screen.getDisplayMatching(bounds).workArea;
    const nextX = Math.max(area.x, Math.min(Math.round(x), area.x + area.width - bounds.width));
    petWindow.setPosition(nextX, area.y + area.height - bounds.height, false);
  });
}

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();
else {
  app.on('second-instance', () => {
    if (petWindow) { petWindow.show(); petWindow.focus(); }
  });
  app.whenReady().then(() => {
    loadSettings();
    registerIpc();
    createPetWindow();
    createTray();
    screen.on('display-added', clampPetToDisplay);
    screen.on('display-removed', clampPetToDisplay);
    screen.on('display-metrics-changed', clampPetToDisplay);
  });
  app.on('window-all-closed', (event) => event.preventDefault());
}
