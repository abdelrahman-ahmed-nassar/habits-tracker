import { v4 as uuidv4 } from "uuid";
import {
  Habit,
  HabitTag,
  RepetitionPattern,
  GoalType,
  HabitFilter,
  isHabit,
} from "../../../shared/src/habits";
import { Completion } from "../../../shared/src/completions";
import { TypedDataService } from "./typedDataService";
import { AppError } from "../middlewares/errorMiddleware";
import {
  calculateStreakData,
  StreakData,
  isHabitDueOnDate,
} from "../utils/streakCalculator";
import logger from "../utils/logger";

/**
 * Extended habit with streak information
 */
export interface HabitWithStreak extends Habit {
  streak: StreakData;
}

/**
 * Service for habit-related business logic
 */
export class HabitService {
  private habitDataService: TypedDataService<Habit>;
  private completionDataService: TypedDataService<Completion>;

  /**
   * Creates a new HabitService instance
   */
  constructor() {
    this.habitDataService = new TypedDataService<Habit>("habits", isHabit);
    this.completionDataService = new TypedDataService<Completion>(
      "completions"
    );
  }

  /**
   * Get all habits with optional filtering and streak information
   *
   * @param filter Optional filter criteria
   * @returns Array of habits with streak information
   */
  async getAllHabits(filter?: HabitFilter): Promise<HabitWithStreak[]> {
    // Get all habits
    const habits = await this.habitDataService.getAll();

    // Get all completions for calculating streaks
    const completions = await this.completionDataService.getAll();

    // Filter and add streak information
    let filteredHabits = [...habits];

    // Apply filters if any
    if (filter) {
      if (filter.tags?.length) {
        filteredHabits = filteredHabits.filter((habit) =>
          filter.tags!.includes(habit.tag)
        );
      }

      if (filter.repetition) {
        filteredHabits = filteredHabits.filter(
          (habit) => habit.repetition === filter.repetition
        );
      }

      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredHabits = filteredHabits.filter(
          (habit) =>
            habit.name.toLowerCase().includes(searchTerm) ||
            (habit.description &&
              habit.description.toLowerCase().includes(searchTerm))
        );
      }

      // By default, don't include archived habits unless specifically requested
      if (!filter.includeArchived) {
        filteredHabits = filteredHabits.filter((habit) => !habit.archived);
      }
    } else {
      // Default to not showing archived habits
      filteredHabits = filteredHabits.filter((habit) => !habit.archived);
    }

