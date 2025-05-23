import { v4 as uuidv4 } from "uuid";
import NodeCache from "node-cache";
import {
  TimeFrame,
  AnalyticsSummary,
  HabitStatistics,
  DailyCompletionSummary,
} from "../../../shared/src/analytics";
import { Habit, GoalType } from "../../../shared/src/habits";
import { Completion } from "../../../shared/src/completions";
import { HabitService } from "./habitService";
import { CompletionService } from "./completionService";
import { TypedDataService } from "./typedDataService";
import { AppError } from "../middlewares/errorMiddleware";
import {
  formatDateString,
  getWeekBoundaries,
  getMonthBoundaries,
  getDateRange,
  getDueDatesInRange,
} from "../utils/dateUtils";
import { calculateStreakData } from "../utils/streakCalculator";
import logger from "../utils/logger";

/**
 * Service for analytics-related business logic
 */
export class AnalyticsService {
  private habitService: HabitService;
  private completionService: CompletionService;
  private analyticsCache: NodeCache;

  /**
   * Creates a new AnalyticsService instance
   */
  constructor() {
    this.habitService = new HabitService();
    this.completionService = new CompletionService();
    // Cache analytics results for 5 minutes
    this.analyticsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  }

  /**
   * Get overall analytics for all habits
   */
  async getOverallAnalytics(
    startDate: string,
    endDate: string,
    includeArchived: boolean = false
  ): Promise<AnalyticsSummary> {
    // Generate cache key
    const cacheKey = `overall_${startDate}_${endDate}_${includeArchived}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<AnalyticsSummary>(cacheKey);
    if (cachedResult) {
      logger.debug("Retrieved analytics from cache:", cacheKey);
      return cachedResult;
    }

    // Get all habits
    const habits = await this.habitService.getAllHabits();
    const filteredHabits = includeArchived
      ? habits
      : habits.filter((h) => !h.archived);

    // Get all completions in range
    const completions = (
      await this.completionService.getCompletionsInRange(startDate, endDate)
    ).completions;

    // Generate daily summaries
    const dailySummaries = await this.generateDailySummaries(
      filteredHabits,
      completions,
      startDate,
      endDate
    );

    // Generate per-habit statistics
    const habitStatistics = await this.generateHabitStatistics(
      filteredHabits,
      completions,
      startDate,
      endDate
    );

    // Calculate overall completion rate
    const overallCompletionRate =
      this.calculateOverallCompletionRate(dailySummaries);

    // Find most and least consistent habits
    const mostConsistentHabitId = this.findMostConsistentHabit(habitStatistics);
    const leastConsistentHabitId =
      this.findLeastConsistentHabit(habitStatistics);

    // Find best streak
    const bestStreakInfo = this.findBestStreak(habitStatistics);

    // Find best day
    const bestDay = this.findBestDay(dailySummaries);

    // Create analytics summary
    const result: AnalyticsSummary = {
      timeRange: {
        startDate,
        endDate,
      },
      overallCompletionRate,
      habitStatistics,
      dailySummaries,
      mostConsistentHabitId,
      leastConsistentHabitId,
      bestStreakInfo,
      bestDay,
    };

    // Store in cache
    this.analyticsCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get analytics for a specific habit
   */
  async getHabitAnalytics(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<HabitStatistics> {
    // Generate cache key
    const cacheKey = `habit_${habitId}_${startDate}_${endDate}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<HabitStatistics>(cacheKey);
    if (cachedResult) {
      logger.debug("Retrieved habit analytics from cache:", cacheKey);
      return cachedResult;
    }

    // Get the habit
    const habit = await this.habitService.getHabitById(habitId);

    // Get habit completion history
    const { completions, statistics } =
      await this.completionService.getHabitCompletionHistory(
        habitId,
        startDate,
        endDate
      );

    // Calculate scheduled days
    const scheduledDays = getDueDatesInRange(habit, startDate, endDate).length;

    // Build habit statistics
    const habitStats: HabitStatistics = {
      habitId,
      completionRate: statistics.completionRate,
      totalCompletions: statistics.totalCompletions,
      totalScheduledDays: scheduledDays,
    };

    // Add streak data for streak-type habits
    if (habit.goalType === GoalType.Streak) {
      habitStats.streakData = {
        currentStreak: statistics.streakData.currentStreak,
        longestStreak: statistics.streakData.longestStreak,
        averageStreak: await this.calculateAverageStreak(habit, completions),
      };
    }

    // Add counter data for counter-type habits
    if (habit.goalType === GoalType.Counter) {
      habitStats.counterData = await this.calculateCounterData(completions);
    }

    // Store in cache
    this.analyticsCache.set(cacheKey, habitStats);

    return habitStats;
  }

