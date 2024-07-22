const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  getAssetPath: (assetName) => {
    return path.join(__dirname, 'public', assetName);
  }
});