    // Sort habits by createdAt date, newest first
    filteredHabits.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Add streak data to each habit
    return filteredHabits.map((habit) => {
      const streak = calculateStreakData(habit, completions);
      return { ...habit, streak };
    });
  }

  /**
   * Get a habit by ID with streak information
   *
   * @param id Habit ID
   * @returns Habit with streak information
   */
  async getHabitById(id: string): Promise<HabitWithStreak> {
    const habit = await this.habitDataService.getById(id);
    const completions = await this.completionDataService.getAll();
    const streak = calculateStreakData(habit, completions);

    return { ...habit, streak };
  }

  /**
   * Create a new habit
   *
   * @param habitData Habit data without ID, createdAt, updatedAt
   * @returns The created habit with streak information
   */
  async createHabit(
    habitData: Omit<Habit, "id" | "createdAt" | "updatedAt" | "archived">
  ): Promise<HabitWithStreak> {
    // Validate specific days for weekly habits
    if (
      habitData.repetition === RepetitionPattern.Weekly &&
      (!habitData.specificDays || habitData.specificDays.length === 0)
    ) {
      throw new AppError("Weekly habits require specific days to be set", 400);
    }

    // Validate specific dates for monthly habits
    if (
      habitData.repetition === RepetitionPattern.Monthly &&
      (!habitData.specificDates || habitData.specificDates.length === 0)
    ) {
      throw new AppError(
        "Monthly habits require specific dates to be set",
        400
      );
    }

    // Validate specific days values (0-6)
    if (habitData.specificDays) {
      const invalidDays = habitData.specificDays.filter(
        (day) => day < 0 || day > 6
      );
      if (invalidDays.length > 0) {
        throw new AppError(
          "Specific days must be between 0 (Sunday) and 6 (Saturday)",
          400
        );
      }
    }

    // Validate specific dates values (1-31)
    if (habitData.specificDates) {
      const invalidDates = habitData.specificDates.filter(
        (date) => date < 1 || date > 31
      );
      if (invalidDates.length > 0) {
        throw new AppError("Specific dates must be between 1 and 31", 400);
      }
    }

    // Generate UUID for new habit
    const id = uuidv4();

    // Set timestamps
    const now = new Date().toISOString();

    // Create complete habit object
    const newHabit: Habit = {
      ...habitData,
      id,
      createdAt: now,
      updatedAt: now,
      archived: false,
    };

    // Save to data service
    const createdHabit = await this.habitDataService.create(newHabit);

    // Return with streak info (which will be empty for new habits)
    const completions = await this.completionDataService.getAll();
    const streak = calculateStreakData(createdHabit, completions);

    return { ...createdHabit, streak };
  }

  /**
   * Update an existing habit
   *
   * @param id Habit ID
   * @param habitData Partial habit data to update
   * @returns The updated habit with streak information
   */
  async updateHabit(
    id: string,
    habitData: Partial<Habit>
  ): Promise<HabitWithStreak> {
    // Get existing habit to ensure it exists
    const existingHabit = await this.habitDataService.getById(id);

    // Validate repetition pattern change consistency
    if (habitData.repetition) {
      // Handle repetition change consistency with specific days/dates
      if (
        habitData.repetition === RepetitionPattern.Weekly &&
        !habitData.specificDays &&
        !existingHabit.specificDays
      ) {
        throw new AppError(
          "Weekly habits require specific days to be set",
          400
        );
      }

      if (
        habitData.repetition === RepetitionPattern.Monthly &&
        !habitData.specificDates &&
        !existingHabit.specificDates
      ) {
        throw new AppError(
          "Monthly habits require specific dates to be set",
          400
        );
      }
    }

    // Validate specific days values if provided
    if (habitData.specificDays) {
      const invalidDays = habitData.specificDays.filter(
        (day) => day < 0 || day > 6
      );
      if (invalidDays.length > 0) {
        throw new AppError(
          "Specific days must be between 0 (Sunday) and 6 (Saturday)",
          400
        );
      }
    }

    // Validate specific dates values if provided
    if (habitData.specificDates) {
      const invalidDates = habitData.specificDates.filter(
        (date) => date < 1 || date > 31
      );
      if (invalidDates.length > 0) {
        throw new AppError("Specific dates must be between 1 and 31", 400);
      }
    }

    // Update timestamp
    const updatedData = {
      ...habitData,
      updatedAt: new Date().toISOString(),
    };

    // Update via data service
    const updatedHabit = await this.habitDataService.update(id, updatedData);

    // Return with streak information
    const completions = await this.completionDataService.getAll();
    const streak = calculateStreakData(updatedHabit, completions);

    return { ...updatedHabit, streak };
  }

  /**
   * Delete a habit (hard delete)
   *
   * @param id Habit ID
   * @param deleteCompletions Whether to also delete habit completions
   */
  async deleteHabit(
    id: string,
    deleteCompletions: boolean = false
  ): Promise<void> {
    // Get habit to confirm it exists
    await this.habitDataService.getById(id);

    // Delete completions if requested
    if (deleteCompletions) {
      // Get all completions
      const allCompletions = await this.completionDataService.getAll();

      // Filter completions for this habit
      const habitCompletions = allCompletions.filter((c) => c.habitId === id);

      // Delete each completion
      for (const completion of habitCompletions) {
        try {
          // Delete by the completion ID, not the habit ID
          await this.completionDataService.delete(completion.id);
        } catch (error) {
          logger.error(`Failed to delete completion ${completion.id}:`, error);
          // Continue with other deletions
        }
      }
    }

    // Delete the habit
    await this.habitDataService.delete(id);
  }

  /**
   * Archive a habit (soft delete)
   *
   * @param id Habit ID
   * @returns The archived habit with streak information
   */
  async archiveHabit(id: string): Promise<HabitWithStreak> {
    // Get existing habit
    const existingHabit = await this.habitDataService.getById(id);

    // Update with archived status
    const updatedHabit = await this.habitDataService.update(id, {
      archived: true,
      updatedAt: new Date().toISOString(),
    });

    // Return with streak information
    const completions = await this.completionDataService.getAll();
    const streak = calculateStreakData(updatedHabit, completions);

    return { ...updatedHabit, streak };
  }

  /**
   * Restore an archived habit
   *
   * @param id Habit ID
   * @returns The restored habit with streak information
   */
  async restoreHabit(id: string): Promise<HabitWithStreak> {
    // Get existing habit
    const existingHabit = await this.habitDataService.getById(id);

    // If not archived, no need to restore
    if (!existingHabit.archived) {
      throw new AppError("Habit is not archived", 400);
    }

    // Update with active status
    const updatedHabit = await this.habitDataService.update(id, {
      archived: false,
      updatedAt: new Date().toISOString(),
    });

    // Return with streak information
    const completions = await this.completionDataService.getAll();
    const streak = calculateStreakData(updatedHabit, completions);

    return { ...updatedHabit, streak };
  }
}
