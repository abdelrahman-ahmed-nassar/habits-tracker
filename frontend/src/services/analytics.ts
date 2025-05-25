import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

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

interface HabitAnalytics {
  habitId: string;
  habitName: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  completionHistory: Array<{
    date: string;
    completed: boolean;
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

interface QuarterAnalytics {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyData: Array<{
    date: string;
    completionRate: number;
  }>;
}

class AnalyticsService {
  /**
   * Get overall analytics data
   */
  async getOverallAnalytics(): Promise<AnalyticsOverview> {
    const response = await axios.get(`${API_BASE_URL}/analytics/overview`);
    return response.data.data;
  }

  /**
   * Get analytics for a specific habit
   * @param habitId - The ID of the habit
   */
  async getHabitAnalytics(habitId: string): Promise<HabitAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/habits/${habitId}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a specific date
   * @param date - The date in ISO format
   */
  async getDailyAnalytics(date: string): Promise<DailyAnalytics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/daily/${date}`);
    return response.data.data;
  }

  /**
   * Get analytics for a week starting from a specific date
   * @param startDate - The start date in ISO format
   */
  async getWeeklyAnalytics(startDate: string): Promise<WeeklyAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/weekly/${startDate}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a specific month
   * @param year - The year
   * @param month - The month (1-12)
   */
  async getMonthlyAnalytics(
    year: number,
    month: number
  ): Promise<MonthlyAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/monthly/${year}/${month}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a quarter period starting from a specific date
   * @param startDate - The start date in YYYY-MM-DD format
   */
  async getQuarterAnalytics(startDate: string): Promise<QuarterAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/quarter/${startDate}`
    );
    return response.data.data;
  }

  /**
   * Clear the analytics cache
   */
  async clearAnalyticsCache(): Promise<void> {
    await axios.post(`${API_BASE_URL}/analytics/clear-cache`);
  }
}

export const analyticsService = new AnalyticsService();
