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
  startTime: string; // Stored as ISO string
  endTime: string | null; // Stored as ISO string
  description: string;
  isArchived?: boolean;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
}

// --- User Settings ---

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null; // Base64 encoded image
}

export interface ReportSettings {
  includeName: boolean;
  includeEmail: boolean;
  includePhone: boolean;
}

export type DateFormat = 'MMMM d, yyyy' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
export type TimeFormat = '12h' | '24h';
export type Theme = 'light' | 'dark' | 'system';

export interface AppPreferences {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  theme: Theme;
  reportSettings: ReportSettings;
}

export interface UserSettings {
  profile: UserProfile;
  preferences: AppPreferences;
}
