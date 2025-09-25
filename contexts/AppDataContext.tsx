import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Client, Project, TimeEntry } from '../types';
import * as api from '../services/api';
import { useDataStore } from './DataStoreContext';

interface AppDataContextType {
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
  activeTimeEntry: TimeEntry | null;
  loading: boolean;
  error: string | null;
  
  refreshData: (includeArchived?: boolean) => Promise<void>;
  
  addClient: (name: string) => Promise<Client | undefined>;
  updateClient: (id: string, updates: Partial<Pick<Client, 'name' | 'isArchived'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addProject: (name: string, clientId: string) => Promise<Project | undefined>;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'isArchived'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  startTimeEntry: (projectId: string, description: string) => Promise<TimeEntry | undefined>;
  stopTimeEntry: (id: string) => Promise<TimeEntry | undefined>;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  getActiveTimeEntry: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isReady } = useDataStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshData = useCallback(async (includeArchived = false) => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, projectsData, timeEntriesData, activeEntryData] = await Promise.all([
        api.getClients(includeArchived),
        api.getProjects(includeArchived),
        api.getTimeEntries(includeArchived),
        api.getActiveTimeEntry()
      ]);
      setClients(clientsData);
      setProjects(projectsData);
      setTimeEntries(timeEntriesData);
      setActiveTimeEntry(activeEntryData);
    } catch (e) {
      console.error(e);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      refreshData();
    }
  }, [isReady, refreshData]);
  
  const getActiveTimeEntry = async () => {
    const entry = await api.getActiveTimeEntry();
    setActiveTimeEntry(entry);
  }

  const addClient = async (name: string) => {
    try {
      const newClient = await api.addClient(name);
      await refreshData();
      return newClient;
    } catch (error) {
      console.error("Failed to add client:", error);
    }
  };

  const updateClient = async (id: string, updates: Partial<Pick<Client, 'name' | 'isArchived'>>) => {
    await api.updateClient(id, updates);
    await refreshData();
  };
  
  const deleteClient = async (id: string) => {
    await api.deleteClient(id);
    await refreshData();
  };

  const addProject = async (name: string, clientId: string) => {
    try {
      const newProject = await api.addProject(name, clientId);
      await refreshData();
      return newProject;
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'name' | 'isArchived'>>) => {
    await api.updateProject(id, updates);
    await refreshData();
  };

  const deleteProject = async (id: string) => {
    await api.deleteProject(id);
    await refreshData();
  };

  const startTimeEntry = async (projectId: string, description: string) => {
    if (activeTimeEntry) {
        await stopTimeEntry(activeTimeEntry.id);
    }
    const newEntryData: Omit<TimeEntry, 'id' | 'isArchived'> = {
        projectId,
        description,
        startTime: new Date(),
        endTime: null,
    };
    const newEntry = await api.addTimeEntry(newEntryData);
    setActiveTimeEntry(newEntry);
    await refreshData();
    return newEntry;
  };

  const stopTimeEntry = async (id: string) => {
    const stoppedEntry = await api.stopTimeEntry(id);
    setActiveTimeEntry(null);
    await refreshData();
    return stoppedEntry;
  };
  
  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    await api.updateTimeEntry(id, updates);
    await refreshData();
  };

  const deleteTimeEntry = async (id: string) => {
    await api.deleteTimeEntry(id);
    await refreshData();
  };
  

  const value = {
    clients,
    projects,
    timeEntries,
    activeTimeEntry,
    loading,
    error,
    refreshData,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    startTimeEntry,
    stopTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getActiveTimeEntry
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
