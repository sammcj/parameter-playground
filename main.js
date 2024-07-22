const { app, BrowserWindow } = require('electron');
const path = require('path');
const { title } = require('process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1640,
    movable: true,
    // frame: false,
    icon: path.join(__dirname, 'assets/icon.png'),
    zoomToPageWidth: true,
    title: 'LLM Parameter Playground',
    minWidth: 1660,
    minHeight: 1080,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      webSecurity: true
    }
  });

  const startUrl = `file://${path.join(app.getAppPath(), 'out/index.html')}`;

  win.loadURL(startUrl);

  // Enable devtools
  // win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    win.show()
  })

}

const { session } = require('electron')

app.whenReady().then(() => {
  // allow all cors
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = '*';
    callback({ requestHeaders: details.requestHeaders });
  });


  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.responseHeaders) {
      details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    }
    callback({ responseHeaders: details.responseHeaders });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// improve performance of first launch by caching the app
app.commandLine.appendSwitch('js-flags', '--no-lazy');

//hot reload
try {
  require('electron-reloader')(module)
} catch (_) { }

