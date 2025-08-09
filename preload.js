// =======================================================================
// File: preload.js
// Description: Secure bridge between the Electron main process and
// the React renderer process.
// =======================================================================
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  askGPT: (text) => ipcRenderer.invoke('ask-gpt', text),
  
  onHotkeyTriggered: (callback) => ipcRenderer.on('hotkey-triggered', (_event, text) => callback(text)),
  
  onHotkeyResponse: (callback) => ipcRenderer.on('hotkey-response', (_event, text) => callback(text))
});
