import { Request, Response, NextFunction } from "express";
import {
  HabitTag,
  RepetitionPattern,
  GoalType,
  HabitFilter,
} from "../../../shared/src/habits";
import { HabitService } from "../services/habitService";
import { AppError } from "../middlewares/errorMiddleware";
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitsListResponse,
} from "../../../shared/src/api";

/**
 * Controller for habit-related operations
 */
export class HabitController {
  private habitService: HabitService;

  /**
   * Creates a new HabitController instance
   */
  constructor() {
    this.habitService = new HabitService();
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

      // Get habits with streak information
      const habitsWithStreaks = await this.habitService.getAllHabits(filter);

      // Format response according to API schema
      const response: HabitsListResponse = {
        habits: habitsWithStreaks,
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
      const habit = await this.habitService.getHabitById(habitId);
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
      const createdHabit = await this.habitService.createHabit(habitData);
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
      const updatedHabit = await this.habitService.updateHabit(
        habitId,
        updateData
      );
      res.success(updatedHabit, "Habit updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a habit (hard delete)
   */
  async deleteHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const deleteCompletions = req.query.deleteCompletions === "true";

      await this.habitService.deleteHabit(habitId, deleteCompletions);
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
      const archivedHabit = await this.habitService.archiveHabit(habitId);
      res.success(archivedHabit, "Habit archived successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore an archived habit
   */
  async restoreHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const restoredHabit = await this.habitService.restoreHabit(habitId);
      res.success(restoredHabit, "Habit restored successfully");
    } catch (error) {
      next(error);
    }
  }
}
