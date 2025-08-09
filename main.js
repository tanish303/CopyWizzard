// =======================================================================
// File: main.js
// Description: The main Electron process, with robust IPC, hotkey
// handling, and dynamic Vite dev server loading.
// =======================================================================
const { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu } = require('electron');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true, // Window is now visible on startup for easier debugging
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setToolTip('Gemini Hotkey Tool');
  tray.setContextMenu(contextMenu);
}

function registerHotkey() {
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    const selectedText = clipboard.readText().trim();
    if (mainWindow) {
      if (selectedText) {
        mainWindow.webContents.send('hotkey-triggered', selectedText);

        const maxRetries = 5;
        let delay = 1000;

        for (let i = 0; i < maxRetries; i++) {
          try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(selectedText);
            const explanation = result.response.text();
            
            mainWindow.webContents.send('hotkey-response', explanation);
            return;
          } catch (error) {
            console.error('Gemini API error:', error);
            if (error.status === 503 && i < maxRetries - 1) {
              console.log(`Retrying in ${delay / 1000} seconds...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2;
            } else {
              mainWindow.webContents.send('hotkey-response', 'An error occurred while contacting Gemini.');
              return;
            }
          }
        }
      } else {
        console.log('Clipboard is empty. Hotkey ignored.');
        mainWindow.webContents.send('hotkey-response', 'Clipboard is empty. Copy some text first!');
      }
    } else {
      console.log('Main window is not ready.');
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerHotkey();
  app.setLoginItemSettings({
    openAtLogin: true
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
