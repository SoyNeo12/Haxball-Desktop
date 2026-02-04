const { contextBridge, ipcRenderer } = require('electron');

// Expõe API segura pro renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  startAuth: () => ipcRenderer.invoke('auth:start'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Utils
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  closeApp: () => ipcRenderer.invoke('close-app'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Supabase proxy (pra evitar CORS)
  apiGet: (endpoint) => ipcRenderer.invoke('api:get', endpoint),
  apiPost: (endpoint, data) => ipcRenderer.invoke('api:post', endpoint, data)
});
