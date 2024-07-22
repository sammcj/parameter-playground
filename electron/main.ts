import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import { join } from "path";

const appServe = app.isPackaged ? serve({
  directory: join(__dirname, "../out")
}) : null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // contextIsolation: false,
      preload: join(__dirname, 'preload.js')
    }
  });


  if (app.isPackaged) {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    win.loadURL('http://localhost:3000/index.html');


    // Hot Reloading on 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: join(__dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron' + (process.platform === "win32" ? ".cmd" : "")),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }
};


// Hot Reloading on 'node_modules/.bin/electronPath'
require('electron-reload')(__dirname, {
  electron: join(__dirname,
    '..',
    '..',
    'node_modules',
    '.bin',
    'electron' + (process.platform === "win32" ? ".cmd" : "")),
  forceHardReset: true,
  hardResetMethod: 'exit'
});



app.on("ready", () => {
  createWindow();
});

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
