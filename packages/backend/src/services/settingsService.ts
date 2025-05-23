/**
 * Settings Service
 * Manages user settings data
 */

/**
 * User settings interface
 */
export interface UserSettings {
  id?: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  defaultView: "daily" | "weekly" | "monthly";
  startDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  language: string;
}

/**
 * Service for managing user settings
 */
export class SettingsService {
  private settings: UserSettings = {
    theme: "system",
    notifications: true,
    defaultView: "daily",
    startDayOfWeek: 1, // Monday
    language: "en",
  };

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    // In a real app, this would fetch from a database
    return this.settings;
  }

  /**
   * Update user settings
   */
  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    // In a real app, this would update in a database
    this.settings = {
      ...this.settings,
      ...updates,
    };

    return this.settings;
  }
}
