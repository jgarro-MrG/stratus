import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { 
    getLastActivePathFromStore,
    setActiveSessionPath, 
    pickNewFile,
    pickOpenFile,
    setLastActivePathInStore,
    addPathToRecents,
    RecentFile,
    getRecentFilesFromStore,
    removePathFromRecents,
    readDataFile,
} from '../services/fileSystem';
import { seedInitialData } from '../services/api';

interface DataStoreContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  recentFiles: RecentFile[];
  loadRecents: () => void;
  createNewDataFile: () => Promise<void>;
  openDataFile: () => Promise<void>;
  openRecentDataFile: (path: string) => Promise<void>;
  forgetFile: (path: string) => Promise<void>;
  resetDataStore: () => void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export const DataStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupActiveFile = async (filePath: string) => {
      // Validate that it's a proper data file
      const data = await readDataFile(filePath);
      if (!data || !Array.isArray(data.clients) || !Array.isArray(data.projects) || !Array.isArray(data.timeEntries)) {
        const fileName = filePath.split(/[/\\]/).pop();
        setError(`The selected file "${fileName}" is not a valid Stratus data file.`);
        await removePathFromRecents(filePath);
        loadRecents();
        return;
      }
      
      await setLastActivePathInStore(filePath);
      await addPathToRecents(filePath);
      setActiveSessionPath(filePath);
      setActivePath(filePath);
      loadRecents();
  }

  useEffect(() => {
    const checkLastActive = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const path = await getLastActivePathFromStore();
        if (path) {
          await setupActiveFile(path);
        }
      } catch(err) {
        console.error("Error checking for last active file:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkLastActive();
  }, []);

  const loadRecents = useCallback(async () => {
    const files = await getRecentFilesFromStore();
    setRecentFiles(files);
  }, []);
  
  const createNewDataFile = useCallback(async () => {
    setError(null);
    try {
      const filePath = await pickNewFile();
      if(filePath){
        await seedInitialData(filePath);
        await setupActiveFile(filePath);
      }
    } catch (err) {
      console.error("Failed to create new data file:", err);
      setError("Could not create the new data file.");
    }
  }, []);

  const openDataFile = useCallback(async () => {
    setError(null);
    try {
      const filePath = await pickOpenFile();
      if(filePath) {
        await setupActiveFile(filePath);
      }
    } catch (err) {
      console.error("Failed to open data file:", err);
      setError("Could not open the selected file.");
    }
  }, []);
  
  const openRecentDataFile = useCallback(async (path: string) => {
    setError(null);
    await setupActiveFile(path);
  }, []);
  
  const forgetFile = useCallback(async (path: string) => {
    await removePathFromRecents(path);
    loadRecents();
  }, [loadRecents]);
  
  const resetDataStore = () => {
    setActiveSessionPath(null);
    setActivePath(null);
  };

  const value = {
    isReady: !!activePath,
    isLoading,
    error,
    recentFiles: recentFiles,
    loadRecents,
    createNewDataFile,
    openDataFile,
    openRecentDataFile,
    forgetFile,
    resetDataStore,
  };

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
};

export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (context === undefined) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
};