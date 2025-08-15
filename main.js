const { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// These will be initialized after the app is ready
let genAI;
let store;

const DEFAULT_PROMPT = "You are an AI assistant integrated into a desktop tool named \"CopyWizz\". Your sole purpose is to explain selected text from the user's screen in a concise and clear manner.\n\nInstructions:\n- Don't ask questions or engage in conversation.\n- Provide a direct, factual explanation of the selected text.\n- Keep your response between 0- 200 words. Aim for the shortest, clearest explanation possible without over-explaining.\n- If you are unable to understand or explain the selected text, say \"I couldn't find a simple explanation for this. For a more detailed look, you can continue this conversation by clicking on 'Continue Conversation'.\"\n- If the selected text is a question, answer it directly without asking any follow-up questions.";

function initializeGenAI() {
  console.log('[AI] Initializing AI client...');
  if (!store) {
    console.error('[AI] Store not initialized. Cannot get API key.');
    return;
  }
  const apiKey = store.get('apiKey') || process.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[AI] AI client initialized successfully.');
  } else {
    genAI = null;
    console.warn('[AI] AI client not initialized. API key is missing.');
  }
}

const historyFilePath = path.join(app.getPath('userData'), 'history.json');

let mainWindow;
let tray;
let notificationWindow;

function safeWriteFile(filePath, data) {
  const tempFilePath = filePath + '.tmp';
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempFilePath, jsonString, 'utf-8');
    fs.renameSync(tempFilePath, filePath);
  } catch (error) {
    console.error('[History] CRITICAL: Failed during safe write operation.', error);
  }
}

function readHistoryFile() {
  try {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[History] CRITICAL: Failed to read or parse history.json.', error);
    const tempFilePath = historyFilePath + '.tmp';
    if (fs.existsSync(tempFilePath)) {
      try {
        const data = fs.readFileSync(tempFilePath, 'utf-8');
        return JSON.parse(data);
      } catch (nestedError) {
        console.error('[History] CRITICAL: Failed to read backup history file.', nestedError);
      }
    }
  }
  return [];
}

function addHistoryEntry(newEntry) {
  const history = readHistoryFile();
  const entryToAdd = {
    id: Date.now().toString(),
    ...newEntry,
    timestamp: new Date().toISOString(),
    favorited: false,
  };
  history.unshift(entryToAdd);
  safeWriteFile(historyFilePath, history);
}

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

async function createNotificationWindow() {
  notificationWindow = new BrowserWindow({
    width: 360,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'notification-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  }); 

  await notificationWindow.loadFile('notification.html');
}

function positionAndResizeToast() {
  if (!notificationWindow) return;
  setTimeout(() => {
    notificationWindow.webContents.executeJavaScript(
      `document.querySelector('.toast')?.offsetHeight || 100`
    ).then(height => {
      const display = screen.getPrimaryDisplay();
      const { width: screenW, height: screenH } = display.workAreaSize;
      const margin = 20;
      notificationWindow.setBounds({
        width: 360,
        height: height,
        x: screenW - 360 - margin,
        y: screenH - height - margin
      });
      notificationWindow.showInactive();
    }).catch(err => console.error('[Toast] Error measuring toast height:', err));
  }, 100);
}

function registerHotkey() {
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    if (!genAI) {
      notificationWindow.webContents.send('show-notification', {
        title: 'API Key Missing',
        body: 'Please set your Gemini API key in the Settings tab.'
      });
      positionAndResizeToast();
      return;
    }

    const selectedText = clipboard.readText().trim();
    if (notificationWindow && selectedText) {
      notificationWindow.webContents.send('show-notification', {
        title: 'CopyWizz',
        body: 'Getting info...'
      });
      positionAndResizeToast();

      const customPrompt = store.get('customPrompt', DEFAULT_PROMPT);
      const fullPrompt = `${customPrompt}\n\nSelected Text:\n${selectedText}`;
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullPrompt);
        const explanation = result.response.text();
        
        notificationWindow.webContents.send('show-notification', {
          title: 'CopyWizz Response',
          body: explanation,
          originalText: selectedText
        });
        positionAndResizeToast();

        addHistoryEntry({ query: selectedText, response: explanation });
      } catch (error) {
        console.error('Gemini API error:', error);
        notificationWindow.webContents.send('show-notification', {
          title: 'Error',
          body: 'An error occurred. Check your API key or network.'
        });
        positionAndResizeToast();
      }
    } else {
      if (notificationWindow) {
        notificationWindow.webContents.send('show-notification', {
          title: 'CopyWizz',
          body: 'Clipboard is empty. Copy some text first!'
        });
        positionAndResizeToast();
      }
    }
  });
}

