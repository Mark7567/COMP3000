const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('stronghold', {
    goto: (url) => ipcRenderer.invoke('navigate:goto', url),
    back: () => ipcRenderer.invoke('navigate:back'),
    forward: () => ipcRenderer.invoke('navigate:forward'),
    reload: () => ipcRenderer.invoke('navigate:reload'),
    home: () => ipcRenderer.invoke('navigate:home'),
    onLocationChange: (cb) => ipcRenderer.on('location-change', (_e, url) => cb(url))
});