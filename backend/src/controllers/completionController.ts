import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CompletionRecord } from "../../../shared/types";
import { validateCompletion } from "../utils/validation";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";

/**
 * Get completion records for a habit
 * @route GET /api/habits/:id/records
 */
export const getHabitCompletions = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if habit exists
    const habit = await dataService.getHabitById(id);
    if (!habit) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Get completion records for this habit
    let completions = await dataService.getCompletionsByHabitId(id);

    // Filter by date range if provided
    if (startDate && typeof startDate === "string") {
      completions = completions.filter((c) => c.date >= startDate);
    }

    if (endDate && typeof endDate === "string") {
      completions = completions.filter((c) => c.date <= endDate);
    }

    // Sort by date (most recent first)
    completions.sort((a, b) => b.date.localeCompare(a.date));

    res.status(200).json({
      success: true,
      data: completions,
    });
  }
);

/**
 * Mark a habit as complete/incomplete for a date
 * @route POST /api/habits/:id/complete
 */
export const markHabitComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, completed, value } = req.body;

    // Basic validation
    if (!date) {
      throw new AppError("Date is required", 400);
    }

    // Check if habit exists
    const habit = await dataService.getHabitById(id);
    if (!habit) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Create completion data
    const completionData: Omit<CompletionRecord, "id" | "completedAt"> = {
      habitId: id,
      date,
      completed: completed !== undefined ? completed : true,
      value: value !== undefined ? value : undefined,
    };

    // Validate completion data
    const errors = validateCompletion(completionData);
    if (errors.length > 0) {
      throw new AppError("Invalid completion data", 400, errors);
    }

    // Save completion
    const completion = await dataService.createCompletion(completionData);

    res.status(200).json({
      success: true,
      data: completion,
      message:
        "Habit marked as " +
        (completion.completed ? "completed" : "incomplete"),
    });
  }
);
