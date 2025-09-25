const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');


const isDev = process.env.NODE_ENV !== 'production';

// --- Schema for the store ---
const schema = {
  appData: {
    type: 'object',
    properties: {
        clients: { type: 'array' },
        projects: { type: 'array' },
        timeEntries: { type: 'array' }
    },
  },
  userSettings: {
    type: 'object',
    properties: {
        profile: { type: 'object' },
        preferences: { type: 'object' }
    },
  }
};

const store = new Store({ schema });

// --- Seed Initial Data on first launch ---
const seedInitialData = () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return {
        clients: [
            { id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Innovate Corp', isArchived: false },
            { id: 'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', name: 'Future Systems', isArchived: false },
        ],
        projects: [
            { id: 'p1', clientId: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Project Phoenix', isArchived: false },
            { id: 'p2', clientId: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Website Redesign', isArchived: false },
            { id: 'p3', clientId: 'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', name: 'AI Integration', isArchived: false },
        ],
        timeEntries: [
            { id: 't1', projectId: 'p1', description: 'Initial project setup and configuration.', startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
            { id: 't2', projectId: 'p2', description: 'Design mockups for the new homepage.', startTime: yesterday.toISOString(), endTime: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString() },
            { id: 't3', projectId: 'p3', description: 'Researching AI models.', startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), endTime: null },
        ]
    };
};

const initializeStore = () => {
  if (!store.get('appData')) {
    store.set('appData', seedInitialData());
  }
  if (!store.get('userSettings')) {
    store.set('userSettings', {
      profile: {
        name: '',
        email: '',
        phone: '',
        profilePicture: null
      },
      preferences: {
        dateFormat: 'MMMM d, yyyy',
        timeFormat: '12h',
        theme: 'system',
        reportSettings: {
          includeName: true,
          includeEmail: true,
          includePhone: false,
        }
      }
    });
  }
};


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
  initializeStore();
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

// --- IPC Handlers for Store ---
ipcMain.handle('store:get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (event, key, val) => {
  store.set(key, val);
});