/**
 * Completion-related interfaces and types
 */

export interface Completion {
  id: string;
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  value?: number; // For counter-type habits
  timestamp: string; // ISO datetime string of when completion was recorded
}

export interface StreakInfo {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date string or null if never completed
}
