const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('node:path');

let window;
let view;

function createWindow() {
    window = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Stronghold',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    window.loadFile('index.html');

    view = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    window.setBrowserView(view);

    const layout = () => {
        if(!window || window.isDestroyed() || !view) {
            return;
        }
        const [width, height] = window.getContentSize();
        view.setBounds({ x: 0, y: 60, width: width, height: height - 60});
    };
    
    layout();
    window.on('resize', layout);

    view.webContents.on('did-start-navigation', (_e, url, isInPlace, isMainFrame) => {
        if(isMainFrame) {
            window.webContents.send('change-location', url);
        }
    });

    view.webContents.on('page-title-updated', (_e, title) => {
        if(window && !window.isDestroyed()) {
            window.setTitle(`Stronghold - ${title}`);
        }
    });
}

app.whenReady().then(createWindow);

function normaliseURL(input) {
    try {
        if(!/^https?:\/\//i.test(input)) {
            return new URL('https://' + input).toString();
        }

        else {
            return new URL(input).toString();
        }

    } catch {
        return null;
    }
}

ipcMain.handle('navigate:goto', async (_e, raw) => {
    const url = normaliseURL(raw);
    if(!url) {
        return {
            okay: false,
            error: 'Invalid URL'
        };
    }
    await view.webContents.loadURL(url);
    return {
        okay: true,
        url
    };
});

ipcMain.handle('navigate:back', () => {
    if(view && !view.isDestroyed() && view.webContents.canGoBack()) {
        view.webContents.goBack();
    }
});

ipcMain.handle('navigate:forward', () => {
    if(view && !view.isDestroyed() && view.webContents.canGoForward()) {
        view.webContents.goForward();
    }
});

ipcMain.handle('navigate:reload', () => {
    if(view && !view.isDestroyed()) {
        view.webContents.Reload();
    }
});

ipcMain.handle('navigate:home', () => {
    if(view && !view.isDestroyed()) {
        view.webContents.loadURL('https://strongholdbrowser.com');
    }
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
})