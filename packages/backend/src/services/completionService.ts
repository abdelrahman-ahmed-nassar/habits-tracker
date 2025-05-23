import { v4 as uuidv4 } from "uuid";
import { Completion, StreakInfo } from "../../../shared/src/completions";
import { Habit, GoalType } from "../../../shared/src/habits";
import { TypedDataService } from "./typedDataService";
import { HabitService } from "./habitService";
import { AppError } from "../middlewares/errorMiddleware";
import { calculateStreakData } from "../utils/streakCalculator";
import { isHabitDueOnDate } from "../utils/streakCalculator";
import { BulkCompleteDto } from "../../../shared/src/api";

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
      value: habit.goalType === GoalType.Counter ? value || 1 : undefined,
      notes,
      timestamp: new Date().toISOString(),
    };

    return this.completionDataService.create(newCompletion);
  }

  /**
   * Remove a completion record for a habit on a specific date
   */
  async uncompleteHabit(habitId: string, date: string): Promise<void> {
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
    }

    return results;
  }

  /**
   * Calculate the completion rate for a habit
   */
  private async calculateCompletionRate(
    habit: Habit,
    completions: Completion[],
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    // Implementation details will depend on habit repetition patterns
    // For now, return a placeholder
    return completions.length > 0 ? 0.75 : 0; // Placeholder
  }

  /**
   * Calculate the start date of the current streak
   */
  private calculateStreakStartDate(
    habit: Habit,
    completions: Completion[],
    currentStreak: number
  ): string | null {
    // Implementation will depend on streak calculation logic
    // For now, return a placeholder
    if (currentStreak <= 0) return null;

    // Find the most recent completion
    const sortedCompletions = [...completions]
      .filter((c) => c.habitId === habit.id)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    if (sortedCompletions.length === 0) return null;

    // This is a placeholder - proper implementation would calculate the actual start date
    // based on the streak calculation logic
    return sortedCompletions[0].date;
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
    const dates = this.generateDateRange(startDate, endDate);

    // For each date, calculate the summary
    for (const date of dates) {
      const dateObj = new Date(date);

      // Count habits due on this date
      const dueHabits = habits.filter((h) => isHabitDueOnDate(h, dateObj));

      // Count completed habits
      const dailyCompletions = completions.filter((c) => c.date === date);
      const completedHabitIds = new Set(dailyCompletions.map((c) => c.habitId));
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
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}
