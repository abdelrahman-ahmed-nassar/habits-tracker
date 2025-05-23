/**
 * Analytics-related interfaces and types for the Habits Tracker application
 */

/**
 * Represents a time range for analytics calculations
 */
export interface TimeRange {
  /**
   * Start date in ISO format (YYYY-MM-DD)
   */
  startDate: string;

  /**
   * End date in ISO format (YYYY-MM-DD)
   */
  endDate: string;
}

/**
 * Statistical data for a single habit
 */
export interface HabitStatistics {
  /**
   * Reference to the habit ID
   */
  habitId: string;

  /**
   * Habit completion rate as a decimal (0-1)
   */
  completionRate: number;

  /**
   * Total number of completions in the time period
   */
  totalCompletions: number;

  /**
   * Total number of days the habit was scheduled in the time period
   */
  totalScheduledDays: number;

  /**
   * Streak-related statistics (for streak-type habits)
   */
  streakData?: {
    /**
     * Current consecutive days streak
     */
    currentStreak: number;

    /**
     * Longest recorded streak for this habit
     */
    longestStreak: number;

    /**
     * Average streak length
     */
    averageStreak: number;
  };

  /**
   * Counter-related statistics (for counter-type habits)
   */
  counterData?: {
    /**
     * Total accumulated count
     */
    total: number;

    /**
     * Average count per completion
     */
    average: number;

    /**
     * Highest recorded count for a single completion
     */
    highest: number;
  };
}

/**
 * Daily completion summary for all habits
 */
export interface DailyCompletionSummary {
  /**
   * Date in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Number of completed habits for this date
   */
  completedCount: number;

  /**
   * Total number of scheduled habits for this date
   */
  totalCount: number;

  /**
   * Completion rate as a decimal (0-1)
   */
  completionRate: number;
}

/**
 * Time frame options for analytics
 */
export enum TimeFrame {
  Day = "day",
  Week = "week",
  Month = "month",
  Quarter = "quarter",
  Year = "year",
  Custom = "custom",
  AllTime = "all-time",
}

/**
 * Overall analytics summary
 */
export interface AnalyticsSummary {
  /**
   * Time range for the analytics data
   */
  timeRange: TimeRange;

  /**
   * Overall completion rate across all habits
   */
  overallCompletionRate: number;

  /**
   * List of habit statistics
   */
  habitStatistics: HabitStatistics[];

  /**
   * List of daily completion summaries
   */
  dailySummaries: DailyCompletionSummary[];

  /**
   * Most consistent habit (highest completion rate)
   */
  mostConsistentHabitId?: string;

  /**
   * Least consistent habit (lowest completion rate)
   */
  leastConsistentHabitId?: string;

  /**
   * Best streak information
   */
  bestStreakInfo?: {
    habitId: string;
    streakLength: number;
  };

  /**
   * Date with highest completion rate
   */
  bestDay?: {
    date: string;
    completionRate: number;
  };
}

/**
 * Parameters for analytics requests
 */
export interface AnalyticsParams {
  /**
   * Time frame for the analytics
   */
  timeFrame: TimeFrame;

  /**
   * Custom time range (required when timeFrame is Custom)
   */
  customRange?: TimeRange;

  /**
   * Optional list of habit IDs to include (if not provided, all habits are included)
   */
  habitIds?: string[];

  /**
   * Whether to include archived habits
   */
  includeArchived?: boolean;
}

/**
 * Type guard to check if an object is a valid TimeRange
 */
export function isTimeRange(obj: unknown): obj is TimeRange {
  const range = obj as Partial<TimeRange>;
  return (
    typeof range === "object" &&
    range !== null &&
    typeof range.startDate === "string" &&
    typeof range.endDate === "string"
  );
}
