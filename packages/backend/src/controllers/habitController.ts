import { Request, Response, NextFunction } from "express";
import {
  Habit,
  HabitTag,
  RepetitionPattern,
  GoalType,
  HabitFilter,
  isHabit,
} from "../../../shared/src/habits";
import { TypedDataService } from "../services/typedDataService";
import { AppError } from "../middlewares/errorMiddleware";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitsListResponse,
} from "../../../shared/src/api";
import { v4 as uuidv4 } from "uuid";

/**
 * Controller for habit-related operations
 */
export class HabitController {
  private habitService: TypedDataService<Habit>;

  /**
   * Creates a new HabitController instance
   */
  constructor() {
    // Initialize the TypedDataService with the habit entity type and validator
    this.habitService = new TypedDataService<Habit>("habits", isHabit);
  }

  /**
   * Get all habits with optional filtering
   */
  async getAllHabits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract filter parameters from query
      const filter: HabitFilter = {};

      if (req.query.tags) {
        filter.tags = (req.query.tags as string).split(",") as HabitTag[];
      }

      if (req.query.repetition) {
        filter.repetition = req.query.repetition as RepetitionPattern;
      }

      if (req.query.searchTerm) {
        filter.searchTerm = req.query.searchTerm as string;
      }

      if (req.query.includeArchived) {
        filter.includeArchived = req.query.includeArchived === "true";
      }

      // Get all habits
      const allHabits = await this.habitService.getAll();

      // Apply filters if any exist
      let filteredHabits = [...allHabits];

      if (filter.tags?.length) {
        filteredHabits = filteredHabits.filter((habit) =>
          filter.tags.includes(habit.tag)
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

      // Sort habits by createdAt date, newest first
      filteredHabits.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const response: HabitsListResponse = {
        habits: filteredHabits,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      };

      res.success(response, "Habits retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a habit by ID
   */
  async getHabitById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const habit = await this.habitService.getById(habitId);
      res.success(habit, "Habit retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new habit
   */
  async createHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitData = req.body as CreateHabitDto;

      // Generate a UUID for the new habit
      const id = uuidv4();

      // Set additional required fields
      const now = new Date().toISOString();

      const newHabit: Habit = {
        ...habitData,
        id,
        createdAt: now,
        updatedAt: now,
        archived: false, // New habits are not archived by default
      };

      const createdHabit = await this.habitService.create(newHabit);
      res.success(createdHabit, "Habit created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing habit
   */
  async updateHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const updateData = req.body as UpdateHabitDto;

      // Add updated timestamp
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const updatedHabit = await this.habitService.update(habitId, updatedData);
      res.success(updatedHabit, "Habit updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a habit
   */
  async deleteHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      await this.habitService.delete(habitId);
      res.success(null, "Habit deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive a habit (soft delete)
   */
  async archiveHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;

      // Get the current habit
      const habit = await this.habitService.getById(habitId);

      // Update with archived status
      const updatedHabit = await this.habitService.update(habitId, {
        archived: true,
        updatedAt: new Date().toISOString(),
      });

      res.success(updatedHabit, "Habit archived successfully");
    } catch (error) {
      next(error);
    }
  }
}
