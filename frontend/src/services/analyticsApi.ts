import { get } from "./api";
import {
  AnalyticsOverview,
  HabitAnalytics,
  DailyAnalytics,
  WeeklyAnalytics,
  MonthlyAnalytics,
} from "@/types";

export const analyticsApi = {
  // Get analytics overview
  getOverview: async () => {
    return get<AnalyticsOverview>("/analytics/overview");
  },

  // Get analytics for a specific habit
  getHabitAnalytics: async (id: string) => {
    return get<HabitAnalytics>(`/analytics/habits/${id}`);
  },

  // Get analytics for a specific day
  getDailyAnalytics: async (date: string) => {
    return get<DailyAnalytics>(`/analytics/daily/${date}`);
  },

  // Get analytics for a specific week
  getWeeklyAnalytics: async (startDate: string) => {
    return get<WeeklyAnalytics>(`/analytics/weekly/${startDate}`);
  },

  // Get analytics for a specific month
  getMonthlyAnalytics: async (year: number, month: number) => {
    return get<MonthlyAnalytics>(`/analytics/monthly/${year}/${month}`);
  },
};
