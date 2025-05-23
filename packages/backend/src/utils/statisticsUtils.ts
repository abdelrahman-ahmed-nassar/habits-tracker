import { Habit, HabitTag } from "../../../shared/src/habits";
import { Completion } from "../../../shared/src/completions";
import { DailyCompletionSummary } from "../../../shared/src/analytics";

/**
 * Statistical utility functions for analytics calculations
 */

/**
 * Calculate average value from an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

/**
 * Calculate median value from an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    // Even number of values, average the middle two
    return (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
  } else {
    // Odd number of values, return the middle one
    return sortedValues[midIndex];
  }
}

/**
 * Calculate standard deviation from an array of numbers
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;

  const avg = calculateAverage(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate completion consistency score (0-100)
 * Based on completion rate and consistency over time
 */
export function calculateConsistencyScore(
  completionRate: number,
  dayCompletionRates: number[]
): number {
  if (dayCompletionRates.length === 0) return 0;

  // Base score from completion rate (0-80)
  const baseScore = completionRate * 80;

  // Consistency factor (0-20)
  // Lower standard deviation = more consistent = higher score
  const stdDev = calculateStandardDeviation(dayCompletionRates);
  const consistencyFactor = Math.max(0, 20 * (1 - stdDev * 2));

  // Combine scores (0-100)
  return Math.min(100, Math.round(baseScore + consistencyFactor));
}

/**
 * Calculate day of week statistics
 */