// --- IPC HANDLERS ---
ipcMain.handle('get-settings', () => {
  console.log('[IPC] get-settings called');
  if (!store) return {};
  return {
    apiKey: store.get('apiKey', ''),
    launchAtLogin: store.get('launchAtLogin', true),
    customPrompt: store.get('customPrompt', DEFAULT_PROMPT),
    appVersion: app.getVersion()
  };
});

// --- NEW: IPC Handler to verify an API key ---
ipcMain.handle('verify-api-key', async (event, apiKey) => {
  console.log('[IPC] verify-api-key called');
  if (!apiKey) {
    return { success: false, error: 'API key cannot be empty.' };
  }
  try {
    const tempGenAI = new GoogleGenerativeAI(apiKey);
    const model = tempGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Make a simple, low-cost call to verify the key
    await model.countTokens("test");
    console.log('[IPC] API key verification successful.');
    return { success: true };
  } catch (error) {
    console.error('[IPC] API key verification failed:', error.message);
    return { success: false, error: 'Invalid API Key or network issue.' };
  }
});

ipcMain.handle('set-api-key', (event, apiKey) => {
  console.log('[IPC] set-api-key called');
  if (!store) return;
  store.set('apiKey', apiKey);
  initializeGenAI();
});

ipcMain.handle('set-launch-at-login', (event, value) => {
  console.log(`[IPC] set-launch-at-login called with value: ${value}`);
  if (!store) return;
  store.set('launchAtLogin', value);
  app.setLoginItemSettings({ openAtLogin: value });
});

ipcMain.handle('set-custom-prompt', (event, prompt) => {
  console.log('[IPC] set-custom-prompt called');
  if (!store) return;
  store.set('customPrompt', prompt);
});

ipcMain.handle('get-history', () => readHistoryFile());
ipcMain.handle('toggle-favorite', (event, itemId) => {
  const history = readHistoryFile();
  const itemIndex = history.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    history[itemIndex].favorited = !history[itemIndex].favorited;
    safeWriteFile(historyFilePath, history);
  }
});

ipcMain.on('hide-window', () => { if (notificationWindow) notificationWindow.hide(); });
ipcMain.on('write-clipboard', (event, text) => { if (text) { clipboard.writeText(text); } });
ipcMain.on('open-url', (event, url) => { shell.openExternal(url); });
ipcMain.handle('get-theme', () => {
  // Get the theme from the store, defaulting to 'light' if it's not set
  const theme = store.get('theme', 'light');
  console.log(`[IPC] get-theme: returning ${theme}`);
  return theme;
});

ipcMain.handle('set-theme', (event, theme) => {
  console.log(`[IPC] set-theme: saving ${theme}`);
  // Save the new theme to the config.json file
  store.set('theme', theme);
});

async function initializeApp() {
  const { default: Store } = await import('electron-store');
  store = new Store();
  console.log('[Startup] Electron-store initialized.');

  initializeGenAI();
  createWindow();
  createTray();
  await createNotificationWindow(); 
  registerHotkey(); 
  
  const launchAtLogin = store.get('launchAtLogin', true);
  app.setLoginItemSettings({ openAtLogin: launchAtLogin });
  console.log(`[Startup] Launch at login set to: ${launchAtLogin}`);
}

app.whenReady().then(initializeApp);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
