import { ApiResponse } from "../types";
import apiService from "./api";
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

interface DateRange {
  startDate: string;
  endDate: string;
}

interface CompletionStats {
  totalCompletions: number;
  completionRate: number;
  averageCompletionsPerDay: number;
  mostCompletedDay: string;
  leastCompletedDay: string;
}

interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  averageStreak: number;
  longestStreakPeriod: {
    start: string;
    end: string;
    length: number;
  };
}

interface CategoryStats {
  categoryId: string;
  name: string;
  totalHabits: number;
  activeHabits: number;
  completionRate: number;
  averageStreak: number;
}

class AnalyticsService {
  private readonly baseUrl = "/analytics";

  async getCompletionStats(
    range: DateRange
  ): Promise<ApiResponse<CompletionStats>> {
    return apiService.get<CompletionStats>(`${this.baseUrl}/completions`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getStreakStats(range: DateRange): Promise<ApiResponse<StreakStats>> {
    return apiService.get<StreakStats>(`${this.baseUrl}/streaks`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getCategoryStats(
    range: DateRange
  ): Promise<ApiResponse<CategoryStats[]>> {
    return apiService.get<CategoryStats[]>(`${this.baseUrl}/categories`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getHabitProgress(
    habitId: string,
    range: DateRange
  ): Promise<
    ApiResponse<{
      completions: number;
      target: number;
      percentage: number;
      dailyProgress: Array<{
        date: string;
        completed: boolean;
        value: number;
      }>;
    }>
  > {
    return apiService.get(`${this.baseUrl}/habits/${habitId}/progress`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getOverallProgress(range: DateRange): Promise<
    ApiResponse<{
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
      dailyProgress: Array<{
        date: string;
        completed: number;
        total: number;
        percentage: number;
      }>;
    }>
  > {
    return apiService.get(`${this.baseUrl}/progress`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getTrends(range: DateRange): Promise<
    ApiResponse<{
      completionTrend: Array<{
        date: string;
        value: number;
      }>;
      streakTrend: Array<{
        date: string;
        value: number;
      }>;
      categoryTrend: Array<{
        date: string;
        categoryId: string;
        value: number;
      }>;
    }>
  > {
    return apiService.get(`${this.baseUrl}/trends`, {
      params: { startDate: range.startDate, endDate: range.endDate },
    });
  }

  async getOverview() {
    return apiService.get<AnalyticsOverview>(`${this.baseUrl}/overview`);
  }

  async getHabitAnalytics(id: string) {
    return apiService.get<HabitAnalytics>(`${this.baseUrl}/habits/${id}`);
  }

  async getDailyAnalytics(date: string) {
    return apiService.get<DailyAnalytics>(`${this.baseUrl}/daily/${date}`);
  }

  async getWeeklyAnalytics(startDate: string) {
    return apiService.get<WeeklyAnalytics>(
      `${this.baseUrl}/weekly/${startDate}`
    );
  }

  async getMonthlyAnalytics(year: number, month: number) {
    return apiService.get<MonthlyAnalytics>(
      `${this.baseUrl}/monthly/${year}/${month}`
    );
  }

  async clearAnalyticsCache() {
    return apiService.post<void>(`${this.baseUrl}/clear-cache`);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
