const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pokoAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setPet: (pet) => ipcRenderer.invoke('settings:set-pet', pet),
  setPaused: (paused) => ipcRenderer.invoke('settings:set-paused', paused),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('settings:set-always-on-top', value),
  beginDrag: (point) => ipcRenderer.send('pet:drag-start', point),
  dragTo: (point) => ipcRenderer.send('pet:drag-move', point),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  showContextMenu: () => ipcRenderer.send('menu:context'),
  openSettings: () => ipcRenderer.send('settings:open'),
  onSettings: (listener) => {
    const wrapped = (_event, settings) => listener(settings);
    ipcRenderer.on('settings:changed', wrapped);
    return () => ipcRenderer.removeListener('settings:changed', wrapped);
  },
  onCommand: (listener) => {
    const wrapped = (_event, command) => listener(command);
    ipcRenderer.on('pet:command', wrapped);
    return () => ipcRenderer.removeListener('pet:command', wrapped);
  }
});
