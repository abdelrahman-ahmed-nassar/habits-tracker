import { v4 as uuidv4 } from "uuid";
import { Completion, StreakInfo } from "../../../shared/src/completions";
import { Habit, GoalType, RepetitionPattern } from "../../../shared/src/habits";
import { TypedDataService } from "./typedDataService";
import { HabitService } from "./habitService";
import { AppError } from "../middlewares/errorMiddleware";
import { calculateStreakData } from "../utils/streakCalculator";
import { isHabitDueOnDate } from "../utils/streakCalculator";
import {
  formatDateString,
  getDueDatesInRange,
  isValidCompletionDate,
  getDateRange,
  isPastDate,
  isFutureDate,
  isToday,
} from "../utils/dateUtils";
import { BulkCompleteDto } from "../../../shared/src/api";
import logger from "../utils/logger";

/**
 * Service for completion-related business logic
 */
export class CompletionService {
  private completionDataService: TypedDataService<Completion>;
  private habitService: HabitService;

  /**
   * Creates a new CompletionService instance
   */
  constructor() {
    this.completionDataService = new TypedDataService<Completion>(
      "completions"
    );
    this.habitService = new HabitService();
  }

  /**
   * Mark a habit as complete for a specific date
   */
  async completeHabit(
    habitId: string,
    date: string,
    value?: number,
    notes?: string
  ): Promise<Completion> {
    // Get the habit to ensure it exists
    const habit = await this.habitService.getHabitById(habitId);

    // Validate that the completion date is valid for this habit
    if (!isValidCompletionDate(habit, date)) {
      throw new AppError(
        `Invalid completion date: ${date} is not a valid date for this habit's repetition pattern`,
        400
      );
    }

    // For counter-type habits, ensure a value is provided
    if (habit.goalType === GoalType.Counter && value === undefined) {
      // Default to 1 if no value provided
      value = 1;
    }

    // Validate value for counter-type goals
    if (habit.goalType === GoalType.Counter && value !== undefined) {
      if (value < 0) {
        throw new AppError(
          "Value must be a non-negative number for counter-type goals",
          400
        );
      }

      // Check if value exceeds the goal
      if (value > habit.goalValue) {
        logger.info(
          `Completion value ${value} exceeds goal value ${habit.goalValue} for habit ${habit.id}`
        );
        // We allow exceeding the goal, but log it
      }
    } else if (habit.goalType === GoalType.Streak && value !== undefined) {
      // For streak-type habits, ignore any provided value
      value = undefined;
    }

    // Check if completion already exists for this habit and date
    const completions = await this.completionDataService.getAll();
    const existingCompletion = completions.find(
      (c) => c.habitId === habitId && c.date === date
    );

    if (existingCompletion) {
      // Update the existing completion
      return this.completionDataService.update(existingCompletion.id, {
        completed: true,
        value: value !== undefined ? value : existingCompletion.value,
        notes: notes !== undefined ? notes : existingCompletion.notes,
        timestamp: new Date().toISOString(),
      });
    }

    // Create a new completion record
    const newCompletion: Completion = {
      id: uuidv4(),
      habitId,
      date,
      completed: true,
      value: habit.goalType === GoalType.Counter ? value : undefined,
      notes,
      timestamp: new Date().toISOString(),
    };

    return this.completionDataService.create(newCompletion);
  }

  /**
   * Remove a completion record for a habit on a specific date
   */
  async uncompleteHabit(habitId: string, date: string): Promise<void> {
    // Get the habit to ensure it exists
    await this.habitService.getHabitById(habitId);

    const completions = await this.completionDataService.getAll();
    const existingCompletion = completions.find(
      (c) => c.habitId === habitId && c.date === date
    );

    if (!existingCompletion) {
      throw new AppError(
        `No completion record found for habit ${habitId} on date ${date}`,
        404
      );
    }

    await this.completionDataService.delete(existingCompletion.id);
  }

