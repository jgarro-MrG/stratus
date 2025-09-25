import { v4 as uuidv4 } from 'uuid';
import { Client, Project, TimeEntry, AppData, UserSettings } from '../types';

// --- HELPER FUNCTIONS FOR STORE R/W ---
const getAppData = async (): Promise<AppData> => {
    const data = await window.electronAPI.getStoreValue<AppData>('appData');
    return data || { clients: [], projects: [], timeEntries: [] };
};

const setAppData = async (data: AppData): Promise<void> => {
    await window.electronAPI.setStoreValue('appData', data);
};

// --- API SIMULATION HELPER ---
const mockApiCall = <T>(data: T, delay = 50): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// Date parsing helper to convert ISO strings from JSON back to Date objects
// FIX: The return type uses an intersection that creates an impossible type (`string & Date`).
// Casting to `any` bypasses the type error. The runtime object is correct.
const parseTimeEntryDates = (entry: TimeEntry): TimeEntry & { startTime: Date; endTime: Date | null } => ({
    ...entry,
    startTime: new Date(entry.startTime),
    endTime: entry.endTime ? new Date(entry.endTime) : null,
} as any);

// --- API FUNCTIONS ---

// CLIENTS
export const getClients = async (includeArchived = false): Promise<Client[]> => {
    const { clients } = await getAppData();
    const data = includeArchived ? clients : clients.filter(c => !c.isArchived);
    return mockApiCall(data);
};

export const addClient = async (name: string): Promise<Client> => {
    const appData = await getAppData();
    const newClient: Client = { id: uuidv4(), name, isArchived: false };
    appData.clients.push(newClient);
    await setAppData(appData);
    return mockApiCall(newClient);
}

export const updateClient = async (clientId: string, updates: Partial<Pick<Client, 'name' | 'isArchived'>>): Promise<Client> => {
    const appData = await getAppData();
    let updatedClient: Client | null = null;
    appData.clients = appData.clients.map(c => {
        if (c.id === clientId) {
            updatedClient = { ...c, ...updates };
            return updatedClient;
        }
        return c;
    });
    if (!updatedClient) throw new Error("Client not found");
    
    await setAppData(appData);
    return mockApiCall(updatedClient);
}

export const deleteClient = async (clientId: string): Promise<void> => {
    const appData = await getAppData();

    const projectsToDelete = appData.projects.filter(p => p.clientId === clientId).map(p => p.id);

    appData.clients = appData.clients.filter(c => c.id !== clientId);
    appData.projects = appData.projects.filter(p => p.clientId !== clientId);
    appData.timeEntries = appData.timeEntries.filter(t => !projectsToDelete.includes(t.projectId));

    await setAppData(appData);
    return mockApiCall(undefined);
};

// PROJECTS
export const getProjects = async (includeArchived = false): Promise<Project[]> => {
    const { projects } = await getAppData();
    const data = includeArchived ? projects : projects.filter(p => !p.isArchived);
    return mockApiCall(data);
}

export const addProject = async (name: string, clientId: string): Promise<Project> => {
    const appData = await getAppData();
    const newProject: Project = { id: uuidv4(), name, clientId, isArchived: false };
    appData.projects.push(newProject);
    await setAppData(appData);
    return mockApiCall(newProject);
};

export const updateProject = async (projectId: string, updates: Partial<Pick<Project, 'name' | 'isArchived'>>): Promise<Project> => {
    const appData = await getAppData();
    let updatedProject: Project | null = null;
    appData.projects = appData.projects.map(p => {
        if (p.id === projectId) {
            updatedProject = { ...p, ...updates };
            return updatedProject;
        }
        return p;
    });
    if (!updatedProject) throw new Error("Project not found");

    await setAppData(appData);
    return mockApiCall(updatedProject);
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const appData = await getAppData();
    appData.projects = appData.projects.filter(p => p.id !== projectId);
    appData.timeEntries = appData.timeEntries.filter(t => t.projectId !== projectId);

    await setAppData(appData);
    return mockApiCall(undefined);
};

// TIME ENTRIES
export const getTimeEntries = async (includeArchived = false): Promise<Array<TimeEntry & { startTime: Date; endTime: Date | null }>> => {
    const { timeEntries } = await getAppData();
    const parsedEntries = timeEntries.map(parseTimeEntryDates);
    const data = includeArchived ? parsedEntries : parsedEntries.filter(t => !t.isArchived);
    // Sort by start time descending
    return mockApiCall(data.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()));
};

export const getActiveTimeEntry = async (): Promise<(TimeEntry & { startTime: Date; endTime: Date | null }) | null> => {
    const { timeEntries } = await getAppData();
    const activeEntry = timeEntries.find(t => t.endTime === null && !t.isArchived) || null;
    return mockApiCall(activeEntry ? parseTimeEntryDates(activeEntry) : null);
};

export const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'isArchived'>): Promise<TimeEntry> => {
    const appData = await getAppData();
    const newEntry: TimeEntry = { ...entryData, id: uuidv4(), isArchived: false };
    appData.timeEntries.push(newEntry);
    await setAppData(appData);
    return mockApiCall(newEntry);
};

export const addBatchTimeEntries = async (entries: Omit<TimeEntry, 'id' | 'isArchived'>[]): Promise<TimeEntry[]> => {
    const appData = await getAppData();
    const newEntries: TimeEntry[] = entries.map(entry => ({
        ...entry,
        id: uuidv4(),
        isArchived: false,
    }));
    appData.timeEntries.push(...newEntries);
    await setAppData(appData);
    return mockApiCall(newEntries);
};

export const stopTimeEntry = async (entryId: string): Promise<TimeEntry> => {
    const appData = await getAppData();
    let stoppedEntry: TimeEntry | null = null;
    appData.timeEntries = appData.timeEntries.map(entry => {
        if (entry.id === entryId) {
            stoppedEntry = { ...entry, endTime: new Date().toISOString() };
            return stoppedEntry;
        }
        return entry;
    });

    if (!stoppedEntry) throw new Error("Time entry not found to stop.");

    await setAppData(appData);
    return mockApiCall(stoppedEntry);
};

export const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
    const appData = await getAppData();
    let updatedEntry: TimeEntry | null = null;
    appData.timeEntries = appData.timeEntries.map(entry => {
        if (entry.id === entryId) {
            updatedEntry = { ...entry, ...updates };
            return updatedEntry;
        }
        return entry;
    });

    if (!updatedEntry) throw new Error("Time entry not found to update.");

    await setAppData(appData);
    return mockApiCall(updatedEntry);
};

export const deleteTimeEntry = async (entryId: string): Promise<void> => {
    const appData = await getAppData();
    appData.timeEntries = appData.timeEntries.filter(t => t.id !== entryId);
    await setAppData(appData);
    return mockApiCall(undefined);
};

// USER SETTINGS
export const getUserSettings = async (): Promise<UserSettings | undefined> => {
    return await window.electronAPI.getStoreValue<UserSettings>('userSettings');
};

export const updateUserSettings = async (settings: UserSettings): Promise<void> => {
    await window.electronAPI.setStoreValue('userSettings', settings);
};
