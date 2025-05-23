/**
 * Local type definitions for shared interfaces
 * This file contains temporary type definitions until the shared package is properly linked
 */

/**
 * Result type for synchronous operations
 */
export type Result<T, E = string> =
  | { success: true; value: T; error?: never }
  | { success: false; value?: T; error: E };

/**
 * Result type for asynchronous operations
 */
export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

/**
 * Habit interface
 */
export interface IHabit {
  id: string;
  name: string;
  tag: string;
  repetition: string;
  specificDays?: number[];
  specificDates?: number[];
  goalType: string;
  goalValue: number;
  createdAt: string;
  updatedAt: string;
  color?: string;
  icon?: string;
  archived?: boolean;
}

/**
 * Completion interface
 */
export interface ICompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Note interface
 */
export interface INote {
  id: string;
  habitId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Analytics interface
 */
export interface IAnalytics {
  id: string;
  habitId: string;
  period: string;
  startDate: string;
  endDate: string;
  totalCompletions: number;
  streakCurrent: number;
  streakLongest: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * App settings interface
 */
export interface ISettings {
  id: string;
  userId: string;
  theme: string;
  firstDayOfWeek: number;
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  createdAt: string;
  updatedAt: string;
}

/**
 * App settings type alias
 */
export type AppSettings = ISettings;
