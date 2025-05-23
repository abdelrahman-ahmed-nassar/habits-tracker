/**
 * Settings-related interfaces and types for the Habits Tracker application
 */

/**
 * Theme mode options for the application
 */
export enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

/**
 * Notification timing options
 */
export enum NotificationTiming {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
  Custom = "custom",
}

/**
 * Day of week options (used for week start setting)
 */
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/**
 * View options for the application
 */
export type ViewType = "day" | "week" | "month" | "list";

/**
 * User-specific settings for the application
 */
export interface UserSettings {
  /**
   * Theme preference for the application
   */
  theme: ThemeMode;

  /**
   * Whether daily reminders are enabled
   */
  reminderEnabled: boolean;

  /**
   * Time for daily reminders in 24-hour format (HH:MM)
   * Only used when reminderEnabled is true
   */
  reminderTime?: string;

  /**
   * Which day of the week is considered the start of the week
   * 0 = Sunday, 1 = Monday, etc.
   */
  weekStartsOn: DayOfWeek;

  /**
   * Default view to show when the app opens
   */
  defaultView: ViewType;

  /**
   * Whether archived habits are shown in the UI
   */
  showArchivedHabits: boolean;

  /**
   * Notification preferences
   */
  notifications?: {
    /**
     * Whether sound is enabled for notifications
     */
    soundEnabled: boolean;

    /**
     * Notification timing preference
     */
    timing: NotificationTiming;

    /**
     * Custom notification times when using custom timing
     * Array of times in 24-hour format (HH:MM)
     */
    customTimes?: string[];
  };

  /**
   * User interface preferences
   */
  uiPreferences?: {
    /**
     * Density of UI elements
     */
    density: "compact" | "comfortable" | "spacious";

    /**
     * Font size multiplier
     */
    fontSize: number;

    /**
     * Whether to use animations
     */
    animationsEnabled: boolean;
  };
}

/**
 * Global application settings
 */
export interface AppSettings {
  /**
   * Path where JSON data files are stored
   */
  dataStoragePath: string;

  /**
   * Whether automatic backups are enabled
   */
  backupEnabled: boolean;

  /**
   * How often to create backups
   */
  backupFrequency: "daily" | "weekly" | "monthly";

  /**
   * Path where backups are stored
   * Only used when backupEnabled is true
   */
  backupPath?: string;

  /**
   * Maximum number of backup files to keep
   */
  maxBackups?: number;

  /**
   * Whether to allow import/export of data
   */
  allowDataExport: boolean;

  /**
   * Whether to collect anonymous usage statistics
   */
  collectAnonymousMetrics: boolean;
}

/**
 * Type guard to check if an object is a valid UserSettings
 */
export function isUserSettings(obj: unknown): obj is UserSettings {
  const settings = obj as Partial<UserSettings>;
  return (
    typeof settings === "object" &&
    settings !== null &&
    Object.values(ThemeMode).includes(settings.theme as ThemeMode) &&
    typeof settings.reminderEnabled === "boolean" &&
    typeof settings.weekStartsOn === "number" &&
    settings.weekStartsOn >= 0 &&
    settings.weekStartsOn <= 6 &&
    ["day", "week", "month", "list"].includes(settings.defaultView as string) &&
    typeof settings.showArchivedHabits === "boolean"
  );
}

/**
 * Type guard to check if an object is a valid AppSettings
 */
export function isAppSettings(obj: unknown): obj is AppSettings {
  const settings = obj as Partial<AppSettings>;
  return (
    typeof settings === "object" &&
    settings !== null &&
    typeof settings.dataStoragePath === "string" &&
    typeof settings.backupEnabled === "boolean" &&
    ["daily", "weekly", "monthly"].includes(settings.backupFrequency as string)
  );
}
