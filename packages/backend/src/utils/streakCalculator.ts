import { Habit, RepetitionPattern } from "../../../shared/src/habits";
import { Completion } from "../../../shared/src/completions";

export interface StreakData {
  /**
   * Current streak count (consecutive completions)
   */
  currentStreak: number;

  /**
   * Longest streak ever achieved
   */
  longestStreak: number;

  /**
   * Total number of completions
   */
  totalCompletions: number;

  /**
   * Date the habit was last completed (ISO string)
   */
  lastCompletionDate?: string;

  /**
   * Whether the habit is due today
   */
  isDueToday: boolean;
}

/**
 * Calculate the streak data for a habit based on its completions
 *
 * @param habit The habit to calculate streaks for
 * @param completions Array of completions for the habit
 * @returns StreakData containing streak information
 */
export function calculateStreakData(
  habit: Habit,
  completions: Completion[]
): StreakData {
  // Filter completions for this specific habit
  const habitCompletions = completions.filter(
    (completion) => completion.habitId === habit.id
  );

  // Sort completions by date (most recent first)
  habitCompletions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get today's date for comparison (normalized to start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get yesterday's date for checking streak continuity
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Count total completions
  const totalCompletions = habitCompletions.length;

  // Get last completion date if any
  const lastCompletionDate =
    habitCompletions.length > 0 ? habitCompletions[0].date : undefined;

  // Initialize streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Determine if habit is due today
  const isDueToday = isHabitDueOnDate(habit, today);

  // Group completions by period (needed for both daily and non-daily calculations)
  const completionsByPeriod = habitCompletions.reduce((acc, completion) => {
    const completionDate = new Date(completion.date);
    const periodKey = getPeriodKey(habit.repetition, completionDate);

    if (!acc[periodKey]) {
      acc[periodKey] = [];
    }

    acc[periodKey].push(completion);
    return acc;
  }, {} as Record<string, Completion[]>);

  // Simple case for daily habits
  if (habit.repetition === RepetitionPattern.Daily) {
    // Check each date from today back
    const checkDate = new Date(today);
    let streakBroken = false;

    while (!streakBroken) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const completedOnDate = habitCompletions.some(
        (c) => c.date.split("T")[0] === dateStr
      );

      if (completedOnDate) {
        currentStreak++;
      } else {
        // If we've checked today and it's not completed yet,
        // it doesn't break the streak
        if (checkDate.getTime() === today.getTime() && isDueToday) {
          // Today is not completed yet but doesn't break the streak
        } else {
          streakBroken = true;
        }
      }

      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }
  // For weekly and monthly habits, we need to check if the habit was completed
  // during each period it was due
  else {
    // Get all unique periods (weeks or months) where the habit was due
    const periods = getHabitPeriods(habit);

    // Calculate current streak
    let streakBroken = false;

    // Process periods from most recent to oldest
    for (let i = periods.length - 1; i >= 0; i--) {
      const period = periods[i];

      // If period is in the future, skip it
      if (new Date(period.startDate).getTime() > today.getTime()) {
        continue;
      }

      // Period hasn't ended yet and it's the current period
      if (new Date(period.endDate).getTime() >= today.getTime()) {
        // If we have completions in this period or it's today, increment streak
        if (completionsByPeriod[period.key]?.length > 0) {
          currentStreak++;
        }
        // Otherwise don't count it as breaking the streak if due today
        else if (isDueToday) {
          // Don't break streak for today if it's not completed yet
        } else {
          streakBroken = true;
        }
      }
      // Past periods
      else {
        // If we have completions in this period, increment streak
        if (completionsByPeriod[period.key]?.length > 0 && !streakBroken) {
          currentStreak++;
        } else {
          streakBroken = true;
        }
      }
    }
  }

  // Calculate longest streak from historical data
  const dateCompletions = new Set<string>(
    habitCompletions.map((c) => c.date.split("T")[0])
  );

  if (habit.repetition === RepetitionPattern.Daily) {
    // Sort dates for streak calculation
    const sortedDates = Array.from(dateCompletions).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);

      if (i > 0) {
        const prevDate = new Date(sortedDates[i - 1]);
        prevDate.setDate(prevDate.getDate() + 1);

        // If dates are consecutive, increment temp streak
        if (currentDate.getTime() === prevDate.getTime()) {
          tempStreak++;
        } else {
          // Streak broken, reset
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      // Update longest streak
      longestStreak = Math.max(longestStreak, tempStreak);
    }
  } else {
    // For weekly and monthly, count by periods
    const completedPeriods = Object.keys(completionsByPeriod)
      .filter((key) => completionsByPeriod[key].length > 0)
      .sort();

    for (let i = 0; i < completedPeriods.length; i++) {
      if (i > 0) {
        // Check if periods are consecutive
        const [prevType, prevValue] = completedPeriods[i - 1].split("-");
        const [currType, currValue] = completedPeriods[i].split("-");

        if (habit.repetition === RepetitionPattern.Weekly) {
          const prevWeek = parseInt(prevValue);
          const currWeek = parseInt(currValue);

          // Check if weeks are consecutive
          if (
            currWeek - prevWeek === 1 ||
            (prevWeek === 52 && currWeek === 1)
          ) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          const prevMonth = parseInt(prevValue.split("-")[1]);
          const prevYear = parseInt(prevValue.split("-")[0]);
          const currMonth = parseInt(currValue.split("-")[1]);
          const currYear = parseInt(currValue.split("-")[0]);

          // Check if months are consecutive
          if (
            (currMonth - prevMonth === 1 && currYear === prevYear) ||
            (prevMonth === 12 && currMonth === 1 && currYear - prevYear === 1)
          ) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
      } else {
        tempStreak = 1;
      }

      // Update longest streak
      longestStreak = Math.max(longestStreak, tempStreak);
    }
  }

  // Make sure longest streak is at least as big as current streak
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    lastCompletionDate,
    isDueToday,
  };
}