export function calculateDayOfWeekStats(
  dailySummaries: DailyCompletionSummary[]
): Array<{
  dayOfWeek: number;
  dayName: string;
  completionRate: number;
  totalCount: number;
  completedCount: number;
}> {
  const daysOfWeek = [
    {
      dayOfWeek: 0,
      dayName: "Sunday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 1,
      dayName: "Monday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 2,
      dayName: "Tuesday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 3,
      dayName: "Wednesday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 4,
      dayName: "Thursday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 5,
      dayName: "Friday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
    {
      dayOfWeek: 6,
      dayName: "Saturday",
      completionRate: 0,
      totalCount: 0,
      completedCount: 0,
    },
  ];

  // Aggregate data by day of week
  for (const summary of dailySummaries) {
    const date = new Date(summary.date);
    const dayOfWeek = date.getDay();

    daysOfWeek[dayOfWeek].totalCount += summary.totalCount;
    daysOfWeek[dayOfWeek].completedCount += summary.completedCount;
  }

  // Calculate rates
  for (const day of daysOfWeek) {
    if (day.totalCount > 0) {
      day.completionRate = day.completedCount / day.totalCount;
    }
  }

  return daysOfWeek;
}

/**
 * Calculate statistics by tag
 */
export function calculateStatsByTag(
  habits: Habit[],
  completions: Completion[]
): Array<{
  tag: HabitTag;
  habitCount: number;
  completionRate: number;
  totalScheduled: number;
  totalCompleted: number;
}> {
  // Initialize with all possible tags
  const tagMap = Object.values(HabitTag).reduce(
    (acc, tag) => {
      acc[tag] = {
        tag,
        habitCount: 0,
        completionRate: 0,
        totalScheduled: 0,
        totalCompleted: 0,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        tag: HabitTag;
        habitCount: number;
        completionRate: number;
        totalScheduled: number;
        totalCompleted: number;
      }
    >
  );

  // Count habits by tag
  for (const habit of habits) {
    if (tagMap[habit.tag]) {
      tagMap[habit.tag].habitCount++;
    }
  }

  // Build a map of habitId to tag for quick lookups
  const habitTagMap = habits.reduce((acc, habit) => {
    acc[habit.id] = habit.tag;
    return acc;
  }, {} as Record<string, HabitTag>);

  // Group completions by habit tag
  const completionsByDate = completions.reduce((acc, completion) => {
    const habitTag = habitTagMap[completion.habitId];
    if (!habitTag) return acc;

    if (!acc[completion.date]) {
      acc[completion.date] = {};
    }

    if (!acc[completion.date][habitTag]) {
      acc[completion.date][habitTag] = {
        scheduled: 0,
        completed: 0,
      };
    }

    // Count as scheduled
    acc[completion.date][habitTag].scheduled++;

    // If completed, count as completed
    if (completion.completed) {
      acc[completion.date][habitTag].completed++;
    }

    return acc;
  }, {} as Record<string, Record<string, { scheduled: number; completed: number }>>);

  // Calculate statistics by tag
  for (const date in completionsByDate) {
    for (const tag in completionsByDate[date]) {
      if (tagMap[tag]) {
        const stats = completionsByDate[date][tag];
        tagMap[tag].totalScheduled += stats.scheduled;
        tagMap[tag].totalCompleted += stats.completed;
      }
    }
  }

  // Calculate completion rates
  for (const tag in tagMap) {
    const stats = tagMap[tag];
    if (stats.totalScheduled > 0) {
      stats.completionRate = stats.totalCompleted / stats.totalScheduled;
    }
  }

  // Convert to array and filter out tags with no habits
  return Object.values(tagMap).filter((stats) => stats.habitCount > 0);
}

/**
 * Calculate streak statistics
 */
export function calculateStreakStats(streakLengths: number[]): {
  currentStreak: number;
  longestStreak: number;
  averageStreak: number;
  totalStreaks: number;
} {
  if (streakLengths.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      averageStreak: 0,
      totalStreaks: 0,
    };
  }

  // Assuming the first streak length is the current streak
  const currentStreak = streakLengths[0];

  // Find the longest streak
  const longestStreak = Math.max(...streakLengths);

  // Calculate average streak length (ignoring 0 streaks)
  const nonZeroStreaks = streakLengths.filter((length) => length > 0);
  const averageStreak =
    nonZeroStreaks.length > 0 ? calculateAverage(nonZeroStreaks) : 0;

  return {
    currentStreak,
    longestStreak,
    averageStreak,
    totalStreaks: nonZeroStreaks.length,
  };
}

/**
 * Calculate relative performance compared to previous period
 */
export function calculateRelativePerformance(
  currentValue: number,
  previousValue: number
): {
  change: number;
  changePercent: number;
  improved: boolean;
} {
  const change = currentValue - previousValue;
  const changePercent =
    previousValue !== 0
      ? (change / previousValue) * 100
      : currentValue > 0
      ? 100
      : 0;

  return {
    change,
    changePercent,
    improved: change > 0,
  };
}

/**
 * Calculate goal achievement percentage
 */
export function calculateGoalAchievement(
  achieved: number,
  goal: number
): number {
  if (goal <= 0) return 0;
  return Math.min(100, (achieved / goal) * 100);
}

/**
 * Calculate trend direction and strength
 */
export function calculateTrendAnalysis(values: number[]): {
  direction: "increasing" | "decreasing" | "stable";
  strength: number; // 0-1
  slope: number;
} {
  if (values.length <= 1) {
    return {
      direction: "stable",
      strength: 0,
      slope: 0,
    };
  }

  // Calculate linear regression to determine trend
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i + 1);

  const sumX = indices.reduce((acc, x) => acc + x, 0);
  const sumY = values.reduce((acc, y) => acc + y, 0);
  const sumXY = indices.reduce((acc, x, i) => acc + x * values[i], 0);
  const sumX2 = indices.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalize slope to determine strength (0-1)
  const maxPossibleSlope =
    Math.max(Math.abs(1 - values[0]), Math.abs(1 - values[n - 1])) / n;
  const normalizedStrength =
    maxPossibleSlope !== 0
      ? Math.min(1, Math.abs(slope) / maxPossibleSlope)
      : 0;

  // Use a larger threshold for stable detection (0.01 instead of 0.001)
  const stableThreshold = 0.01;

  return {
    direction:
      slope > stableThreshold
        ? "increasing"
        : slope < -stableThreshold
        ? "decreasing"
        : "stable",
    strength: normalizedStrength,
    slope,
  };
}
