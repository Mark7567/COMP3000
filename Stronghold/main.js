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



/*  Need to make sure that a user can search for something as a query without needing to enter a URL
    This will also help for when searching for something but forgetting .com or .co.uk etc. at the end of the search
        (which currently returns nothing as there is no ability to search for non-websites)
*/

// Checks to see if the input is a URL or not - Determines which out of normaliseURL() and buildSearchQuery() get called
function isURL(input) {
    /* 
    
        IF input CONTAINS no spaces, full stop, has a valid end (i.e. .com, .org, .co.uk)
        Utilise encodeURIComponent() to deal with spaces, weird characters and SQL injections
        
    */
}



// Adds https:// to the beginning of an entered URL if it does not have it (if the input looks like a URL)
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

// Builds a search query if the input does not look like a URL
function buildSearchQuery(input) {

    /* 
    
        Make the search into a valid query
        https://www.google.com/search?q= + encodeURIComponent(input)
        If search contains multiple words, join them using plus signs

        IF input CONTAINS *SPACE* THEN "+" between each space
        ELSE THEN encodeURIComponent(input)

    */
   
    length = input.length;
    for(let i = 0; i < length; i++) {
        /*

            Loop through the length of the input and check for white space
            If white space is detected, replace it with a "+"
            Send the final input through to encodeURIComponent which is then searched in the navigation

        */
    }

    searchQuery = encodeURIComponent(input);

}


// Search Bar + Navigation Buttons
ipcMain.handle('navigate:goto', async (_e, raw) => {
    const url = addHTTPS(raw);
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