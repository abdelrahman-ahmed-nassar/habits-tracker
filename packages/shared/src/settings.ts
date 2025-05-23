/**
 * Settings-related interfaces and types
 */

export enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export interface UserSettings {
  theme: ThemeMode;
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM format
  weekStartsOn: number; // 0 = Sunday, 1 = Monday, etc.
  defaultView: "day" | "week" | "month";
  showArchivedHabits: boolean;
}

export interface AppSettings {
  dataStoragePath: string; // Path where JSON files are stored
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupPath?: string;
}
