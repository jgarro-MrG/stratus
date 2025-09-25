const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isDev = process.env.NODE_ENV !== 'production';

// --- Persistent Store for recent files and settings ---
class Store {
  constructor(opts) {
    const userDataPath = app.getPath('userData');
    this.path = path.join(userDataPath, opts.configName + '.json');
    this.data = this.parseDataFile(this.path, opts.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  parseDataFile(filePath, defaults) {
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
      return defaults;
    }
  }
}

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    lastActiveFile: null,
    recentFiles: [],
  },
});


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    title: 'Stratus Time Tracker',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers for File System ---

ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Stratus Data File', extensions: ['json'] }]
    });
    if (!canceled) {
        return filePaths[0];
    }
});

ipcMain.handle('dialog:saveFile', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Create New Data File',
        defaultPath: `stratus-data-${Date.now()}.json`,
        filters: [{ name: 'Stratus Data File', extensions: ['json'] }]
    });
    if (!canceled) {
        return filePath;
    }
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error('Failed to read file:', error);
        return null;
    }
});

ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
        console.error('Failed to write file:', error);
    }
});

// --- IPC Handlers for Store ---
ipcMain.handle('store:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (event, key, val) => {
  store.set(key, val);
});