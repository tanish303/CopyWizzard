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

  notificationWindow.loadFile('notification.html');
}

function positionAndResizeToast() {
  if (!notificationWindow) return;

  notificationWindow.webContents.executeJavaScript(`
    document.querySelector('.toast')?.offsetHeight || 100
  `).then(height => {
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
  }).catch(err => console.error('Error measuring toast height:', err));
}


function registerHotkey() {
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    const selectedText = clipboard.readText().trim();
    if (notificationWindow && selectedText) {
      const defaultPrompt = "You are an AI assistant integrated into a desktop tool named \"CopyWizz\". Your sole purpose is to explain selected text from the user's screen in a concise and clear manner.\n\nInstructions:\n- Don't ask questions or engage in conversation.\n- Provide a direct, factual explanation of the selected text.\n- Keep your response between 0- 200 words. Aim for the shortest, clearest explanation possible without over-explaining.\n- If you are unable to understand or explain the selected text, say \"I couldn't find a simple explanation for this. For a more detailed look, you can continue this conversation by clicking on 'Continue Conversation'.\"\n- If the selected text is a question, answer it directly without asking any follow-up questions.";
      const fullPrompt = `${defaultPrompt}\n\nSelected Text:\n${selectedText}`;
      lastFullPrompt = fullPrompt;

      notificationWindow.webContents.send('show-notification', {
        title: 'CopyWizz',
        body: 'Getting info...'
      });

      const maxRetries = 5;
      let delay = 1000;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(fullPrompt);
          const explanation = result.response.text();
          
          notificationWindow.webContents.send('show-notification', {
            title: 'CopyWizz Response',
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
              body: 'An error occurred while contacting AI.'
            });
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
      }
    }
  });
}

ipcMain.on('show-window', () => {
  positionAndResizeToast();
});

ipcMain.on('hide-window', () => {
  if (notificationWindow) notificationWindow.hide();
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  createNotificationWindow();
  registerHotkey();
  app.setLoginItemSettings({ openAtLogin: true });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
  

