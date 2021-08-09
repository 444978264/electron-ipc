const { IPCServer } = require('../dist');
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'app.js'),
      devTools: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
}

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  const serve = new IPCServer();
  createWindow();
  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
