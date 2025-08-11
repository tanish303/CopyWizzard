// =======================================================================
// File: main.js
// Description: The main Electron process with a complete and secure toast
// notification system.
// =======================================================================
const { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu, screen } = require('electron');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

let mainWindow;
let tray;
let notificationWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
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

function createNotificationWindow() {
  const display = screen.getPrimaryDisplay();
  const width = 350;
  const height = 100;

  notificationWindow = new BrowserWindow({
    width: width,
    height: height,
    x: display.workAreaSize.width - width - 20,
    y: display.workAreaSize.height - height - 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false, // Start hidden
    webPreferences: {
      preload: path.join(__dirname, 'notification-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Add error handling to catch file loading issues
  try {
    notificationWindow.loadFile('notification.html');
  } catch (err) {
    console.error('Error loading notification.html:', err);
    // You might want to display a fallback or exit the app here
  }
}

function registerHotkey() {
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    const selectedText = clipboard.readText().trim();
    if (selectedText) {
      notificationWindow.webContents.send('show-notification', {
        title: 'CopyWizz',
        body: 'Getting info from Gemini...'
      });

      const maxRetries = 5;
      let delay = 1000;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(selectedText);
          const explanation = result.response.text();
          
          notificationWindow.webContents.send('show-notification', {
            title: 'Gemini Response',
            body: explanation
          });
          return;
        } catch (error) {
          console.error('Gemini API error:', error);
          if (error.status === 503 && i < maxRetries - 1) {
            console.log(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            notificationWindow.webContents.send('show-notification', {
              title: 'Error',
              body: 'An error occurred while contacting Gemini.'
            });
            return;
          }
        }
      }
    } else {
      notificationWindow.webContents.send('show-notification', {
        title: 'CopyWizz',
        body: 'Clipboard is empty. Copy some text first!'
      });
    }
  });
}

// IPC handlers for managing the notification window
ipcMain.on('show-window', () => {
  if (notificationWindow) {
    notificationWindow.show();
  }
});

ipcMain.on('hide-window', () => {
  if (notificationWindow) {
    notificationWindow.hide();
  }
});


app.whenReady().then(() => {
  createWindow();
  createTray();
  createNotificationWindow();
  registerHotkey();
  app.setLoginItemSettings({
    openAtLogin: true
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
}); 