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
    show: false, // Start hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  mainWindow.loadURL('http://localhost:5176');

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png')); // add your icon.png in project root
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
    if (selectedText && mainWindow) {
      // Send loading signal immediately
      mainWindow.webContents.send('hotkey-trigger', '__loading__');

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(selectedText);
        const explanation = result.response.text();

        mainWindow.webContents.send('hotkey-trigger', explanation);
      } catch (error) {
        console.error('Gemini API error:', error);
        mainWindow.webContents.send('hotkey-trigger', 'An error occurred while contacting Gemini.');
      }
    } else {
      console.log('No text found in clipboard or mainWindow not ready');
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

// Handle Gemini request
ipcMain.handle('ask-gpt', async (event, text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(text);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'An error occurred while contacting Gemini.';
  }
});
