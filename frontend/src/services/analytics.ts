import axios from "axios";

const API_BASE_URL = "http://localhost:5002/api";

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
    currentCounter: number;
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

export interface HabitAnalytics {
  habitId: string;
  habitName: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
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
  dailyStats: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
  weeklyStats: {
    overallSuccessRate: number;
    totalCompletions: number;
    mostProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    leastProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    mostProductiveHabit: {
      habitId: string;
      habitName: string;
      activeDaysCount: number;
      completedDaysCount: number;
      successRate: number;
      completedDates: string[];
    };
  };
  habitStats: Array<{
    habitId: string;
    habitName: string;
    activeDaysCount: number;
    completedDaysCount: number;
    successRate: number;
    completedDates: string[];
  }>;
}

interface MonthlyAnalytics {
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  dailyCompletionCounts: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    count: number;
    totalHabits: number;
    completionRate: number;
  }>;
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalHabits: number;
    completedHabits: number;
  }>;
  habitStats: Array<{
    habitId: string;
    habitName: string;
    tag: string;
    activeDaysCount: number;
    completedDaysCount: number;
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
  }>;
  monthlyStats: {
    totalHabits: number;
    totalCompletions: number;
    overallCompletionRate: number;
    mostProductiveHabit: string | null;
    bestStreakHabit: string | null;
    bestDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      count: number;
      totalHabits: number;
      completionRate: number;
    } | null;
    worstDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      count: number;
      totalHabits: number;
      completionRate: number;
    } | null;
  };
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

export interface EnhancedHabitAnalytics {
  habitId: string;
  habitName: string;
  period: {
    startDate: string;
    endDate: string;
    description: string;
  };
  basicStats: {
    totalDays: number;
    completedDays: number;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
  };
  counterStats: {
    totalValue: number;
    goalValue: number;
    progress: number;
    completions: Array<{
      date: string;
      value: number;
    }>;
  } | null;
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    totalDays: number;
    completedDays: number;
    successRate: number;
    dayName: string;
  }>;
  bestDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  worstDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  topStreaks: Array<{
    startDate: string;
    endDate: string;
    length: number;
  }>;
  monthlyTrends: Array<{
    month: number;
    successRate: number;
    completions: number;
    monthName: string;
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
   * Get enhanced analytics for a specific habit with detailed data
   * @param habitId - The ID of the habit
   * @param period - The period for analytics (7days, 30days, 90days, 365days)
   */
  async getEnhancedHabitAnalytics(
    habitId: string,
    period: string = "30days"
  ): Promise<EnhancedHabitAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/habits/${habitId}?period=${period}`
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
