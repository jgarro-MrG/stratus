import { AppData } from '../types';
import '../electron.d.ts';

// --- Session State ---
let activeFilePath: string | null = null;

export function getActivePath(): string {
  if (!activeFilePath) {
    throw new Error("No active file path set for the current session.");
  }
  return activeFilePath;
}

export function setActiveSessionPath(path: string | null): void {
  activeFilePath = path;
}


// --- Public DB (Store) Accessors ---
const LAST_ACTIVE_KEY = 'lastActiveFile';
const RECENTS_KEY = 'recentFiles';

export interface RecentFile {
  name: string;
  path: string;
  lastAccessed: number;
}
export const getLastActivePathFromStore = () => window.electronAPI.getStoreValue<string>(LAST_ACTIVE_KEY);
export const setLastActivePathInStore = (path: string) => window.electronAPI.setStoreValue(LAST_ACTIVE_KEY, path);

export const getRecentFilesFromStore = async (): Promise<RecentFile[]> => {
    const recents = await window.electronAPI.getStoreValue<RecentFile[]>(RECENTS_KEY) || [];
    return recents.sort((a,b) => b.lastAccessed - a.lastAccessed);
};
const setRecentFilesInStore = (files: RecentFile[]) => window.electronAPI.setStoreValue(RECENTS_KEY, files);

export const addPathToRecents = async (filePath: string) => {
  let recents = await getRecentFilesFromStore();
  const name = filePath.split(/[/\\]/).pop() || 'Untitled';
  
  const updatedRecents = recents.filter(r => r.path !== filePath);

  updatedRecents.unshift({ name, path: filePath, lastAccessed: Date.now() });
  
  const limitedRecents = updatedRecents.slice(0, 5); // Keep only the 5 most recent
  await setRecentFilesInStore(limitedRecents);
};

export const removePathFromRecents = async (filePathToRemove: string) => {
    let recents = await getRecentFilesFromStore();
    const updatedRecents = recents.filter(r => r.path !== filePathToRemove);
    await setRecentFilesInStore(updatedRecents);
};


// --- Core File System Logic using Electron IPC ---

export async function pickNewFile(): Promise<string | undefined> {
    const filePath = await window.electronAPI.saveFile();
    if (filePath) {
        await addPathToRecents(filePath);
        await setLastActivePathInStore(filePath);
    }
    return filePath;
}

export async function pickOpenFile(): Promise<string | undefined> {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
        await addPathToRecents(filePath);
        await setLastActivePathInStore(filePath);
    }
    return filePath;
}

const defaultData: AppData = { clients: [], projects: [], timeEntries: [] };

export async function readDataFile(filePath: string): Promise<AppData> {
  try {
    const content = await window.electronAPI.readFile(filePath);
    if (!content) return JSON.parse(JSON.stringify(defaultData)); // Return a fresh copy
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to read or parse data file:", e);
    return JSON.parse(JSON.stringify(defaultData)); // Return a fresh copy on error
  }
}

export async function writeDataFile(filePath: string, content: AppData): Promise<void> {
  await window.electronAPI.writeFile(filePath, JSON.stringify(content, null, 2));
}
