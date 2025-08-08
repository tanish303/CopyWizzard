const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),  // optional if you want it
  askGPT: (text) => ipcRenderer.invoke('ask-gpt', text),
  
  // Add this listener for hotkey-trigger event
  onHotkey: (callback) => ipcRenderer.on('hotkey-trigger', (_event, text) => callback(text))
});
