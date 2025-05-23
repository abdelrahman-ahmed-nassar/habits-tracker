import { v4 as uuidv4 } from "uuid";
import NodeCache from "node-cache";
import {
  TimeFrame,
  AnalyticsSummary,
  HabitStatistics,
  DailyCompletionSummary,
} from "../../../shared/src/analytics";
import { Habit, GoalType, HabitTag } from "../../../shared/src/habits";
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
import {
  calculateStreakData,
  isHabitDueOnDate,
} from "../utils/streakCalculator";
import {
  calculateAverage,
  calculateConsistencyScore,
  calculateDayOfWeekStats,
  calculateGoalAchievement,
  calculateRelativePerformance,
  calculateStatsByTag,
  calculateStreakStats,
  calculateTrendAnalysis,
} from "../utils/statisticsUtils";
import logger from "../utils/logger";

// Enhanced interfaces for analytics
interface EnhancedAnalytics extends AnalyticsSummary {
  // Day of week performance
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    dayName: string;
    completionRate: number;
    totalCount: number;
    completedCount: number;
  }>;

  // Consistency metrics
  consistencyScore: number;

  // Tag-based analytics
  tagStats: Array<{
    tag: HabitTag;
    habitCount: number;
    completionRate: number;
    totalScheduled: number;
    totalCompleted: number;
  }>;

  // Trend analysis
  trendAnalysis: {
    direction: "increasing" | "decreasing" | "stable";
    strength: number;
    slope: number;
  };

  // Period comparison
  periodComparison?: {
    previous: {
      startDate: string;
      endDate: string;
      overallCompletionRate: number;
    };
    change: number;
    changePercent: number;
    improved: boolean;
  };
}

interface EnhancedHabitStatistics extends HabitStatistics {
  // Consistency score (0-100)
  consistencyScore: number;

  // Trend analysis
  trendAnalysis: {
    direction: "increasing" | "decreasing" | "stable";
    strength: number;
    slope: number;
  };

  // Goal achievement percentage
  goalAchievement: number;

