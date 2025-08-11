// =======================================================================
// File: notification-preload.js
// Description: This preload script securely exposes IPC functionality
// for the toast notification window. It prevents the renderer from
// having direct access to Node.js.
// =======================================================================
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Listens for the 'show-notification' event from the main process
    onShowNotification: (callback) => ipcRenderer.on('show-notification', (_event, value) => callback(value)),

    // Methods to send messages back to the main process
    showWindow: () => ipcRenderer.send('show-window'),
    hideWindow: () => ipcRenderer.send('hide-window')
});