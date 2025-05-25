export interface Settings {
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    enabled: boolean;
    reminderTime: string;
  };
  analytics: {
    cacheEnabled: boolean;
    cacheDuration: number; // in minutes
  };
  reminderEnabled: boolean;
  reminderTime: string;
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  lastBackupDate: string;
}

export const defaultSettings: Settings = {
  userId: "",
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    reminderTime: "09:00",
  },
  analytics: {
    cacheEnabled: true,
    cacheDuration: 5, // 5 minutes default
  },
  reminderEnabled: true,
  reminderTime: "20:00",
  backupEnabled: true,
  backupFrequency: "weekly",
  lastBackupDate: new Date().toISOString(),
};
