import { ApiService } from "@/services/api";
import type { HabitAnalytics } from "@shared/types/analytics";

// Define the missing analytics types based on the API documentation
interface AnalyticsOverview {
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

interface DailyAnalytics {
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

interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  totalHabits: number;
  completionRate: number;
  dailyStats: Array<{
    date: string;
    completedHabits: number;
    completionRate: number;
  }>;
}

interface MonthlyAnalytics {
  year: number;
  month: number;
  totalHabits: number;
  completionRate: number;
  dailyStats: Array<{
    date: string;
    completedHabits: number;
    completionRate: number;
  }>;
}

class AnalyticsService extends ApiService {
  async getOverview() {
    return this.get<AnalyticsOverview>("/analytics/overview");
  }

  async getHabitAnalytics(id: string) {
    return this.get<HabitAnalytics>(`/analytics/habits/${id}`);
  }

  async getDailyAnalytics(date: string) {
    return this.get<DailyAnalytics>(`/analytics/daily/${date}`);
  }

  async getWeeklyAnalytics(startDate: string) {
    return this.get<WeeklyAnalytics>(`/analytics/weekly/${startDate}`);
  }

  async getMonthlyAnalytics(year: number, month: number) {
    return this.get<MonthlyAnalytics>(`/analytics/monthly/${year}/${month}`);
  }

  async clearAnalyticsCache() {
    return this.post<void>("/analytics/clear-cache");
  }
}

export const analyticsService = new AnalyticsService();
