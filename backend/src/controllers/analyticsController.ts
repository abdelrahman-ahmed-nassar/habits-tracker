import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import {
  calculateSuccessRate,
  calculateDayOfWeekStats,
  findBestAndWorstDays,
  calculateMonthlyTrends,
  calculateStreakPeriods,
  getDayName,
  getMonthName,
} from "../utils/analyticsUtils";
import { isValidDateFormat } from "../utils/validation";
import {
  getDatesBetween,
  parseDate,
  getDateDaysAgo,
  getTodayDateString,
  formatDateToString,
} from "../utils/dateUtils";
import { analyticsCache } from "../utils/cacheUtils";
import * as analyticsService from "../services/analyticsService";

/**
 * Get overall analytics and trends
 * @route GET /api/analytics/overview
 */
export const getOverallAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    // Try to get from cache first
    const cacheKey = "analytics:overview";

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Get all habits and completions
      const habits = await dataService.getHabits();
      const activeHabits = habits.filter((h) => h.isActive);
      const completions = await dataService.getCompletions();

      // Calculate overall stats - only count active habits in the total
      const totalHabits = activeHabits.length; // Changed to only count active habits
      const activeHabitsCount = activeHabits.length;
      const completedToday = completions.filter(
        (c) =>
          c.date === getTodayDateString() &&
          c.completed &&
          activeHabits.some((h) => h.id === c.habitId)
      ).length;

      // Get last 30 days
      const today = getTodayDateString();
      const thirtyDaysAgo = getDateDaysAgo(30);
      const last30DaysCompletions = completions.filter(
        (c) =>
          c.date >= thirtyDaysAgo &&
          c.date <= today &&
          activeHabits.some((h) => h.id === c.habitId)
      );

      // Calculate habit with longest streak
      const longestStreakHabit = activeHabits.sort(
        (a, b) => b.bestStreak - a.bestStreak
      )[0];

      // Calculate most consistent habits (highest success rate in last 30 days)
      const habitSuccessRates = await Promise.all(
        activeHabits.map(async (habit) => {
          const habitCompletions = completions.filter(
            (c) => c.habitId === habit.id
          );
          const successRate = calculateSuccessRate(
            habit,
            habitCompletions,
            thirtyDaysAgo,
            today
          );

          return {
            habitId: habit.id,
            habitName: habit.name,
            successRate,
            currentStreak: habit.currentStreak,
            bestStreak: habit.bestStreak,
          };
        })
      );

      // Sort by success rate
      const mostConsistentHabits = habitSuccessRates
        .filter((h) => h.successRate > 0)
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5);

      // Calculate overall success rate
      const last30DaysActiveHabitDays = activeHabits.reduce((total, habit) => {
        const dateRange = getDatesBetween(thirtyDaysAgo, today);
        const activeDates = dateRange.filter(
          (date) => date <= today && date >= habit.createdAt.split("T")[0]
        );
        return total + activeDates.length;
      }, 0);

      const last30DaysSuccessRate =
        last30DaysActiveHabitDays > 0
          ? last30DaysCompletions.filter((c) => c.completed).length /
            last30DaysActiveHabitDays
          : 0;

      // Calculate best day of week overall
      const today7DaysAgo = getDateDaysAgo(7);
      const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      const dayOfWeekCompletions = [0, 0, 0, 0, 0, 0, 0];

      completions.forEach((completion) => {
        if (
          completion.date >= thirtyDaysAgo &&
          completion.date <= today &&
          activeHabits.some((h) => h.id === completion.habitId)
        ) {
          const date = parseDate(completion.date);
          const dayOfWeek = date.getDay();

          dayOfWeekCounts[dayOfWeek]++;
          if (completion.completed) {
            dayOfWeekCompletions[dayOfWeek]++;
          }
        }
      });

      const dayOfWeekRates = dayOfWeekCounts.map((count, index) => ({
        dayOfWeek: index,
        dayName: getDayName(index),
        successRate: count > 0 ? dayOfWeekCompletions[index] / count : 0,
        totalCompletions: dayOfWeekCompletions[index],
      }));

      const bestDayOfWeek =
        [...dayOfWeekRates]
          .filter((day) => day.totalCompletions > 0)
          .sort((a, b) => b.successRate - a.successRate)[0] || null;

      return {
        totalHabits,
        activeHabitsCount,
        completedToday,
        mostConsistentHabits,
        longestStreakHabit: longestStreakHabit
          ? {
              habitName: longestStreakHabit.name,
              bestStreak: longestStreakHabit.bestStreak,
            }
          : null,
        last30DaysSuccessRate,
        bestDayOfWeek,
        dayOfWeekStats: dayOfWeekRates,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Get individual habit analytics
 * @route GET /api/analytics/habits/:id
 */
export const getHabitAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { period = "30days" } = req.query;

    // Calculate date range based on period
    let startDate: string;
    let endDate = getTodayDateString();

    if (period === "7days") {
      startDate = getDateDaysAgo(7);
    } else if (period === "30days") {
      startDate = getDateDaysAgo(30);
    } else if (period === "90days") {
      startDate = getDateDaysAgo(90);
    } else if (period === "365days") {
      startDate = getDateDaysAgo(365);
    } else {
      startDate = getDateDaysAgo(30); // Default to 30 days
    }

    // Generate cache key
    const cacheKey = `analytics:habit:${id}:${period}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Get habit and its completions
      const habit = await dataService.getHabitById(id);

      if (!habit) {
        throw new AppError(`Habit with ID ${id} not found`, 404);
      }

      // Check if habit is active
      if (!habit.isActive) {
        throw new AppError(
          `Habit with ID ${id} is inactive and cannot be analyzed`,
          400
        );
      }

      const completions = await dataService.getCompletionsByHabitId(id);
      const filteredCompletions = completions.filter(
        (c) => c.date >= startDate && c.date <= endDate
      );

      // Calculate success rate
      const successRate = calculateSuccessRate(
        habit,
        filteredCompletions,
        startDate,
        endDate
      );

      // Calculate day of week stats
      const dayOfWeekStats = calculateDayOfWeekStats(
        habit,
        filteredCompletions,
        startDate,
        endDate
      ).map((day) => ({
        ...day,
        dayName: getDayName(day.dayOfWeek),
      }));

      // Find best and worst days
      const { best, worst } = findBestAndWorstDays(
        habit,
        filteredCompletions,
        startDate,
        endDate
      );

      // Calculate streaks
      const streakPeriods = calculateStreakPeriods(habit, completions);

      // Calculate monthly trends for the current year
      const currentYear = new Date().getFullYear();
      const monthlyTrends = calculateMonthlyTrends(
        habit,
        completions,
        currentYear
      ).map((trend) => ({
        ...trend,
        monthName: getMonthName(trend.month),
      }));

      // Calculate completion distribution
      let totalDays = 0;
      let completedDays = 0;

      getDatesBetween(startDate, endDate).forEach((date) => {
        if (date <= habit.createdAt.split("T")[0]) return;

        // Only count days when the habit should be active
        if (
          habit.repetition === "daily" ||
          (habit.repetition === "weekly" &&
            habit.specificDays?.includes(parseDate(date).getDay())) ||
          (habit.repetition === "monthly" &&
            habit.specificDays?.includes(parseDate(date).getDate()))
        ) {
          totalDays++;

          // Check if completed
          const completion = filteredCompletions.find((c) => c.date === date);
          if (completion && completion.completed) {
            completedDays++;
          }
        }
      });

      return {
        habitId: habit.id,
        habitName: habit.name,
        period: {
          startDate,
          endDate,
          description: period,
        },
        basicStats: {
          totalDays,
          completedDays,
          successRate,
          currentStreak: habit.currentStreak,
          bestStreak: habit.bestStreak,
        },
        counterStats:
          habit.goalType === "counter"
            ? {
                totalValue: filteredCompletions.reduce(
                  (sum, c) => sum + (c.value || 0),
                  0
                ),
                goalValue: habit.goalValue,
                progress:
                  filteredCompletions.reduce(
                    (sum, c) => sum + (c.value || 0),
                    0
                  ) / habit.goalValue,
                completions: filteredCompletions.map((c) => ({
                  date: c.date,
                  value: c.value || 0,
                })),
              }
            : null,
        dayOfWeekStats,
        bestDay:
          best !== -1
            ? {
                dayOfWeek: best,
                dayName: getDayName(best),
              }
            : null,
        worstDay:
          worst !== -1
            ? {
                dayOfWeek: worst,
                dayName: getDayName(worst),
              }
            : null,
        topStreaks: streakPeriods.slice(0, 3),
        monthlyTrends,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Get daily completion analytics
 * @route GET /api/analytics/daily/:date
 */
export const getDailyAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const cacheKey = `analytics:daily:${date}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Get all habits and completions for this date - ensure we only use active habits
      const habits = await dataService.getHabits();
      const activeHabits = habits.filter((h) => h.isActive);
      const completions = await dataService.getCompletionsByDate(date);

      // Only consider habits created before or on this date
      const relevantHabits = activeHabits.filter(
        (h) => h.createdAt.split("T")[0] <= date
      );

      // Get completed habits
      const completedHabitIds = new Set(
        completions
          .filter(
            (c) => c.completed && relevantHabits.some((h) => h.id === c.habitId)
          )
          .map((c) => c.habitId)
      );

      // Calculate completion rate
      const habitsForDate = relevantHabits.filter(
        (habit) =>
          habit.repetition === "daily" ||
          (habit.repetition === "weekly" &&
            habit.specificDays?.includes(parseDate(date).getDay())) ||
          (habit.repetition === "monthly" &&
            habit.specificDays?.includes(parseDate(date).getDate()))
      );

      const completionRate =
        habitsForDate.length > 0
          ? habitsForDate.filter((h) => completedHabitIds.has(h.id)).length /
            habitsForDate.length
          : 0;

      // Get detailed habit stats
      const habitDetails = await Promise.all(
        habitsForDate.map(async (habit) => {
          const completion = completions.find((c) => c.habitId === habit.id);

          return {
            habitId: habit.id,
            habitName: habit.name,
            tag: habit.tag,
            goalType: habit.goalType,
            goalValue: habit.goalValue,
            completed: completion ? completion.completed : false,
            value: completion?.value,
            streakImpact: completion?.completed
              ? habit.currentStreak - (habit.currentStreak > 0 ? 1 : 0)
              : 0,
          };
        })
      );

      // Calculate tag-based analytics
      const tagAnalytics = new Map<
        string,
        { total: number; completed: number }
      >();

      // Initialize tag analytics
      habitsForDate.forEach((habit) => {
        if (!tagAnalytics.has(habit.tag)) {
          tagAnalytics.set(habit.tag, { total: 0, completed: 0 });
        }
        const tagStats = tagAnalytics.get(habit.tag)!;
        tagStats.total++;
        if (completedHabitIds.has(habit.id)) {
          tagStats.completed++;
        }
      });

      // Convert tag analytics to array with completion rates
      const tagStats = Array.from(tagAnalytics.entries()).map(
        ([tag, stats]) => ({
          tag,
          totalHabits: stats.total,
          completedHabits: stats.completed,
          completionRate: stats.total > 0 ? stats.completed / stats.total : 0,
        })
      );

      // Sort tag stats by completion rate (descending)
      tagStats.sort((a, b) => b.completionRate - a.completionRate);

      // Get daily note if exists
      const note = await dataService.getNoteByDate(date);

      return {
        date,
        completionRate: Number(completionRate.toFixed(2)), // Round to 2 decimal places after percentage calculation
        totalHabits: habitsForDate.length,
        completedHabits: completedHabitIds.size,
        habitDetails,
        tagStats,
        note: note
          ? {
              id: note.id,
              content: note.content,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Get weekly analytics
 * @route GET /api/analytics/weekly/:startDate
 */
export const getWeeklyAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate } = req.params;

    // Validate date format
    if (!isValidDateFormat(startDate)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const cacheKey = `analytics:weekly:${startDate}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Calculate end date (start date + 6 days)
      const start = parseDate(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endDate = end.toISOString().split("T")[0];

      // Get date range
      const dateRange = getDatesBetween(startDate, endDate);

      // Get habits and completions
      const habits = await dataService.getHabits();
      const activeHabits = habits.filter((h) => h.isActive);
      const allCompletions = await dataService.getCompletions();

      // Filter completions within date range
      const weeklyCompletions = allCompletions.filter(
        (c) =>
          c.date >= startDate &&
          c.date <= endDate &&
          activeHabits.some((h) => h.id === c.habitId)
      );

      // Calculate daily completion rates
      const dailyStats = await Promise.all(
        dateRange.map(async (date) => {
          // Only count habits created before or on this date
          const relevantHabits = activeHabits.filter(
            (h) =>
              h.createdAt.split("T")[0] <= date &&
              (h.repetition === "daily" ||
                (h.repetition === "weekly" &&
                  h.specificDays?.includes(parseDate(date).getDay())) ||
                (h.repetition === "monthly" &&
                  h.specificDays?.includes(parseDate(date).getDate())))
          );

          const dayCompletions = weeklyCompletions.filter(
            (c) => c.date === date
          );
          const completedHabitIds = new Set(
            dayCompletions.filter((c) => c.completed).map((c) => c.habitId)
          );

          // Calculate completion rate for this date
          const completionRate =
            relevantHabits.length > 0
              ? (relevantHabits.filter((h) => completedHabitIds.has(h.id))
                  .length /
                  relevantHabits.length) *
                100
              : 0;

          return {
            date,
            dayOfWeek: parseDate(date).getDay(),
            dayName: getDayName(parseDate(date).getDay()),
            totalHabits: relevantHabits.length,
            completedHabits: completedHabitIds.size,
            completionRate: Number(completionRate.toFixed(2)), // Round to 2 decimal places after percentage calculation
          };
        })
      );

      // Calculate per-habit stats
      const habitStats = await Promise.all(
        activeHabits.map(async (habit) => {
          const habitCompletions = weeklyCompletions.filter(
            (c) => c.habitId === habit.id
          );

          // Calculate active days for this habit in the week
          const activeDays = dateRange.filter(
            (date) =>
              habit.createdAt.split("T")[0] <= date &&
              (habit.repetition === "daily" ||
                (habit.repetition === "weekly" &&
                  habit.specificDays?.includes(parseDate(date).getDay())) ||
                (habit.repetition === "monthly" &&
                  habit.specificDays?.includes(parseDate(date).getDate())))
          );

          const completedDays = habitCompletions
            .filter((c) => c.completed)
            .map((c) => c.date);

          return {
            habitId: habit.id,
            habitName: habit.name,
            activeDaysCount: activeDays.length,
            completedDaysCount: completedDays.length,
            successRate:
              activeDays.length > 0
                ? completedDays.length / activeDays.length
                : 0,
            completedDates: completedDays,
          };
        })
      );

      // Calculate overall weekly stats
      const weeklySuccessRate =
        dailyStats.reduce((sum, day) => sum + (day.completionRate || 0), 0) /
        dailyStats.length;

      const mostProductiveDay = [...dailyStats].sort(
        (a, b) => b.completionRate - a.completionRate
      )[0];

      const leastProductiveDay = [...dailyStats].sort(
        (a, b) => a.completionRate - b.completionRate
      )[0];

      const mostProductiveHabit =
        [...habitStats]
          .filter((h) => h.activeDaysCount > 0)
          .sort((a, b) => b.successRate - a.successRate)[0] || null;

      return {
        startDate,
        endDate,
        dailyStats,
        weeklyStats: {
          overallSuccessRate: weeklySuccessRate,
          totalCompletions: weeklyCompletions.filter((c) => c.completed).length,
          mostProductiveDay,
          leastProductiveDay,
          mostProductiveHabit,
        },
        habitStats: habitStats.sort((a, b) => b.successRate - a.successRate),
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Get monthly analytics
 * @route GET /api/analytics/monthly/:year/:month
 */
export const getMonthlyAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { year, month } = req.params;

    // Validate year and month
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1; // JS months are 0-indexed

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      throw new AppError("Invalid year or month. Month should be 1-12", 400);
    }

    const cacheKey = `analytics:monthly:${year}:${month + 1}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Calculate start and end dates for the month
      const startDate = new Date(yearNum, monthNum, 1);
      const endDate = new Date(yearNum, monthNum + 1, 0); // Last day of month

      // Reset time components to avoid timezone issues
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Format dates as YYYY-MM-DD strings
      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);

      // Get date range for the month
      const dateRange = getDatesBetween(startDateStr, endDateStr);

      // Get habits and completions - ensure we only use active habits
      const habits = await dataService.getHabits();
      const activeHabits = habits.filter((h) => h.isActive);
      const allCompletions = await dataService.getCompletions();

      // Filter completions within month
      const monthlyCompletions = allCompletions.filter(
        (c) =>
          c.date >= startDateStr &&
          c.date <= endDateStr &&
          activeHabits.some((h) => h.id === c.habitId)
      );

      // Count completions per day
      const dailyCompletionCounts = dateRange.map((date) => {
        const dayCompletions = monthlyCompletions.filter(
          (c) => c.date === date && c.completed
        );

        const dayHabits = activeHabits.filter(
          (h) =>
            h.createdAt.split("T")[0] <= date &&
            (h.repetition === "daily" ||
              (h.repetition === "weekly" &&
                h.specificDays?.includes(parseDate(date).getDay())) ||
              (h.repetition === "monthly" &&
                h.specificDays?.includes(parseDate(date).getDate())))
        );

        // Count unique completed habits instead of total completion records
        const uniqueCompletedHabits = new Set(
          dayCompletions.map((c) => c.habitId)
        ).size;

        // Calculate completion rate and ensure it doesn't exceed 100%
        const calculatedRate =
          dayHabits.length > 0 ? uniqueCompletedHabits / dayHabits.length : 0;
        const cappedCompletionRate = Math.min(1.0, calculatedRate);

        return {
          date,
          dayOfWeek: parseDate(date).getDay(),
          dayName: getDayName(parseDate(date).getDay()),
          count: uniqueCompletedHabits,
          totalHabits: dayHabits.length,
          completionRate: cappedCompletionRate,
        };
      });

      // Calculate stats per habit
      const habitStats = await Promise.all(
        activeHabits.map(async (habit) => {
          // Filter completions for this habit
          const habitCompletions = monthlyCompletions.filter(
            (c) => c.habitId === habit.id
          );

          // Get dates when this habit should be active
          const activeDates = dateRange.filter(
            (date) =>
              habit.createdAt.split("T")[0] <= date &&
              (habit.repetition === "daily" ||
                (habit.repetition === "weekly" &&
                  habit.specificDays?.includes(parseDate(date).getDay())) ||
                (habit.repetition === "monthly" &&
                  habit.specificDays?.includes(parseDate(date).getDate())))
          );

          // Calculate completion rate
          const completedDates = habitCompletions
            .filter((c) => c.completed)
            .map((c) => c.date);

          return {
            habitId: habit.id,
            habitName: habit.name,
            tag: habit.tag,
            activeDaysCount: activeDates.length,
            completedDaysCount: completedDates.length,
            completionRate:
              activeDates.length > 0
                ? completedDates.length / activeDates.length
                : 0,
            currentStreak: habit.currentStreak,
            bestStreak: habit.bestStreak,
          };
        })
      );

      // Calculate day of week stats
      const dayOfWeekStats = Array.from({ length: 7 }, (_, i) => {
        const daysForThisWeekday = dailyCompletionCounts.filter(
          (d) => d.dayOfWeek === i
        );

        const totalHabits = daysForThisWeekday.reduce(
          (sum, day) => sum + day.totalHabits,
          0
        );

        const completedHabits = daysForThisWeekday.reduce(
          (sum, day) => sum + day.count,
          0
        );

        // Calculate and cap success rate at 100%
        const calculatedSuccessRate =
          totalHabits > 0 ? completedHabits / totalHabits : 0;
        const cappedSuccessRate = Math.min(1.0, calculatedSuccessRate);

        return {
          dayOfWeek: i,
          dayName: getDayName(i),
          successRate: cappedSuccessRate,
          totalHabits,
          completedHabits,
        };
      });

      // Calculate overall monthly stats
      const totalHabits = habitStats.length;
      const totalActiveDays = habitStats.reduce(
        (sum, h) => sum + h.activeDaysCount,
        0
      );

      // Count unique completed habits per day instead of total completions
      const uniqueCompletionsPerDay = dateRange.reduce((total, date) => {
        const dayCompletions = monthlyCompletions.filter(
          (c) => c.date === date && c.completed
        );
        // Count unique habit IDs completed for this date
        const uniqueCompletedHabits = new Set(
          dayCompletions.map((c) => c.habitId)
        ).size;
        return total + uniqueCompletedHabits;
      }, 0);

      // Use uniqueCompletionsPerDay as totalCompletions
      const totalCompletions = uniqueCompletionsPerDay;

      // Calculate and cap the overall completion rate at 100%
      const calculatedOverallRate =
        totalActiveDays > 0 ? uniqueCompletionsPerDay / totalActiveDays : 0;
      const overallCompletionRate = Math.min(1.0, calculatedOverallRate);

      const mostProductiveHabit =
        [...habitStats]
          .filter((h) => h.activeDaysCount > 0)
          .sort((a, b) => b.completionRate - a.completionRate)[0] || null;

      const bestStreakHabit =
        [...habitStats].sort((a, b) => b.bestStreak - a.bestStreak)[0] || null;

      // Calculate best and worst days of the month
      const bestDay =
        [...dailyCompletionCounts]
          .filter((d) => d.totalHabits > 0)
          .sort((a, b) => b.completionRate - a.completionRate)[0] || null;

      const worstDay =
        [...dailyCompletionCounts]
          .filter((d) => d.totalHabits > 0)
          .sort((a, b) => a.completionRate - b.completionRate)[0] || null;

      return {
        year: yearNum,
        month: monthNum + 1,
        monthName: getMonthName(monthNum + 1),
        startDate: startDateStr,
        endDate: endDateStr,
        dailyCompletionCounts,
        dayOfWeekStats,
        habitStats: habitStats.sort(
          (a, b) => b.completionRate - a.completionRate
        ),
        monthlyStats: {
          totalHabits,
          totalCompletions,
          overallCompletionRate,
          mostProductiveHabit: mostProductiveHabit?.habitName || null,
          bestStreakHabit: bestStreakHabit?.habitName || null,
          bestDay,
          worstDay,
        },
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Get quarter year analytics (91 days)
 * @route GET /api/analytics/quarter/:startDate
 */
export const getQuarterAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate } = req.params;

    // Validate date format
    if (!isValidDateFormat(startDate)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const cacheKey = `analytics:quarter:${startDate}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      // Calculate end date (start date + 90 days for a total of 91 days)
      const start = parseDate(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 90);
      const endDate = end.toISOString().split("T")[0];

      // Get date range for the quarter (91 days)
      const dateRange = getDatesBetween(startDate, endDate);

      // Get habits and completions
      const habits = await dataService.getHabits();
      const activeHabits = habits.filter((h) => h.isActive);
      const allCompletions = await dataService.getCompletions();

      // Filter completions within quarter range
      const quarterCompletions = allCompletions.filter(
        (c) =>
          c.date >= startDate &&
          c.date <= endDate &&
          activeHabits.some((h) => h.id === c.habitId)
      );

      // Calculate completion rate for each day
      const dailyData = dateRange.map((date) => {
        // Only count habits that were created before or on this date
        const relevantHabits = activeHabits.filter(
          (h) =>
            h.createdAt.split("T")[0] <= date &&
            (h.repetition === "daily" ||
              (h.repetition === "weekly" &&
                h.specificDays?.includes(parseDate(date).getDay())) ||
              (h.repetition === "monthly" &&
                h.specificDays?.includes(parseDate(date).getDate())))
        );

        const dayCompletions = quarterCompletions.filter(
          (c) => c.date === date
        );

        // Get unique habit IDs for this day
        const uniqueHabitIds = new Set(dayCompletions.map((c) => c.habitId));

        // Count completed habits
        const completedHabitIds = new Set(
          dayCompletions.filter((c) => c.completed).map((c) => c.habitId)
        );

        // Calculate completion rate for this date
        const completionRate =
          uniqueHabitIds.size > 0
            ? (completedHabitIds.size / uniqueHabitIds.size) * 100
            : 0;

        return {
          date,
          completionRate: Number(completionRate.toFixed(2)),
        };
      });

      return {
        startDate,
        endDate,
        totalDays: dateRange.length,
        dailyData,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);

/**
 * Clear analytics cache
 * @route POST /api/analytics/clear-cache
 */
export const clearAnalyticsCache = asyncHandler(
  async (req: Request, res: Response) => {
    analyticsCache.clear();

    res.status(200).json({
      success: true,
      message: "Analytics cache cleared successfully",
    });
  }
);

/**
 * Get analytics for all habits
 * @route GET /api/analytics/habits
 */
export const getAllHabitsAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = "30days" } = req.query;

    // Generate cache key
    const cacheKey = `analytics:habits:${period}`;

    const data = await analyticsCache.getOrSet(cacheKey, async () => {
      return analyticsService.calculateAllHabitsAnalytics(period as string);
    });

    res.status(200).json({
      success: true,
      data,
    });
  }
);