  /**
   * Get completion trends over time with specified granularity
   */
  async getCompletionTrends(
    startDate: string,
    endDate: string,
    granularity: "daily" | "weekly" | "monthly" = "daily",
    includeArchived: boolean = false
  ): Promise<{
    trends: {
      period: string;
      completionRate: number;
      completedCount: number;
      totalCount: number;
    }[];
  }> {
    // Generate cache key
    const cacheKey = `trends_${startDate}_${endDate}_${granularity}_${includeArchived}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<{
      trends: {
        period: string;
        completionRate: number;
        completedCount: number;
        totalCount: number;
      }[];
    }>(cacheKey);
    if (cachedResult) {
      logger.debug("Retrieved trends from cache:", cacheKey);
      return cachedResult;
    }

    // Get all habits
    const habits = await this.habitService.getAllHabits();
    const filteredHabits = includeArchived
      ? habits
      : habits.filter((h) => !h.archived);

    // Get all completions in range
    const completions = (
      await this.completionService.getCompletionsInRange(startDate, endDate)
    ).completions;

    // Generate daily summaries first
    const dailySummaries = await this.generateDailySummaries(
      filteredHabits,
      completions,
      startDate,
      endDate
    );

    // Aggregate based on granularity
    const trends = this.aggregateTrendsByGranularity(
      dailySummaries,
      granularity
    );

    // Store in cache
    const result = { trends };
    this.analyticsCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get analytics for a specific time frame (day, week, month)
   */
  async getTimeBasedAnalytics(
    timeFrame: TimeFrame,
    dateString: string
  ): Promise<AnalyticsSummary> {
    // Generate cache key
    const cacheKey = `timeframe_${timeFrame}_${dateString}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<AnalyticsSummary>(cacheKey);
    if (cachedResult) {
      logger.debug("Retrieved time-based analytics from cache:", cacheKey);
      return cachedResult;
    }

    let startDate: string;
    let endDate: string;

    // Calculate appropriate date range based on the time frame
    switch (timeFrame) {
      case TimeFrame.Day:
        startDate = dateString;
        endDate = dateString;
        break;

      case TimeFrame.Week:
        const weekBoundaries = getWeekBoundaries(dateString);
        startDate = weekBoundaries.startDate;
        endDate = weekBoundaries.endDate;
        break;

      case TimeFrame.Month:
        const monthBoundaries = getMonthBoundaries(dateString);
        startDate = monthBoundaries.startDate;
        endDate = monthBoundaries.endDate;
        break;

      default:
        throw new AppError(`Unsupported time frame: ${timeFrame}`, 400);
    }

    // Use the overall analytics with the calculated date range
    const analytics = await this.getOverallAnalytics(startDate, endDate, false);

    // Store in cache
    this.analyticsCache.set(cacheKey, analytics);

    return analytics;
  }

  /**
   * Generate statistics for each habit
   */
  private async generateHabitStatistics(
    habits: Habit[],
    completions: Completion[],
    startDate: string,
    endDate: string
  ): Promise<HabitStatistics[]> {
    const habitStatistics: HabitStatistics[] = [];

    for (const habit of habits) {
      // Get habit-specific completions
      const habitCompletions = completions.filter(
        (c) => c.habitId === habit.id
      );

      // Calculate scheduled days
      const scheduledDays = getDueDatesInRange(
        habit,
        startDate,
        endDate
      ).length;

      // Calculate completion rate
      const completedDays = habitCompletions.filter((c) => c.completed).length;
      const completionRate =
        scheduledDays > 0 ? completedDays / scheduledDays : 0;

      // Build habit statistics
      const habitStats: HabitStatistics = {
        habitId: habit.id,
        completionRate,
        totalCompletions: completedDays,
        totalScheduledDays: scheduledDays,
      };

      // Add streak data for streak-type habits
      if (habit.goalType === GoalType.Streak) {
        const streakData = calculateStreakData(habit, habitCompletions);
        habitStats.streakData = {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          averageStreak: await this.calculateAverageStreak(
            habit,
            habitCompletions
          ),
        };
      }

      // Add counter data for counter-type habits
      if (habit.goalType === GoalType.Counter) {
        habitStats.counterData = await this.calculateCounterData(
          habitCompletions
        );
      }

      habitStatistics.push(habitStats);
    }

    return habitStatistics;
  }

