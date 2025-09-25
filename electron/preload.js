const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File System
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: () => ipcRenderer.invoke('dialog:saveFile'),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  // Persistent Store
  getStoreValue: (key) => ipcRenderer.invoke('store:get', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('store:set', key, value),
});
