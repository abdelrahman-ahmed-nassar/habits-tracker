export interface HabitAnalytics {
  habitId: string;
  successRate: number;
  bestDayOfWeek: number;
  worstDayOfWeek: number;
  longestStreak: number;
  totalCompletions: number;
  averageCompletionsPerWeek: number;
  currentCounter: number;
}

// Re-export for backward compatibility
export type { HabitAnalytics as default };
