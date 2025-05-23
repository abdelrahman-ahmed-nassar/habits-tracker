export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customFrequency?: number; // Days between recurrences if custom
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
  targetDays?: string[]; // Days of the week for weekly habits, e.g., ['monday', 'wednesday']
  targetCount: number; // Number of times to complete per frequency period
  color?: string; // Color tag for the habit
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string; // ISO date string
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  date: string; // ISO date string
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  habitId?: string; // If specific habit, otherwise all
  startDate: string;
  endDate: string;
  completionRate: number;
  streakCurrent: number;
  streakLongest: number;
  totalCompletions: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