/**
 * Check if a habit is due on a specific date
 *
 * @param habit The habit to check
 * @param date The date to check against
 * @returns Boolean indicating if habit is due on the specified date
 */
export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  // Check if habit has start/end dates and if the date falls outside that range
  if (habit.startDate && new Date(habit.startDate) > date) {
    return false;
  }

  if (habit.endDate && new Date(habit.endDate) < date) {
    return false;
  }

  // Check based on repetition pattern
  switch (habit.repetition) {
    case RepetitionPattern.Daily:
      return true;

    case RepetitionPattern.Weekly:
      // Check if the day of week is in specificDays
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      return habit.specificDays?.includes(dayOfWeek) ?? false;

    case RepetitionPattern.Monthly:
      // Check if the date is in specificDates
      const dayOfMonth = date.getDate(); // 1-31
      return habit.specificDates?.includes(dayOfMonth) ?? false;

    default:
      return false;
  }
}

/**
 * Get a unique key for a period based on repetition pattern
 */
function getPeriodKey(
  repetitionPattern: RepetitionPattern,
  date: Date
): string {
  if (repetitionPattern === RepetitionPattern.Weekly) {
    // Get week number and year
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );
    return `week-${weekNumber}-${date.getFullYear()}`;
  } else if (repetitionPattern === RepetitionPattern.Monthly) {
    // Get month and year
    return `month-${date.getFullYear()}-${date.getMonth() + 1}`;
  } else {
    // Daily - use the date itself
    return `day-${date.toISOString().split("T")[0]}`;
  }
}

interface Period {
  key: string;
  startDate: string;
  endDate: string;
}

/**
 * Get all periods (weeks or months) where a habit was due,
 * from the start date to today
 */
function getHabitPeriods(habit: Habit): Period[] {
  const periods: Period[] = [];
  const today = new Date();

  // Default start date to habit creation date if not specified
  const startDate = habit.startDate
    ? new Date(habit.startDate)
    : new Date(habit.createdAt);

  // Set end date to either habit end date or today
  const endDate =
    habit.endDate && new Date(habit.endDate) < today
      ? new Date(habit.endDate)
      : today;

  if (habit.repetition === RepetitionPattern.Weekly) {
    // Generate all weeks from start to end
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Get first day of the week (Sunday)
      const firstDay = new Date(currentDate);
      const day = firstDay.getDay();
      firstDay.setDate(firstDay.getDate() - day);

      // Get last day of the week (Saturday)
      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);

      // Create period
      const periodKey = getPeriodKey(RepetitionPattern.Weekly, currentDate);
      periods.push({
        key: periodKey,
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (habit.repetition === RepetitionPattern.Monthly) {
    // Generate all months from start to end
    const currentDate = new Date(startDate);
    currentDate.setDate(1); // Set to first day of month

    while (currentDate <= endDate) {
      // Get first day of the month
      const firstDay = new Date(currentDate);

      // Get last day of the month
      const lastDay = new Date(currentDate);
      lastDay.setMonth(lastDay.getMonth() + 1);
      lastDay.setDate(0);

      // Create period
      const periodKey = getPeriodKey(RepetitionPattern.Monthly, currentDate);
      periods.push({
        key: periodKey,
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return periods;
}
