const { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

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
    const selectedText = clipboard.readText().trim();
    if (notificationWindow && selectedText) {
      notificationWindow.webContents.send('show-notification', {
        title: 'CopyWizz',
        body: 'Getting info...'
      });
      positionAndResizeToast(); // Show "Getting info..." toast

      const defaultPrompt = "You are an AI assistant integrated into a desktop tool named \"CopyWizz\". Your sole purpose is to explain selected text from the user's screen in a concise and clear manner.\n\nInstructions:\n- Don't ask questions or engage in conversation.\n- Provide a direct, factual explanation of the selected text.\n- Keep your response between 0- 200 words. Aim for the shortest, clearest explanation possible without over-explaining.\n- If you are unable to understand or explain the selected text, say \"I couldn't find a simple explanation for this. For a more detailed look, you can continue this conversation by clicking on button below'.\"\n- If the selected text is a question, answer it directly without asking any follow-up questions.";
      const fullPrompt = `${defaultPrompt}\n\nSelected Text:\n${selectedText}`;
      
      const maxRetries = 5;
      let delay = 1000;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(fullPrompt);
          const explanation = result.response.text();
          
          notificationWindow.webContents.send('show-notification', {
            title: 'CopyWizz Response',
            body: explanation,
            originalText: selectedText
          });
          positionAndResizeToast(); // Show response toast

          addHistoryEntry({ query: selectedText, response: explanation });
          return;
        } catch (error) {
          console.error('Gemini API error:', error);
          if (error.status === 503 && i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            notificationWindow.webContents.send('show-notification', {
              title: 'Error',
              body: 'An error occurred while contacting AI.'
            });
            positionAndResizeToast(); // Show error toast
            return;
          }
        }
      }
    } else {
      if (notificationWindow) {
        notificationWindow.webContents.send('show-notification', {
          title: 'CopyWizz',
          body: 'Clipboard is empty. Copy some text first!'
        });
        positionAndResizeToast(); // Show "empty clipboard" toast
      }
    }
  });
}

ipcMain.handle('get-history', () => {
  return readHistoryFile();
});

ipcMain.handle('toggle-favorite', (event, itemId) => {
  const history = readHistoryFile();
  const itemIndex = history.findIndex(item => item.id === itemId);

  if (itemIndex !== -1) {
    history[itemIndex].favorited = !history[itemIndex].favorited;
    safeWriteFile(historyFilePath, history);
  }
});

// The ipcMain.on('show-window', ...) listener is no longer needed and has been removed.
ipcMain.on('hide-window', () => { if (notificationWindow) notificationWindow.hide(); });
ipcMain.on('write-clipboard', (event, text) => { if (text) { clipboard.writeText(text); } });
ipcMain.on('open-url', (event, url) => { shell.openExternal(url); });

app.whenReady().then(async () => {
  createWindow();
  createTray();
  await createNotificationWindow(); 
  registerHotkey(); 
  app.setLoginItemSettings({ openAtLogin: true });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});


 
 
 

