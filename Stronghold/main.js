/*

            TO DO LIST:
-------------------------------------
1) Make CSS file for home page
2) Change URL to add .com if not present 
3) Implement session only cookies
4) Create dashboard 

*/

const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('node:path');

let window;
let view;


// Creates the window which the browser will be displayed in 
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

    // Loads the taskbar as a "shell" -> Constantly displays
    window.loadFile('taskbar.html');

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
    view.webContents.loadFile(path.join('home.html'));
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


// Adds https:// to the beginning of an entered URL if it does not have it 
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


// Search Bar + Navigation Buttons
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
    if(view && !view.webContents.isDestroyed() && view.webContents.canGoBack()) {
        view.webContents.goBack();
    }
});

ipcMain.handle('navigate:forward', () => {
    if(view && !view.webContents.isDestroyed() && view.webContents.canGoForward()) {
        view.webContents.goForward();
    }
});

ipcMain.handle('navigate:reload', () => {
    if(view && !view.webContents.isDestroyed()) {
        view.webContents.reload();
    }
});

ipcMain.handle('navigate:home', () => {
    if(view && !view.webContents.isDestroyed()) {
        view.webContents.loadFile('home.html');
    }
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
})



// Dashboard Stuff

/*  Want a button in the top left corner which when clicked opens up a new tab with the dashboard
    Dashboard should show stats about user's safety protection
    Should also show XP points and stuff
    Needs some kind of cosmetic alteration
    Should have an option for user to create an account or sign into an existing account
    Needs a feature to use as a guest (potentially locks out of certain features)
    Is also where the quizzes / games / general gamification aspects can be found  */

function dashboard() {

}

ipcMain.handle('navigate:dashboard', async (_e) => {
    const html = 'dashboard.html' 
    await view.webContents.loadFile(html);
    return {
        okay: true,
        html
    }
})