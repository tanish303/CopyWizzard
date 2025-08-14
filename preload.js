const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  verifyApiKey: (apiKey) => ipcRenderer.invoke('verify-api-key', apiKey), // --- NEW ---
  setApiKey: (apiKey) => ipcRenderer.invoke('set-api-key', apiKey),
  setLaunchAtLogin: (value) => ipcRenderer.invoke('set-launch-at-login', value),
  setCustomPrompt: (prompt) => ipcRenderer.invoke('set-custom-prompt', prompt),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  toggleFavorite: (itemId) => ipcRenderer.invoke('toggle-favorite', itemId),

  // Other
  onHotkeyResponse: (callback) => {
    const listener = (_event, text) => callback(text);
    ipcRenderer.on('hotkey-response', listener);
    return () => ipcRenderer.removeListener('hotkey-response', listener);
  }
});
