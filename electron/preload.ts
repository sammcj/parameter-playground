import { contextBridge, ipcRenderer } from "electron";

// electron/preload.ts:4:43 - error TS2503: Cannot find namespace 'Electron'.
// fix:
declare global {
  interface Window {
    electronAPI: {
      on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
      send: (channel: string, args: any) => void;
    };
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel: string, args: any) => {
    ipcRenderer.send(channel, args);
  }
});
