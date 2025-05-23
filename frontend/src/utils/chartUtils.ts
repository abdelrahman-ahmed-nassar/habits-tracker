import { format } from "date-fns";
import { parseDate } from "./dateUtils";

// Transform daily completions data for charts
export const transformDailyCompletions = (
  completions: { date: string; completed: number; total: number }[]
) => {
  return completions.map(({ date, completed, total }) => ({
    date,
    formattedDate: format(parseDate(date), "MMM d"),
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));
};

// Transform weekly completions data for charts
export const transformWeeklyCompletions = (
  weeklyData: { week: string; completed: number; total: number }[]
) => {
  return weeklyData.map(({ week, completed, total }) => {
    const weekDate = parseDate(week);
    return {
      week,
      formattedWeek: `Week of ${format(weekDate, "MMM d")}`,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
};

// Transform monthly completions data for charts
export const transformMonthlyCompletions = (
  monthlyData: {
    year: number;
    month: number;
    completed: number;
    total: number;
  }[]
) => {
  return monthlyData.map(({ year, month, completed, total }) => ({
    yearMonth: `${year}-${month + 1}`, // month is 0-indexed
    formattedMonth: format(new Date(year, month), "MMMM yyyy"),
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));
};

// Transform streak data for charts
export const transformStreakData = (
  streakData: {
    habitId: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
  }[]
) => {
  return streakData
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .map((habit) => ({
      habitId: habit.habitId,
      name: habit.name,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    }));
};

// Transform habit completion percentage for pie/donut charts
export const transformHabitCompletionPercentage = (
  habits: { id: string; name: string; completed: number; total: number }[]
) => {
  return habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    value:
      habit.total > 0 ? Math.round((habit.completed / habit.total) * 100) : 0,
  }));
};

// Transform category distribution for pie/donut charts
export const transformCategoryDistribution = (
  categories: { category: string; count: number }[]
) => {
  return categories.map((cat) => ({
    name: cat.category || "Uncategorized",
    value: cat.count,
  }));
};

// Calculate habit heatmap data (for calendar view)
export const calculateHeatmapData = (
  completions: { date: string; habitId: string; completed: boolean }[],
  dates: string[]
) => {
  const completionMap = completions.reduce(
    (acc, completion) => {
      if (!acc[completion.date]) {
        acc[completion.date] = { completed: 0, total: 0 };
      }
      acc[completion.date].total += 1;
      if (completion.completed) {
        acc[completion.date].completed += 1;
      }
      return acc;
    },
    {} as Record<string, { completed: number; total: number }>
  );

  return dates.map((date) => {
    const dayData = completionMap[date] || { completed: 0, total: 0 };
    return {
      date,
      value:
        dayData.total > 0
          ? Math.round((dayData.completed / dayData.total) * 100)
          : 0,
      completed: dayData.completed,
      total: dayData.total,
    };
  });
};