  // Day of week performance for this habit
  dayOfWeekPerformance: Array<{
    dayOfWeek: number;
    dayName: string;
    completionRate: number;
  }>;
}

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
  ): Promise<EnhancedAnalytics> {
    // Generate cache key
    const cacheKey = `overall_${startDate}_${endDate}_${includeArchived}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<EnhancedAnalytics>(cacheKey);
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

    // Calculate day of week statistics
    const dayOfWeekStats = calculateDayOfWeekStats(dailySummaries);

    // Calculate consistency score
    const dailyRates = dailySummaries.map((day) => day.completionRate);
    const consistencyScore = calculateConsistencyScore(
      overallCompletionRate,
      dailyRates
    );

    // Calculate tag statistics
    const tagStats = calculateStatsByTag(filteredHabits, completions);

    // Calculate trend analysis
    const dailyRatesForTrend = dailySummaries.map((day) => day.completionRate);
    const trendAnalysis = calculateTrendAnalysis(dailyRatesForTrend);

    // Calculate period comparison if possible
    let periodComparison:
      | {
          previous: {
            startDate: string;
            endDate: string;
            overallCompletionRate: number;
          };
          change: number;
          changePercent: number;
          improved: boolean;
        }
      | undefined;

    // Calculate the previous period of the same length
    const periodLength =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    const prevEndDate = new Date(new Date(startDate).getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - periodLength);

    // Try to get previous period data if it's not too old
    if (prevStartDate.getFullYear() >= 2000) {
      try {
        const prevPeriodStartDate = formatDateString(prevStartDate);
        const prevPeriodEndDate = formatDateString(prevEndDate);

        const prevPeriodCompletions = (
          await this.completionService.getCompletionsInRange(
            prevPeriodStartDate,
            prevPeriodEndDate
          )
        ).completions;

        const prevPeriodSummaries = await this.generateDailySummaries(
          filteredHabits,
          prevPeriodCompletions,
          prevPeriodStartDate,
          prevPeriodEndDate
        );

        const prevPeriodCompletionRate =
          this.calculateOverallCompletionRate(prevPeriodSummaries);

        // Calculate relative performance
        const performance = calculateRelativePerformance(
          overallCompletionRate,
          prevPeriodCompletionRate
        );

        periodComparison = {
          previous: {
            startDate: prevPeriodStartDate,
            endDate: prevPeriodEndDate,
            overallCompletionRate: prevPeriodCompletionRate,
          },
          change: performance.change,
          changePercent: performance.changePercent,
          improved: performance.improved,
        };
      } catch (error) {
        logger.warn("Could not calculate period comparison:", error);
        // Continue without period comparison
      }
    }

    // Create enhanced analytics summary
    const result: EnhancedAnalytics = {
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
      // Enhanced analytics fields:
      dayOfWeekStats,
      consistencyScore,
      tagStats,
      trendAnalysis,
      periodComparison,
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
  ): Promise<EnhancedHabitStatistics> {
    // Generate cache key
    const cacheKey = `habit_${habitId}_${startDate}_${endDate}`;

    // Check cache first
    const cachedResult =
      this.analyticsCache.get<EnhancedHabitStatistics>(cacheKey);
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

    // Calculate completion by day of week
    const completionsByDayOfWeek = this.calculateHabitDayOfWeekPerformance(
      habit,
      completions,
      startDate,
      endDate
    );

    // Calculate daily completion rates for this habit
    const dateRange = getDateRange(startDate, endDate);
    const dailyRates = dateRange
      .map((date) => {
        const dueThatDay = isHabitDueOnDate(habit, new Date(date));
        if (!dueThatDay) return null;

        const completedThatDay = completions.some(
          (c) => c.date === date && c.completed
        );

        return completedThatDay ? 1 : 0;
      })
      .filter((rate) => rate !== null) as number[];

    // Calculate consistency score
    const consistencyScore = calculateConsistencyScore(
      statistics.completionRate,
      dailyRates
    );

    // Calculate trend analysis
    const trendAnalysis = calculateTrendAnalysis(dailyRates);

    // Calculate goal achievement percentage
    const totalCompleted = statistics.totalCompletions;
    const goalTarget =
      habit.goalType === GoalType.Counter
        ? habit.goalValue * scheduledDays // For counter-type habits, goal * scheduled days
        : scheduledDays; // For streak-type habits, 100% = all scheduled days

    const goalAchievement = calculateGoalAchievement(
      totalCompleted,
      goalTarget
    );

    // Build enhanced habit statistics
    const habitStats: EnhancedHabitStatistics = {
      habitId,
      completionRate: statistics.completionRate,
      totalCompletions: statistics.totalCompletions,
      totalScheduledDays: scheduledDays,
      // Enhanced fields
      consistencyScore,
      trendAnalysis,
      goalAchievement,
      dayOfWeekPerformance: completionsByDayOfWeek,
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
    trendAnalysis: {
      direction: "increasing" | "decreasing" | "stable";
      strength: number;
      slope: number;
    };
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
      trendAnalysis: {
        direction: "increasing" | "decreasing" | "stable";
        strength: number;
        slope: number;
      };
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

    // Calculate trend analysis on the aggregated data
    const completionRates = trends.map((t) => t.completionRate);
    const trendAnalysis = calculateTrendAnalysis(completionRates);

    // Store in cache
    const result = { trends, trendAnalysis };
    this.analyticsCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get analytics for a specific time frame (day, week, month)
   */
  async getTimeBasedAnalytics(
    timeFrame: TimeFrame,
    dateString: string
  ): Promise<EnhancedAnalytics> {
    // Generate cache key
    const cacheKey = `timeframe_${timeFrame}_${dateString}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<EnhancedAnalytics>(cacheKey);
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
   * Get best/worst day of week analysis
   */
  async getDayOfWeekAnalysis(
    startDate: string,
    endDate: string,
    includeArchived: boolean = false
  ): Promise<{
    dayOfWeekStats: Array<{
      dayOfWeek: number;
      dayName: string;
      completionRate: number;
      totalCount: number;
      completedCount: number;
    }>;
    bestDay: {
      dayOfWeek: number;
      dayName: string;
      completionRate: number;
    };
    worstDay: {
      dayOfWeek: number;
      dayName: string;
      completionRate: number;
    };
  }> {
    // Generate cache key
    const cacheKey = `dow_${startDate}_${endDate}_${includeArchived}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<{
      dayOfWeekStats: Array<{
        dayOfWeek: number;
        dayName: string;
        completionRate: number;
        totalCount: number;
        completedCount: number;
      }>;
      bestDay: {
        dayOfWeek: number;
        dayName: string;
        completionRate: number;
      };
      worstDay: {
        dayOfWeek: number;
        dayName: string;
        completionRate: number;
      };
    }>(cacheKey);

    if (cachedResult) {
      logger.debug("Retrieved day of week analysis from cache:", cacheKey);
      return cachedResult;
    }

    // Get overall analytics which includes daily summaries
    const analytics = await this.getOverallAnalytics(
      startDate,
      endDate,
      includeArchived
    );

    // Calculate day of week stats
    const dayOfWeekStats = analytics.dayOfWeekStats;

    // Find best and worst days (only consider days with data)
    const validDays = dayOfWeekStats.filter((day) => day.totalCount > 0);

    let bestDay = validDays[0];
    let worstDay = validDays[0];

    for (const day of validDays) {
      if (day.completionRate > bestDay.completionRate) {
        bestDay = day;
      }
      if (day.completionRate < worstDay.completionRate) {
        worstDay = day;
      }
    }

    const result = {
      dayOfWeekStats,
      bestDay: {
        dayOfWeek: bestDay.dayOfWeek,
        dayName: bestDay.dayName,
        completionRate: bestDay.completionRate,
      },
      worstDay: {
        dayOfWeek: worstDay.dayOfWeek,
        dayName: worstDay.dayName,
        completionRate: worstDay.completionRate,
      },
    };

    // Store in cache
    this.analyticsCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get tag-based analytics
   */
  async getTagAnalytics(
    startDate: string,
    endDate: string,
    includeArchived: boolean = false
  ): Promise<{
    tagStats: Array<{
      tag: HabitTag;
      habitCount: number;
      completionRate: number;
      totalScheduled: number;
      totalCompleted: number;
    }>;
    bestTag: {
      tag: HabitTag;
      completionRate: number;
    };
    worstTag: {
      tag: HabitTag;
      completionRate: number;
    };
  }> {
    // Generate cache key
    const cacheKey = `tags_${startDate}_${endDate}_${includeArchived}`;

    // Check cache first
    const cachedResult = this.analyticsCache.get<{
      tagStats: Array<{
        tag: HabitTag;
        habitCount: number;
        completionRate: number;
        totalScheduled: number;
        totalCompleted: number;
      }>;
      bestTag: {
        tag: HabitTag;
        completionRate: number;
      };
      worstTag: {
        tag: HabitTag;
        completionRate: number;
      };
    }>(cacheKey);

    if (cachedResult) {
      logger.debug("Retrieved tag analytics from cache:", cacheKey);
      return cachedResult;
    }

    // Get overall analytics which includes tag statistics
    const analytics = await this.getOverallAnalytics(
      startDate,
      endDate,
      includeArchived
    );

    const tagStats = analytics.tagStats;

    // Find best and worst tags (only consider tags with data)
    const validTags = tagStats.filter((tag) => tag.totalScheduled > 0);

    let bestTag = validTags[0];
    let worstTag = validTags[0];

    for (const tag of validTags) {
      if (tag.completionRate > bestTag.completionRate) {
        bestTag = tag;
      }
      if (tag.completionRate < worstTag.completionRate) {
        worstTag = tag;
      }
    }

    const result = {
      tagStats,
      bestTag: {
        tag: bestTag.tag,
        completionRate: bestTag.completionRate,
      },
      worstTag: {
        tag: worstTag.tag,
        completionRate: worstTag.completionRate,
      },
    };

    // Store in cache
    this.analyticsCache.set(cacheKey, result);

    return result;
  }

  /**
   * Calculate performance metrics for habit by day of week
   */
  private calculateHabitDayOfWeekPerformance(
    habit: Habit,
    completions: Completion[],
    startDate: string,
    endDate: string
  ): Array<{
    dayOfWeek: number;
    dayName: string;
    completionRate: number;
  }> {
    const daysOfWeek = [
      { dayOfWeek: 0, dayName: "Sunday", completions: 0, scheduled: 0 },
      { dayOfWeek: 1, dayName: "Monday", completions: 0, scheduled: 0 },
      { dayOfWeek: 2, dayName: "Tuesday", completions: 0, scheduled: 0 },
      { dayOfWeek: 3, dayName: "Wednesday", completions: 0, scheduled: 0 },
      { dayOfWeek: 4, dayName: "Thursday", completions: 0, scheduled: 0 },
      { dayOfWeek: 5, dayName: "Friday", completions: 0, scheduled: 0 },
      { dayOfWeek: 6, dayName: "Saturday", completions: 0, scheduled: 0 },
    ];

    // Get all dates in the range
    const dateRange = getDateRange(startDate, endDate);

    // For each date, check if habit was due and if it was completed
    for (const date of dateRange) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      if (isHabitDueOnDate(habit, dateObj)) {
        daysOfWeek[dayOfWeek].scheduled++;

        // Check if it was completed
        const wasCompleted = completions.some(
          (c) => c.date === date && c.completed
        );

        if (wasCompleted) {
          daysOfWeek[dayOfWeek].completions++;
        }
      }
    }

    // Calculate completion rate for each day
    return daysOfWeek.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      completionRate: day.scheduled > 0 ? day.completions / day.scheduled : 0,
    }));
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
        return isHabitDueOnDate(habit, dateObj);
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
    if (completions.length === 0) return 0;

    // Sort completions by date (oldest first)
    const sortedCompletions = [...completions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Track all streaks
    const streaks: number[] = [];
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const completion of sortedCompletions) {
      if (!completion.completed) {
        // This breaks the streak
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
        previousDate = new Date(completion.date);
        continue;
      }

      const currentDate = new Date(completion.date);

      if (previousDate === null) {
        // First completion, start streak
        currentStreak = 1;
      } else {
        // Check if dates are consecutive for the habit's repetition pattern
        // This is a simplification - would need proper consecutive day logic
        const daysBetween = Math.round(
          (currentDate.getTime() - previousDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (
          daysBetween === 1 ||
          (habit.repetition === "weekly" && daysBetween <= 7) ||
          (habit.repetition === "monthly" && daysBetween <= 31)
        ) {
          currentStreak++;
        } else {
          // Break in the streak
          if (currentStreak > 0) {
            streaks.push(currentStreak);
          }
          currentStreak = 1;
        }
      }

      previousDate = currentDate;
    }

    // Add the final streak if any
    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    // Calculate average
    return streaks.length > 0 ? calculateAverage(streaks) : 0;
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
   * Clear the analytics cache
   */
  clearCache(): void {
    this.analyticsCache.flushAll();
    logger.info("Analytics cache cleared");
  }
}
