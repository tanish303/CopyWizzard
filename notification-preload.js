// =======================================================================
// File: notification-preload.js
// Description: Preload script for toast notifications
// =======================================================================
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onShowNotification: (callback) => ipcRenderer.on('show-notification', (_event, value) => callback(value)),
    showWindow: () => ipcRenderer.send('show-window'),
    hideWindow: () => ipcRenderer.send('hide-window'),
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height })
});
