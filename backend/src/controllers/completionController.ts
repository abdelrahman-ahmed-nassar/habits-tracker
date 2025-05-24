import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CompletionRecord } from "../../../shared/types";
import { validateCompletion } from "../utils/validation";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat } from "../utils/validation";

/**
 * Get completion records for a specific date
 * @route GET /api/completions/date/:date
 */
export const getDailyCompletions = asyncHandler(
  async (req: Request, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Get all completions for this date
    const completions = await dataService.getCompletionsByDate(date);

    res.status(200).json({
      success: true,
      data: completions,
    });
  }
);

/**
 * Get completion records for a habit
 * @route GET /api/habits/:id/records
 */
export const getHabitCompletions = asyncHandler(
  async (req: Request, res: Response) => {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if habit exists
    const habit = await dataService.getHabitById(habitId);
    if (!habit) {
      throw new AppError(`Habit with ID ${habitId} not found`, 404);
    }

    // Get completion records for this habit
    let completions = await dataService.getCompletionsByHabitId(habitId);

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
    const { date, completed, value, habitId } = req.body;

    // Use habitId from body if id param is not provided (for /completions endpoints)
    const targetHabitId = id || habitId;

    // Basic validation
    if (!targetHabitId) {
      throw new AppError("Habit ID is required", 400);
    }

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    // Check if habit exists
    const habit = await dataService.getHabitById(targetHabitId);
    if (!habit) {
      throw new AppError(`Habit with ID ${targetHabitId} not found`, 404);
    }

    // Create completion data
    const completionData: Omit<CompletionRecord, "id" | "completedAt"> = {
      habitId: targetHabitId,
      date,
      completed: completed !== undefined ? completed : true,
      value: value !== undefined ? value : undefined,
    };

    // Validate completion data
    const errors = validateCompletion(completionData);
    if (errors.length > 0) {
      throw new AppError("Invalid completion data", 400, errors);
    }

    // For counter type habits, ensure value is provided when completed is true
    if (
      habit.goalType === "counter" &&
      completionData.completed &&
      completionData.value === undefined
    ) {
      throw new AppError("Value is required for counter-type habits", 400);
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

/**
 * Delete a completion record for a specific date
 * @route DELETE /api/habits/:id/complete/:date
 */
export const deleteCompletion = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, date, habitId } = req.params;

    // Use habitId or id parameter
    const targetHabitId = habitId || id;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Check if habit exists
    const habit = await dataService.getHabitById(targetHabitId);
    if (!habit) {
      throw new AppError(`Habit with ID ${targetHabitId} not found`, 404);
    }

    // Check if completion record exists
    const completions = await dataService.getCompletionsByHabitId(
      targetHabitId
    );
    const completionRecord = completions.find((c) => c.date === date);

    if (!completionRecord) {
      throw new AppError(
        `No completion record found for habit ${targetHabitId} on date ${date}`,
        404
      );
    }

    // Delete the completion record
    const success = await dataService.deleteCompletion(completionRecord.id);

    if (!success) {
      throw new AppError("Failed to delete completion record", 500);
    }

    // Update the habit streaks after deletion
    await dataService.updateHabitStreaks(targetHabitId);

    res.status(200).json({
      success: true,
      message: `Completion record for habit ${targetHabitId} on date ${date} deleted successfully`,
    });
  }
);

/**
 * Get completion records for a date range
 * @route GET /api/completions/range/:startDate/:endDate
 */
export const getCompletionsInRange = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.params;

    // Validate date formats
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Get all completions
    const completions = await dataService.getCompletions();
    // Filter by date range (inclusive)
    const filtered = completions.filter(
      (c) => c.date >= startDate && c.date <= endDate
    );

    res.status(200).json({
      success: true,
      data: filtered,
    });
  }
);
