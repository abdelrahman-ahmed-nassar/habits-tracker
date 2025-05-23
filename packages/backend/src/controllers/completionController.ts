import { Request, Response, NextFunction } from "express";
import { CompletionService } from "../services/completionService";
import { HabitService } from "../services/habitService";
import { AppError } from "../middlewares/errorMiddleware";
import {
  CompleteHabitDto,
  BulkCompleteDto,
  CompletionHistoryResponse,
  DailyCompletionsResponse,
  CompletionRangeResponse,
} from "../../../shared/src/api";
import { DailyCompletionStatus } from "../../../shared/src/completions";

/**
 * Controller for completion-related operations
 */
export class CompletionController {
  private completionService: CompletionService;
  private habitService: HabitService;

  /**
   * Creates a new CompletionController instance
   */
  constructor() {
    this.completionService = new CompletionService();
    this.habitService = new HabitService();
  }

  /**
   * Mark a habit as complete for a specific date
   */
  async completeHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const { date, value, notes } = req.body as CompleteHabitDto;

      // First check if the habit exists
      await this.habitService.getHabitById(habitId);

      const completion = await this.completionService.completeHabit(
        habitId,
        date,
        value,
        notes
      );

      res.success(completion, "Habit marked as complete", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a completion record for a habit on a specific date
   */
  async uncompleteHabit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const date = req.params.date;

      // Check if the habit exists
      await this.habitService.getHabitById(habitId);

      await this.completionService.uncompleteHabit(habitId, date);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get completion history for a specific habit
   */
  async getHabitCompletionHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const habitId = req.params.id;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      // Validate date formats if provided
      if (startDate && !this.isValidDateString(startDate)) {
        throw new AppError("Invalid startDate format. Use YYYY-MM-DD", 400);
      }

      if (endDate && !this.isValidDateString(endDate)) {
        throw new AppError("Invalid endDate format. Use YYYY-MM-DD", 400);
      }

      // Check if the habit exists
      const habit = await this.habitService.getHabitById(habitId);

      const history = await this.completionService.getHabitCompletionHistory(
        habitId,
        startDate,
        endDate
      );

      const response: CompletionHistoryResponse = {
        habit,
        completions: history.completions,
        statistics: {
          totalCompletions: history.statistics.totalCompletions,
          completionRate: history.statistics.completionRate,
          streakData: history.statistics.streakData,
        },
      };

      res.success(response, "Habit completion history retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all completions for a specific date
   */
  async getDailyCompletions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const date = req.params.date;

      const dailyCompletions = await this.completionService.getDailyCompletions(
        date
      );

      const response: DailyCompletionsResponse = {
        date,
        completions: dailyCompletions.completions,
        summary: {
          totalHabits: dailyCompletions.summary.totalHabits,
          completedHabits: dailyCompletions.summary.completedHabits,
          completionRate: dailyCompletions.summary.completionRate,
        },
      };

      res.success(response, `Completions for ${date} retrieved`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get completions for a date range
   */
  async getCompletionsInRange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query as {
        startDate: string;
        endDate: string;
      };

      const completionsInRange =
        await this.completionService.getCompletionsInRange(startDate, endDate);

      const response: CompletionRangeResponse = {
        startDate,
        endDate,
        completions: completionsInRange.completions,
        dailySummaries: completionsInRange.dailySummaries,
        aggregateStats: {
          totalHabits: completionsInRange.aggregateStats.totalHabits,
          totalCompletions: completionsInRange.aggregateStats.totalCompletions,
          averageCompletionRate:
            completionsInRange.aggregateStats.averageCompletionRate,
        },
      };

      res.success(
        response,
        `Completions from ${startDate} to ${endDate} retrieved`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark multiple habits complete in a single request
   */
  async bulkCompleteHabits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const bulkData = req.body as BulkCompleteDto[];

      if (!Array.isArray(bulkData) || bulkData.length === 0) {
        throw new AppError("Request body must be a non-empty array", 400);
      }

      const results = await this.completionService.bulkCompleteHabits(bulkData);

      res.success(
        results,
        `Successfully processed ${results.length} completion records`,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate if a string is in YYYY-MM-DD format
   */
  private isValidDateString(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    // Further validate that it's a valid date
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (isNaN(timestamp)) return false;

    return date.toISOString().split("T")[0] === dateString;
  }
}