  /**
   * Get completion history for a specific habit with optional date filtering
   */
  async getHabitCompletionHistory(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    completions: Completion[];
    statistics: {
      totalCompletions: number;
      completionRate: number;
      streakData: StreakInfo;
    };
  }> {
    // Get all completions for this habit
    const allCompletions = await this.completionDataService.getAll();
    let habitCompletions = allCompletions.filter((c) => c.habitId === habitId);

    // Apply date filters if provided
    if (startDate) {
      habitCompletions = habitCompletions.filter((c) => c.date >= startDate);
    }

    if (endDate) {
      habitCompletions = habitCompletions.filter((c) => c.date <= endDate);
    }

    // Sort by date (newest first)
    habitCompletions.sort((a, b) => (a.date > b.date ? -1 : 1));

    // Get the habit
    const habit = await this.habitService.getHabitById(habitId);

    // Calculate streak data and completion rate
    const {
      currentStreak,
      longestStreak,
      totalCompletions,
      lastCompletionDate,
    } = calculateStreakData(habit, allCompletions); // Use all completions for accurate streak calculation

    // Calculate completion rate (number of days completed / number of days the habit was due)
    const completionRate = await this.calculateCompletionRate(
      habit,
      habitCompletions,
      startDate,
      endDate
    );

    // Build streak info object
    const streakData: StreakInfo = {
      habitId,
      currentStreak,
      longestStreak,
      lastCompletedDate: lastCompletionDate || null,
      currentStreakStartDate: this.calculateStreakStartDate(
        habit,
        allCompletions,
        currentStreak
      ),
    };

    return {
      completions: habitCompletions,
      statistics: {
        totalCompletions,
        completionRate,
        streakData,
      },
    };
  }

