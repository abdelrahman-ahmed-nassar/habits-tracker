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

  // Create a set of completion dates for faster lookup
  const completionDates = new Set<string>(
    habitCompletions.map((c) => c.date.split("T")[0])
  );

  // For daily habits
  if (habit.repetition === RepetitionPattern.Daily) {
    // Calculate current streak - check consecutive days backward from today
    const checkDate = new Date(today);
    let streakBroken = false;

    while (!streakBroken) {
      // Format as YYYY-MM-DD
      const dateStr = checkDate.toISOString().split("T")[0];

      if (completionDates.has(dateStr)) {
        // This day was completed, increment streak
        currentStreak++;
      } else {
        // If it's today and habit is due, don't break the streak yet
        if (checkDate.getTime() === today.getTime() && isDueToday) {
          // Today is not completed yet
        } else {
          // Any other day without completion breaks the streak
          streakBroken = true;
        }
      }

      // Go to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak by finding consecutive dates in history
    if (habitCompletions.length > 0) {
      // Sort dates for streak calculation (oldest to newest)
      const sortedDates = Array.from(completionDates).sort();

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const currentDate = new Date(sortedDates[i]);
          const prevDate = new Date(sortedDates[i - 1]);

          // Check if dates are consecutive
          const nextExpectedDate = new Date(prevDate);
          nextExpectedDate.setDate(nextExpectedDate.getDate() + 1);

          if (currentDate.getTime() === nextExpectedDate.getTime()) {
            // Consecutive date, continue the streak
            tempStreak++;
          } else {
            // Non-consecutive, reset streak
            tempStreak = 1;
          }
        }

        // Update longest streak
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }
  }
  // For weekly and monthly habits
  else {
    // Group completions by period
    const completionsByPeriod = habitCompletions.reduce((acc, completion) => {
      const completionDate = new Date(completion.date);
      const periodKey = getPeriodKey(habit.repetition, completionDate);

      if (!acc[periodKey]) {
        acc[periodKey] = [];
      }

      acc[periodKey].push(completion);
      return acc;
    }, {} as Record<string, Completion[]>);

    // Get all unique periods where the habit was due
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

      // Current period that hasn't ended yet
      if (new Date(period.endDate).getTime() >= today.getTime()) {
        // If we have completions in this period, increment streak
        if (completionsByPeriod[period.key]?.length > 0) {
          currentStreak++;
        }
        // Otherwise don't count it as breaking the streak if it's due today
        else if (isDueToday) {
          // Don't break streak for current period if it's not completed yet
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

    // Calculate longest streak from historical data
    const completedPeriods = Object.keys(completionsByPeriod)
      .filter((key) => completionsByPeriod[key].length > 0)
      .sort();

    for (let i = 0; i < completedPeriods.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
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
        } else if (habit.repetition === RepetitionPattern.Monthly) {
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
 * @returns true if the habit is due on the date
 */
export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dayOfMonth = date.getDate(); // 1-31

  switch (habit.repetition) {
    case RepetitionPattern.Daily:
      return true;
    case RepetitionPattern.Weekly:
      // Check if the current day of the week is in the specific days
      return habit.specificDays?.includes(dayOfWeek) || false;
    case RepetitionPattern.Monthly:
      // Check if the current day of the month is in the specific dates
      return habit.specificDates?.includes(dayOfMonth) || false;
    default:
      return false;
  }
}

/**
 * Get a standardized period key for a date based on the repetition pattern
 *
 * @param repetitionPattern The repetition pattern (weekly, monthly)
 * @param date The date to get the period key for
 * @returns A string key representing the period
 */
function getPeriodKey(
  repetitionPattern: RepetitionPattern,
  date: Date
): string {
  switch (repetitionPattern) {
    case RepetitionPattern.Daily:
      // For daily habits, we use the date itself (YYYY-MM-DD)
      return date.toISOString().split("T")[0];
    case RepetitionPattern.Weekly:
      // For weekly habits, we use the ISO week number
      const year = date.getFullYear();
      const weekNum = getWeekNumber(date);
      return `week-${weekNum}`;
    case RepetitionPattern.Monthly:
      // For monthly habits, we use the year and month (YYYY-MM)
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      return `month-${date.getFullYear()}-${month.toString().padStart(2, "0")}`;
    default:
      return date.toISOString().split("T")[0];
  }
}

/**
 * Get the ISO week number for a date
 *
 * @param date The date to get the week number for
 * @returns The ISO week number (1-53)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Represents a time period for a habit
 */
interface Period {
  key: string;
  startDate: string;
  endDate: string;
}

/**
 * Get all periods (weeks or months) where a habit is due
 *
 * @param habit The habit to get periods for
 * @returns Array of periods
 */
function getHabitPeriods(habit: Habit): Period[] {
  const periods: Period[] = [];
  const today = new Date();

  // For weekly habits
  if (habit.repetition === RepetitionPattern.Weekly) {
    // Get periods for the last 12 weeks (~ 3 months)
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to Sunday

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Set to Saturday

      const periodKey = `week-${getWeekNumber(weekStart)}`;

      periods.push({
        key: periodKey,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      });
    }
  }
  // For monthly habits
  else if (habit.repetition === RepetitionPattern.Monthly) {
    // Get periods for the last 12 months
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

      const month = monthStart.getMonth() + 1; // getMonth() returns 0-11
      const periodKey = `month-${monthStart.getFullYear()}-${month
        .toString()
        .padStart(2, "0")}`;

      periods.push({
        key: periodKey,
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      });
    }
  }

  return periods;
}
