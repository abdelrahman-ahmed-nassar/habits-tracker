export interface HabitAnalytics {
  habitId: string;
  successRate: number;
  bestDayOfWeek: number;
  worstDayOfWeek: number;
  longestStreak: number;
  totalCompletions: number;
  averageCompletionsPerWeek: number;
}
