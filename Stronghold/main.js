const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    window.loadFile('index.html');
}

app.whenReady().then(createWindow);