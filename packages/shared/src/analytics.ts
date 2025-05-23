/**
 * Analytics-related interfaces and types
 */

export interface TimeRange {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
}

export interface HabitStatistics {
  habitId: string;
  completionRate: number; // 0-1 percentage
  totalCompletions: number;
  streakData?: {
    currentStreak: number;
    longestStreak: number;
  };
  counterData?: {
    total: number;
    average: number;
    highest: number;
  };
}

export interface DailyCompletionSummary {
  date: string; // ISO date string (YYYY-MM-DD)
  completedCount: number;
  totalCount: number;
  completionRate: number; // 0-1 percentage
}

export enum TimeFrame {
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
  Custom = "custom",
}
