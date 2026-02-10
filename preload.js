const { contextBridge, ipcRenderer } = require('electron');

// Expõe API segura pro renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  closeApp: () => ipcRenderer.invoke('close-app'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Auto Update
  check: () => ipcRenderer.invoke('updater-check'),
  download: () => ipcRenderer.invoke('updater-download'),
  apply: () => ipcRenderer.invoke('updater-apply')
});
