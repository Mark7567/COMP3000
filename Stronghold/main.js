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
    window.loadFile('html/taskbar.html');

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
    view.webContents.loadFile(path.join('html/home.html'));
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


// Checks to see if the input is a URL or not
function isURL(input) {
    const validEndings = /\.(com|co\.uk|org|net|edu|gov|uk)$/i;
    const trimmedInput = input.trim();

    if(trimmedInput.includes(" ")) {
        return false;
    }

    if(!validEndings.test(trimmedInput)) {
        return false;
    }

    if(!trimmedInput.includes('.')) {
        return false;
    }

    return true;
}



// Adds https:// to the beginning of an entered URL if it does not have it (if isURL returns true)
function addHTTPS(input) {
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

// Builds a search query if isURL returns false
function buildSearchQuery(input) {
    const searchQuery = encodeURIComponent(input.trim());
    return `https://www.google.com/search?q=${searchQuery}`;

}


// Search Bar + Navigation Buttons
ipcMain.handle('navigate:goto', async (_e, raw) => {
    if(isURL(raw)) {    
        const url = addHTTPS(raw);
        
        await view.webContents.loadURL(url);
        return {
            okay: true,
            url
        };
    } 
    
    else {
        const search = buildSearchQuery(raw);

        await view.webContents.loadURL(search);
        return {
            okay: true,
            search
        };
    }
});

ipcMain.handle('navigate:back', () => {
    if(view && !view.webContents.isDestroyed() && view.webContents.navigationHistory.canGoBack()) {
        view.webContents.navigationHistory.goBack();
    }
});

ipcMain.handle('navigate:forward', () => {
    if(view && !view.webContents.isDestroyed() && view.webContents.navigationHistory.canGoForward()) {
        view.webContents.navigationHistory.goForward();
    }
});

ipcMain.handle('navigate:reload', () => {
    if(view && !view.webContents.isDestroyed()) {
        view.webContents.reload();
    }
});

ipcMain.handle('navigate:home', () => {
    if(view && !view.webContents.isDestroyed()) {
        view.webContents.loadFile('html/home.html');
    }
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
})



// Dashboard Stuff

/*  Want a button in the top right corner which when clicked opens up a new tab with the dashboard
    Dashboard should show stats about user's safety protection
    Should also show XP points and stuff
    Needs some kind of cosmetic alteration
    Should have an option for user to create an account or sign into an existing account
    Needs a feature to use as a guest (potentially locks out of certain features)
    Is also where the quizzes / games / general gamification aspects can be found  */

function dashboard() {

}

ipcMain.handle('navigate:dashboard', async (_e) => {
    const html = 'html/dashboard.html' 
    await view.webContents.loadFile(html);
    return {
        okay: true,
        html
    }
})



// Settings Stuff

function settings() {

}

ipcMain.handle('navigate:settings', async (_e) => {
    const html = 'html/settings.html'
    await view.webContents.loadFile(html);
    return {
        okay: true,
        html
    }
})



// Bookmarks Stuff

/* Needs to add the current page to the bookmarks tab and allow the user to edit the name within the bookmarks
   Should change from empty to filled in when the page has been bookmarked to indicate such
   Just a pop-up in the top right corner under the taskbar - need to figure out how */

function bookmarks() { 

}



// Downloads Stuff

/* Needs to display current downloads from the browser
   Maybe add a time filter to show 1h, 6h, 24h, 3 month etc.
   Might have it clear after a set time limit which can be changed in settings to promote security
   Just a pop-up in the top right corner under the taskbar - need to figure out how
   Add extra features possibly to allow user to open file from clicking in downloads pop-up
   Open in a pop-up initially then have the option to open in a big screen (maybe show 5 in pop-up and all in big screen?) */

function downloads() {
    
}