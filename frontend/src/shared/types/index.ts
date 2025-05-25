export interface Habit {
  id: string;
  name: string;
  description: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  goalType: "streak" | "counter";
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  motivationNote?: string;
  isActive: boolean;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
}

export interface HabitCreate {
  name: string;
  description: string;
  repetition: "daily" | "weekly" | "monthly";
  tag: string;
  goalType: "streak" | "counter";
  goalValue: number;
}

export interface HabitUpdate extends Partial<HabitCreate> {}

export interface DailyAnalytics {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  habits: Array<{
    habitId: string;
    habitName: string;
    completed: boolean;
    value: number;
  }>;
}

export interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  totalHabits: number;
  completionRate: number;
  dailyStats: Array<{
    date: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
}

export interface MonthlyAnalytics {
  year: number;
  month: number;
  totalHabits: number;
  completionRate: number;
  dailyStats: Array<{
    date: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
}

export interface AnalyticsOverview {
  totalHabits: number;
  activeHabitsCount: number;
  completedToday: number;
  mostConsistentHabits: Array<{
    habitId: string;
    habitName: string;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
  }>;
  longestStreakHabit: {
    habitName: string;
    bestStreak: number;
  };
  last30DaysSuccessRate: number;
  bestDayOfWeek: {
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalCompletions: number;
  };
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalCompletions: number;
  }>;
}
