const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),
  setDecorations: (enabled) => ipcRenderer.invoke('set-decorations', enabled),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', width, height),
  setMinSize: (width, height) => ipcRenderer.invoke('set-min-size', width, height),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