  /**
   * Generate daily completion summaries
   */
  private async generateDailySummaries(
    habits: Habit[],
    completions: Completion[],
    startDate: string,
    endDate: string
  ): Promise<DailyCompletionSummary[]> {
    const dailySummaries: DailyCompletionSummary[] = [];
    const dateRange = getDateRange(startDate, endDate);

    for (const date of dateRange) {
      // Count total scheduled habits for this day
      const scheduledHabits = habits.filter((habit) => {
        const dateObj = new Date(date);
        return this.isHabitDueOnDate(habit, dateObj);
      });

      // Count completed habits for this day
      const dateCompletions = completions.filter(
        (c) => c.date === date && c.completed
      );
      const completedHabitIds = new Set(dateCompletions.map((c) => c.habitId));
      const completedCount = scheduledHabits.filter((h) =>
        completedHabitIds.has(h.id)
      ).length;

      // Calculate completion rate
      const totalCount = scheduledHabits.length;
      const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

      dailySummaries.push({
        date,
        completedCount,
        totalCount,
        completionRate,
      });
    }

    return dailySummaries;
  }

  /**
   * Calculate overall completion rate from daily summaries
   */
  private calculateOverallCompletionRate(
    dailySummaries: DailyCompletionSummary[]
  ): number {
    if (dailySummaries.length === 0) return 0;

    let totalCompleted = 0;
    let totalScheduled = 0;

    for (const summary of dailySummaries) {
      totalCompleted += summary.completedCount;
      totalScheduled += summary.totalCount;
    }

    return totalScheduled > 0 ? totalCompleted / totalScheduled : 0;
  }

  /**
   * Find the most consistent habit (highest completion rate)
   */
  private findMostConsistentHabit(
    habitStatistics: HabitStatistics[]
  ): string | undefined {
    if (habitStatistics.length === 0) return undefined;

    let mostConsistent = habitStatistics[0];

    for (const stat of habitStatistics) {
      if (
        stat.completionRate > mostConsistent.completionRate &&
        stat.totalScheduledDays > 0
      ) {
        mostConsistent = stat;
      }
    }

    return mostConsistent.habitId;
  }

  /**
   * Find the least consistent habit (lowest completion rate)
   */
  private findLeastConsistentHabit(
    habitStatistics: HabitStatistics[]
  ): string | undefined {
    if (habitStatistics.length === 0) return undefined;

    // Filter to only include habits with scheduled days
    const validStats = habitStatistics.filter(
      (stat) => stat.totalScheduledDays > 0
    );
    if (validStats.length === 0) return undefined;

    let leastConsistent = validStats[0];

    for (const stat of validStats) {
      if (stat.completionRate < leastConsistent.completionRate) {
        leastConsistent = stat;
      }
    }

    return leastConsistent.habitId;
  }

  /**
   * Find the best streak across all habits
   */
  private findBestStreak(
    habitStatistics: HabitStatistics[]
  ): { habitId: string; streakLength: number } | undefined {
    let bestStreak: { habitId: string; streakLength: number } | undefined;

    for (const stat of habitStatistics) {
      if (stat.streakData) {
        const longestStreak = stat.streakData.longestStreak;

        if (!bestStreak || longestStreak > bestStreak.streakLength) {
          bestStreak = {
            habitId: stat.habitId,
            streakLength: longestStreak,
          };
        }
      }
    }

    return bestStreak;
  }