  /**
   * Get all completions for a specific date
   */
  async getDailyCompletions(date: string): Promise<{
    completions: Completion[];
    summary: {
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
  }> {
    // Get all habits
    const habits = await this.habitService.getAllHabits();
    const activeHabits = habits.filter((h) => !h.archived);

    // Get completions for this date
    const allCompletions = await this.completionDataService.getAll();
    const dailyCompletions = allCompletions.filter((c) => c.date === date);

    // Count habits due on this date
    const dateObj = new Date(date);
    const dueHabits = activeHabits.filter((h) => isHabitDueOnDate(h, dateObj));

    // Count completed habits
    const completedHabitIds = new Set(dailyCompletions.map((c) => c.habitId));
    const completedHabits = dueHabits.filter((h) =>
      completedHabitIds.has(h.id)
    ).length;

    // Calculate completion rate
    const completionRate =
      dueHabits.length > 0 ? completedHabits / dueHabits.length : 0;

    return {
      completions: dailyCompletions,
      summary: {
        totalHabits: dueHabits.length,
        completedHabits,
        completionRate,
      },
    };
  }

  /**
   * Get completions for a date range
   */
  async getCompletionsInRange(
    startDate: string,
    endDate: string
  ): Promise<{
    completions: Completion[];
    dailySummaries: {
      date: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    }[];
    aggregateStats: {
      totalHabits: number;
      totalCompletions: number;
      averageCompletionRate: number;
    };
  }> {
    // Get all habits
    const habits = await this.habitService.getAllHabits();
    const activeHabits = habits.filter((h) => !h.archived);

    // Get completions for the date range
    const allCompletions = await this.completionDataService.getAll();
    const rangeCompletions = allCompletions.filter(
      (c) => c.date >= startDate && c.date <= endDate
    );

    // Calculate daily summaries
    const dailySummaries = await this.generateDailySummaries(
      activeHabits,
      rangeCompletions,
      startDate,
      endDate
    );

    // Calculate aggregate statistics
    const totalHabits = activeHabits.length;
    const totalCompletions = rangeCompletions.length;

    // Calculate average completion rate
    const totalRate = dailySummaries.reduce(
      (sum, day) => sum + day.completionRate,
      0
    );
    const averageCompletionRate =
      dailySummaries.length > 0 ? totalRate / dailySummaries.length : 0;

    return {
      completions: rangeCompletions,
      dailySummaries,
      aggregateStats: {
        totalHabits,
        totalCompletions,
        averageCompletionRate,
      },
    };
  }

  /**
   * Mark multiple habits complete in a single request
   */
  async bulkCompleteHabits(bulkData: BulkCompleteDto[]): Promise<Completion[]> {
    const results: Completion[] = [];

    // Process each completion request
    for (const item of bulkData) {
      try {
        if (item.completed === false) {
          // Handle uncompleting the habit
          try {
            await this.uncompleteHabit(item.habitId, item.date);
          } catch (error) {
            // Skip if not found, otherwise throw
            if (!(error instanceof AppError) || error.statusCode !== 404) {
              throw error;
            }
          }
        } else {
          // Handle completing the habit
          const completion = await this.completeHabit(
            item.habitId,
            item.date,
            item.value,
            item.notes
          );
          results.push(completion);
        }
      } catch (error) {
        // Log the error but continue processing other items
        logger.error(
          `Error processing completion for habit ${item.habitId} on date ${item.date}:`,
          error
        );

        // If it's an AppError, rethrow it to be handled by the controller
        if (error instanceof AppError) {
          throw error;
        }

        // For other errors, create a generic AppError
        throw new AppError(
          `Failed to process completion for habit ${item.habitId}`,
          500
        );
      }
    }

    return results;
  }

  /**
   * Calculate the completion rate for a habit
   * This is the number of completed days divided by the number of days the habit was due
   */
  private async calculateCompletionRate(
    habit: Habit,
    completions: Completion[],
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    // Default to last 30 days if no date range specified
    const now = new Date();
    const defaultEndDate = formatDateString(now);
    const defaultStartDate = formatDateString(
      new Date(now.setDate(now.getDate() - 30))
    );

    const effectiveStartDate = startDate || defaultStartDate;
    const effectiveEndDate = endDate || defaultEndDate;

    // Get all dates when the habit was due in this range
    const dueDates = getDueDatesInRange(
      habit,
      effectiveStartDate,
      effectiveEndDate
    );

    if (dueDates.length === 0) {
      return 0; // No days when the habit was due
    }

    // Count completions on days when the habit was due
    const completionMap = new Map<string, Completion>();
    completions.forEach((completion) => {
      completionMap.set(completion.date, completion);
    });

    // Count days that were completed
    let completedDays = 0;

    for (const dueDate of dueDates) {
      const completion = completionMap.get(dueDate);

      if (completion && completion.completed) {
        // For counter-type habits, check if the goal was met
        if (habit.goalType === GoalType.Counter) {
          if ((completion.value || 0) >= habit.goalValue) {
            completedDays++;
          }
        } else {
          // For streak-type habits, any completion counts
          completedDays++;
        }
      }
    }

    return completedDays / dueDates.length;
  }

  /**
   * Calculate the start date of the current streak
   */
  private calculateStreakStartDate(
    habit: Habit,
    completions: Completion[],
    currentStreak: number
  ): string | null {
    // If there's no streak, return null
    if (currentStreak <= 0) return null;

    // Get only the completed records
    const completedRecords = completions.filter(
      (c) => c.habitId === habit.id && c.completed
    );

    // If no completions, return null
    if (completedRecords.length === 0) return null;

    // Sort completions by date (most recent first)
    completedRecords.sort((a, b) =>
      new Date(b.date) > new Date(a.date) ? 1 : -1
    );

    // For streak-type habits, we need to find consecutive days
    if (habit.goalType === GoalType.Streak) {
      const today = formatDateString(new Date());
      let lastDate: Date | null = null;
      let streakCount = 0;
      let streakStartDate: string | null = null;

      // Determine if today is already counted in the streak
      const todayCompleted = completedRecords.some((c) => c.date === today);

      // Process completions from newest to oldest
      for (let i = 0; i < completedRecords.length; i++) {
        const completion = completedRecords[i];
        const completionDate = new Date(completion.date);

        // Skip future dates
        if (isFutureDate(completion.date)) continue;

        // Initialize the streak with the first valid completion
        if (lastDate === null) {
          lastDate = completionDate;
          streakCount = 1;
          streakStartDate = completion.date;
          continue;
        }

        // Check if dates are consecutive based on repetition pattern
        const isConsecutive = this.areDatesConsecutive(
          habit,
          formatDateString(lastDate),
          completion.date
        );

        if (isConsecutive) {
          streakCount++;
          streakStartDate = completion.date;

          // If we've found all days in the streak, we're done
          if (streakCount >= currentStreak) {
            break;
          }
        } else {
          // Break the streak
          break;
        }

        lastDate = completionDate;
      }

      return streakStartDate;
    }
    // For counter-type goals, the streak concept is different
    else {
      // Find the most recent completed date
      const mostRecentCompletion = completedRecords[0];

      // For counter goals, streak starts at the oldest date within the streak
      // that still contributes to the current streak
      const today = new Date();
      let date = new Date(mostRecentCompletion.date);
      let streakStartDate = mostRecentCompletion.date;

      // Go back currentStreak - 1 periods based on repetition pattern
      for (let i = 1; i < currentStreak; i++) {
        let previousDate: Date | null = null;

        if (habit.repetition === RepetitionPattern.Daily) {
          previousDate = new Date(date);
          previousDate.setDate(date.getDate() - 1);
        } else if (habit.repetition === RepetitionPattern.Weekly) {
          previousDate = new Date(date);
          previousDate.setDate(date.getDate() - 7);
        } else if (habit.repetition === RepetitionPattern.Monthly) {
          previousDate = new Date(date);
          previousDate.setMonth(date.getMonth() - 1);
        }

        if (previousDate) {
          const previousDateStr = formatDateString(previousDate);
          // Check if this date has a completion
          const hasCompletion = completedRecords.some(
            (c) => c.date === previousDateStr
          );

          if (hasCompletion) {
            streakStartDate = previousDateStr;
            date = previousDate;
          } else {
            // Break if we find a date without completion
            break;
          }
        }
      }

      return streakStartDate;
    }
  }

  /**
   * Check if two dates are consecutive for a given habit's repetition pattern
   */
  private areDatesConsecutive(
    habit: Habit,
    date1: string,
    date2: string
  ): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Ensure dates are in the correct order
    let firstDate = d1;
    let secondDate = d2;

    if (firstDate < secondDate) {
      firstDate = d2;
      secondDate = d1;
    }

    // For daily habits, check if days are consecutive
    if (habit.repetition === RepetitionPattern.Daily) {
      const daysDiff = Math.round(
        (firstDate.getTime() - secondDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff === 1;
    }
    // For weekly habits
    else if (habit.repetition === RepetitionPattern.Weekly) {
      // If specific days are set, check if these are consecutive "due" days
      if (habit.specificDays && habit.specificDays.length > 0) {
        // Get all dates between d2 and d1 where the habit is due
        const dateRange = getDateRange(date2, date1);
        const dueDates = dateRange.filter((dateStr) => {
          const date = new Date(dateStr);
          return isHabitDueOnDate(habit, date);
        });

        // Remove the first date from the range (as it's date2)
        if (dueDates.length > 0 && dueDates[0] === date2) {
          dueDates.shift();
        }

        // If there are no due dates between d2 and d1 exclusive, then they are consecutive
        return dueDates.length === 0;
      }
      // Otherwise, check if they're consecutive weeks
      else {
        const weeksDiff = Math.round(
          (firstDate.getTime() - secondDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
        return weeksDiff === 1;
      }
    }
    // For monthly habits
    else if (habit.repetition === RepetitionPattern.Monthly) {
      // If specific dates are set, check if these are consecutive due days
      if (habit.specificDates && habit.specificDates.length > 0) {
        const dateRange = getDateRange(date2, date1);
        const dueDates = dateRange.filter((dateStr) => {
          const date = new Date(dateStr);
          return isHabitDueOnDate(habit, date);
        });

        if (dueDates.length > 0 && dueDates[0] === date2) {
          dueDates.shift();
        }

        return dueDates.length === 0;
      }
      // Otherwise, check if they're consecutive months
      else {
        const monthsDiff =
          (firstDate.getFullYear() - secondDate.getFullYear()) * 12 +
          (firstDate.getMonth() - secondDate.getMonth());
        return monthsDiff === 1;
      }
    }

    return false;
  }

  /**
   * Generate daily summaries for a date range
   */
  private async generateDailySummaries(
    habits: Habit[],
    completions: Completion[],
    startDate: string,
    endDate: string
  ): Promise<
    {
      date: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    }[]
  > {
    const dailySummaries: {
      date: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    }[] = [];

    // Generate array of dates between startDate and endDate
    const dates = getDateRange(startDate, endDate);

    // For each date, calculate the summary
    for (const date of dates) {
      const dateObj = new Date(date);

      // Count habits due on this date
      const dueHabits = habits.filter((h) => isHabitDueOnDate(h, dateObj));

      // Count completed habits
      const dailyCompletions = completions.filter(
        (c) => c.date === date && c.completed
      );

      // For counter-type habits, only count as completed if the goal value is met
      const completedHabitIds = new Set();

      for (const completion of dailyCompletions) {
        const habit = dueHabits.find((h) => h.id === completion.habitId);

        if (habit) {
          if (habit.goalType === GoalType.Counter) {
            if ((completion.value || 0) >= habit.goalValue) {
              completedHabitIds.add(habit.id);
            }
          } else {
            completedHabitIds.add(habit.id);
          }
        }
      }

      const completedHabits = dueHabits.filter((h) =>
        completedHabitIds.has(h.id)
      ).length;

      // Calculate completion rate
      const completionRate =
        dueHabits.length > 0 ? completedHabits / dueHabits.length : 0;

      dailySummaries.push({
        date,
        totalHabits: dueHabits.length,
        completedHabits,
        completionRate,
      });
    }

    return dailySummaries;
  }

  /**
   * Generate an array of date strings between startDate and endDate
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    return getDateRange(startDate, endDate);
  }
}
