import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/analyticsApi";
import {
  transformDailyCompletions,
  transformWeeklyCompletions,
  transformMonthlyCompletions,
  transformStreakData,
  transformHabitCompletionPercentage,
  transformCategoryDistribution,
} from "@/utils/chartUtils";

export function useAnalytics() {
  // Get analytics overview data
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsApi.getOverview,
  });

  // Get transformed data for charts
  const transformedData = overviewData
    ? {
        weeklyData: transformWeeklyCompletions(overviewData.weeklyData),
        categoryDistribution: transformCategoryDistribution(
          overviewData.habitDistribution
        ),
        topHabits: overviewData.topHabits,
      }
    : null;

  // Custom hook to get habit analytics
  const useHabitAnalytics = (habitId: string) => {
    return useQuery({
      queryKey: ["analytics", "habit", habitId],
      queryFn: () => analyticsApi.getHabitAnalytics(habitId),
    });
  };

  // Custom hook to get daily analytics
  const useDailyAnalytics = (date: string) => {
    return useQuery({
      queryKey: ["analytics", "daily", date],
      queryFn: () => analyticsApi.getDailyAnalytics(date),
    });
  };

  // Custom hook to get weekly analytics
  const useWeeklyAnalytics = (startDate: string) => {
    const {
      data: weeklyAnalytics,
      isLoading,
      error,
      refetch,
    } = useQuery({
      queryKey: ["analytics", "weekly", startDate],
      queryFn: () => analyticsApi.getWeeklyAnalytics(startDate),
    });

    const transformedWeeklyData = weeklyAnalytics
      ? {
          ...weeklyAnalytics,
          dailyData: transformDailyCompletions(weeklyAnalytics.dailyData),
          habits: transformHabitCompletionPercentage(weeklyAnalytics.habits),
        }
      : null;

    return {
      weeklyAnalytics: transformedWeeklyData,
      isLoading,
      error,
      refetch,
    };
  };

  // Custom hook to get monthly analytics
  const useMonthlyAnalytics = (year: number, month: number) => {
    const {
      data: monthlyAnalytics,
      isLoading,
      error,
      refetch,
    } = useQuery({
      queryKey: ["analytics", "monthly", year, month],
      queryFn: () => analyticsApi.getMonthlyAnalytics(year, month),
    });

    const transformedMonthlyData = monthlyAnalytics
      ? {
          ...monthlyAnalytics,
          weeklyData: transformWeeklyCompletions(monthlyAnalytics.weeklyData),
          habits: transformHabitCompletionPercentage(monthlyAnalytics.habits),
        }
      : null;

    return {
      monthlyAnalytics: transformedMonthlyData,
      isLoading,
      error,
      refetch,
    };
  };

  return {
    overviewData,
    transformedData,
    isOverviewLoading,
    overviewError,
    refetchOverview,
    useHabitAnalytics,
    useDailyAnalytics,
    useWeeklyAnalytics,
    useMonthlyAnalytics,
  };
}