  /**
   * Find the day with the highest completion rate
   */
  private findBestDay(
    dailySummaries: DailyCompletionSummary[]
  ): { date: string; completionRate: number } | undefined {
    if (dailySummaries.length === 0) return undefined;

    // Filter to only include days with scheduled habits
    const validDays = dailySummaries.filter((day) => day.totalCount > 0);
    if (validDays.length === 0) return undefined;

    let bestDay = validDays[0];

    for (const day of validDays) {
      if (day.completionRate > bestDay.completionRate) {
        bestDay = day;
      }
    }

    return {
      date: bestDay.date,
      completionRate: bestDay.completionRate,
    };
  }

  /**
   * Calculate average streak length for a habit
   */
  private async calculateAverageStreak(
    habit: Habit,
    completions: Completion[]
  ): Promise<number> {
    // This is a simplified version - we would need to implement streak calculation logic
    // to properly calculate average streak length across the habit's history
    // For now, return 0 as a placeholder
    return 0;
  }

  /**
   * Calculate counter statistics for a habit
   */
  private async calculateCounterData(
    completions: Completion[]
  ): Promise<{ total: number; average: number; highest: number }> {
    // Filter completions with values
    const completionsWithValues = completions.filter(
      (c) => c.completed && typeof c.value === "number"
    );

    if (completionsWithValues.length === 0) {
      return { total: 0, average: 0, highest: 0 };
    }

    // Calculate total
    const total = completionsWithValues.reduce(
      (sum, c) => sum + (c.value || 0),
      0
    );

    // Calculate average
    const average = total / completionsWithValues.length;

    // Find highest
    const highest = Math.max(...completionsWithValues.map((c) => c.value || 0));

    return { total, average, highest };
  }

  /**
   * Aggregate daily summaries by the specified granularity
   */
  private aggregateTrendsByGranularity(
    dailySummaries: DailyCompletionSummary[],
    granularity: "daily" | "weekly" | "monthly"
  ): {
    period: string;
    completionRate: number;
    completedCount: number;
    totalCount: number;
  }[] {
    if (granularity === "daily") {
      return dailySummaries.map((summary) => ({
        period: summary.date,
        completionRate: summary.completionRate,
        completedCount: summary.completedCount,
        totalCount: summary.totalCount,
      }));
    }

    // Group by week or month
    const periodGroups: Record<string, DailyCompletionSummary[]> = {};

    for (const summary of dailySummaries) {
      const date = new Date(summary.date);
      let periodKey: string;

      if (granularity === "weekly") {
        // Use ISO week number as the period key
        const weekNumber = this.getISOWeek(date);
        const year = date.getFullYear();
        periodKey = `${year}-W${weekNumber.toString().padStart(2, "0")}`;
      } else {
        // Use year-month as the period key
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        periodKey = `${year}-${month.toString().padStart(2, "0")}`;
      }

      if (!periodGroups[periodKey]) {
        periodGroups[periodKey] = [];
      }

      periodGroups[periodKey].push(summary);
    }

    // Aggregate each period
    return Object.entries(periodGroups)
      .map(([period, summaries]) => {
        let totalCompletedCount = 0;
        let totalCount = 0;

        for (const summary of summaries) {
          totalCompletedCount += summary.completedCount;
          totalCount += summary.totalCount;
        }

        const completionRate =
          totalCount > 0 ? totalCompletedCount / totalCount : 0;

        return {
          period,
          completionRate,
          completedCount: totalCompletedCount,
          totalCount,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get ISO week number for a date
   */
  private getISOWeek(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Check if a habit is due on a specific date
   */
  private isHabitDueOnDate(habit: Habit, date: Date): boolean {
    // Import and use isHabitDueOnDate from streakCalculator.ts
    // This is just a placeholder implementation
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateOfMonth = date.getDate(); // 1-31

    switch (habit.repetition) {
      case "daily":
        return true;

      case "weekly":
        return habit.specificDays?.includes(day) ?? false;

      case "monthly":
        return habit.specificDates?.includes(dateOfMonth) ?? false;

      default:
        return false;
    }
  }

  /**
   * Clear the analytics cache
   */
  clearCache(): void {
    this.analyticsCache.flushAll();
    logger.info("Analytics cache cleared");
  }
}
