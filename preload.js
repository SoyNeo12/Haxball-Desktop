const { contextBridge, ipcRenderer } = require('electron');

// Expõe API segura pro renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  getUsers: () => ipcRenderer.invoke('backend:getUsers'),
  addUser: (user) => ipcRenderer.invoke('backend:addUser', user),

  // Utils
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  closeApp: () => ipcRenderer.invoke('close-app'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Supabase proxy (pra evitar CORS)
  apiGet: (endpoint) => ipcRenderer.invoke('api:get', endpoint),
  apiPost: (endpoint, data) => ipcRenderer.invoke('api:post', endpoint, data)
});
