export interface Client {
  id: string;
  name: string;
  isArchived?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  isArchived?: boolean;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: Date;
  endTime: Date | null;
  description: string;
  isArchived?: boolean;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
}
