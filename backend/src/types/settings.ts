export interface Settings {
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
}

export const defaultSettings: Settings = {
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
};
