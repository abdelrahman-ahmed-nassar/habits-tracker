/**
 * Notes-related interfaces and types
 */

export interface DailyNote {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface HabitMotivation {
  id: string;
  habitId: string;
  content: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}
