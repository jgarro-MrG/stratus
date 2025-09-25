import { v4 as uuidv4 } from 'uuid';
import { Client, Project, TimeEntry, AppData } from '../types';
import { getActivePath, readDataFile, writeDataFile } from './fileSystem';

// --- HELPER FUNCTIONS FOR SINGLE FILE R/W ---
const readAppData = async (): Promise<AppData> => {
    const path = getActivePath();
    return readDataFile(path);
};

const writeAppData = async (data: AppData): Promise<void> => {
    const path = getActivePath();
    await writeDataFile(path, data);
};


// --- API SIMULATION HELPER ---
const mockApiCall = <T>(data: T, delay = 50): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// --- DATA SEEDING ---
export const seedInitialData = async (filePath: string): Promise<void> => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const initialData: AppData = {
        clients: [
            { id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Innovate Corp', isArchived: false },
            { id: 'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', name: 'Future Systems', isArchived: false },
            { id: 'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8', name: 'Archived LLC', isArchived: true },
        ],
        projects: [
            { id: 'p1', clientId: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Project Phoenix', isArchived: false },
            { id: 'p2', clientId: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', name: 'Website Redesign', isArchived: false },
            { id: 'p3', clientId: 'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', name: 'AI Integration', isArchived: false },
            { id: 'p4', clientId: 'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', name: 'Archived Initiative', isArchived: true },
        ],
        timeEntries: [
            { id: 't1', projectId: 'p1', description: 'Initial project setup and configuration.', startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
            { id: 't2', projectId: 'p2', description: 'Design mockups for the new homepage.', startTime: yesterday, endTime: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000) },
            { id: 't3', projectId: 'p3', description: 'Researching AI models.', startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000), endTime: null },
            { id: 't4', projectId: 'p4', description: 'Archived work.', startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000), endTime: new Date(now.getTime() - 47 * 60 * 60 * 1000), isArchived: true },
        ]
    };
    await writeDataFile(filePath, initialData);
};

// Date parsing helper to convert ISO strings from JSON back to Date objects
const parseTimeEntryDates = (entry: TimeEntry): TimeEntry => ({
    ...entry,
    startTime: new Date(entry.startTime),
    endTime: entry.endTime ? new Date(entry.endTime) : null,
});

// --- API FUNCTIONS ---

// CLIENTS
export const getClients = async (includeArchived = false): Promise<Client[]> => {
    const { clients } = await readAppData();
    const data = includeArchived ? clients : clients.filter(c => !c.isArchived);
    return mockApiCall(data);
};

export const addClient = async (name: string): Promise<Client> => {
    const appData = await readAppData();
    const newClient: Client = { id: uuidv4(), name, isArchived: false };
    appData.clients.push(newClient);
    await writeAppData(appData);
    return mockApiCall(newClient);
}

export const updateClient = async (clientId: string, updates: Partial<Pick<Client, 'name' | 'isArchived'>>): Promise<Client> => {
    const appData = await readAppData();
    let updatedClient: Client | null = null;
    appData.clients = appData.clients.map(c => {
        if (c.id === clientId) {
            updatedClient = { ...c, ...updates };
            return updatedClient;
        }
        return c;
    });
    if (!updatedClient) throw new Error("Client not found");
    
    await writeAppData(appData);
    return mockApiCall(updatedClient);
}

export const deleteClient = async (clientId: string): Promise<void> => {
    const appData = await readAppData();

    const projectsToDelete = appData.projects.filter(p => p.clientId === clientId).map(p => p.id);

    appData.clients = appData.clients.filter(c => c.id !== clientId);
    appData.projects = appData.projects.filter(p => p.clientId !== clientId);
    appData.timeEntries = appData.timeEntries.filter(t => !projectsToDelete.includes(t.projectId));

    await writeAppData(appData);
    return mockApiCall(undefined);
};

// PROJECTS
export const getProjects = async (includeArchived = false): Promise<Project[]> => {
    const { projects } = await readAppData();
    const data = includeArchived ? projects : projects.filter(p => !p.isArchived);
    return mockApiCall(data);
}

export const getProjectsByClientId = async (clientId: string, includeArchived = false): Promise<Project[]> => {
    let { projects } = await readAppData();
    projects = projects.filter(p => p.clientId === clientId);
    if (!includeArchived) {
        projects = projects.filter(p => !p.isArchived);
    }
    return mockApiCall(projects);
};

export const addProject = async (name: string, clientId: string): Promise<Project> => {
    const appData = await readAppData();
    const newProject: Project = { id: uuidv4(), name, clientId, isArchived: false };
    appData.projects.push(newProject);
    // Fix: Corrected typo from appD to appData and added missing return statement
    await writeAppData(appData);
    return mockApiCall(newProject);
};

export const updateProject = async (projectId: string, updates: Partial<Pick<Project, 'name' | 'isArchived'>>): Promise<Project> => {
    const appData = await readAppData();
    let updatedProject: Project | null = null;
    appData.projects = appData.projects.map(p => {
        if (p.id === projectId) {
            updatedProject = { ...p, ...updates };
            return updatedProject;
        }
        return p;
    });
    if (!updatedProject) throw new Error("Project not found");

    await writeAppData(appData);
    return mockApiCall(updatedProject);
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const appData = await readAppData();
    appData.projects = appData.projects.filter(p => p.id !== projectId);
    appData.timeEntries = appData.timeEntries.filter(t => t.projectId !== projectId);

    await writeAppData(appData);
    return mockApiCall(undefined);
};

// TIME ENTRIES
export const getTimeEntries = async (includeArchived = false): Promise<TimeEntry[]> => {
    const { timeEntries } = await readAppData();
    const parsedEntries = timeEntries.map(parseTimeEntryDates);
    const data = includeArchived ? parsedEntries : parsedEntries.filter(t => !t.isArchived);
    // Sort by start time descending
    return mockApiCall(data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
};

export const getActiveTimeEntry = async (): Promise<TimeEntry | null> => {
    const { timeEntries } = await readAppData();
    const activeEntry = timeEntries.find(t => t.endTime === null && !t.isArchived) || null;
    return mockApiCall(activeEntry ? parseTimeEntryDates(activeEntry) : null);
};

export const addTimeEntry = async (entryData: Omit<TimeEntry, 'id'>): Promise<TimeEntry> => {
    const appData = await readAppData();
    const newEntry: TimeEntry = { ...entryData, id: uuidv4(), isArchived: false };
    appData.timeEntries.push(newEntry);
    await writeAppData(appData);
    return mockApiCall(parseTimeEntryDates(newEntry));
};

export const addBatchTimeEntries = async (entries: Omit<TimeEntry, 'id'>[]): Promise<TimeEntry[]> => {
    const appData = await readAppData();
    const newEntries: TimeEntry[] = entries.map(entry => ({
        ...entry,
        id: uuidv4(),
        isArchived: false,
    }));
    appData.timeEntries.push(...newEntries);
    await writeAppData(appData);
    return mockApiCall(newEntries.map(parseTimeEntryDates));
};

export const stopTimeEntry = async (entryId: string): Promise<TimeEntry> => {
    const appData = await readAppData();
    let stoppedEntry: TimeEntry | null = null;
    appData.timeEntries = appData.timeEntries.map(entry => {
        if (entry.id === entryId) {
            stoppedEntry = { ...entry, endTime: new Date() };
            return stoppedEntry;
        }
        return entry;
    });

    if (!stoppedEntry) throw new Error("Time entry not found to stop.");

    await writeAppData(appData);
    return mockApiCall(parseTimeEntryDates(stoppedEntry));
};

export const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
    const appData = await readAppData();
    let updatedEntry: TimeEntry | null = null;
    appData.timeEntries = appData.timeEntries.map(entry => {
        if (entry.id === entryId) {
            updatedEntry = { ...entry, ...updates };
            return updatedEntry;
        }
        return entry;
    });

    if (!updatedEntry) throw new Error("Time entry not found to update.");

    await writeAppData(appData);
    return mockApiCall(parseTimeEntryDates(updatedEntry));
};

export const deleteTimeEntry = async (entryId: string): Promise<void> => {
    const appData = await readAppData();
    appData.timeEntries = appData.timeEntries.filter(t => t.id !== entryId);
    await writeAppData(appData);
    return mockApiCall(undefined);
};
