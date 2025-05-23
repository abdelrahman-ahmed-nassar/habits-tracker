import { Request, Response, NextFunction } from "express";
import {
  Habit,
  isHabit,
  HabitTag,
  RepetitionPattern,
  GoalType,
  PriorityLevel,
} from "../../../shared/src/habits";
import {
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
  BulkCompleteDto,
} from "../../../shared/src/api";
import { AppError } from "./errorMiddleware";
import { isValidDate } from "../utils/dateUtils";

/**
 * Validates that request body contains all required fields for habit creation
 */
export function validateCreateHabit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const habitData = req.body as CreateHabitDto;

  // Required fields validation
  if (!habitData.name || habitData.name.trim().length === 0) {
    return next(new AppError("Habit name is required", 400));
  }

  if (
    !habitData.tag ||
    !Object.values(HabitTag).includes(habitData.tag as HabitTag)
  ) {
    return next(new AppError("Valid habit tag is required", 400));
  }

  if (
    !habitData.repetition ||
    !Object.values(RepetitionPattern).includes(
      habitData.repetition as RepetitionPattern
    )
  ) {
    return next(new AppError("Valid repetition pattern is required", 400));
  }

  if (
    !habitData.goalType ||
    !Object.values(GoalType).includes(habitData.goalType as GoalType)
  ) {
    return next(new AppError("Valid goal type is required", 400));
  }

  if (
    habitData.goalValue === undefined ||
    typeof habitData.goalValue !== "number" ||
    habitData.goalValue <= 0
  ) {
    return next(new AppError("Goal value must be a positive number", 400));
  }

  // Validate specific days/dates for weekly/monthly repetitions
  if (
    habitData.repetition === RepetitionPattern.Weekly &&
    (!habitData.specificDays || !habitData.specificDays.length)
  ) {
    return next(
      new AppError("Weekly habits require specific days to be set", 400)
    );
  }

  if (
    habitData.repetition === RepetitionPattern.Monthly &&
    (!habitData.specificDates || !habitData.specificDates.length)
  ) {
    return next(
      new AppError("Monthly habits require specific dates to be set", 400)
    );
  }

  // Validate priority if provided
  if (
    habitData.priority &&
    !Object.values(PriorityLevel).includes(habitData.priority as PriorityLevel)
  ) {
    return next(new AppError("Invalid priority level", 400));
  }

  next();
}

/**
 * Validates that request body contains valid fields for habit update
 */
export function validateUpdateHabit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const habitData = req.body as UpdateHabitDto;

  // If tag is provided, validate it
  if (
    habitData.tag &&
    !Object.values(HabitTag).includes(habitData.tag as HabitTag)
  ) {
    return next(new AppError("Invalid habit tag", 400));
  }

  // If repetition is provided, validate it
  if (
    habitData.repetition &&
    !Object.values(RepetitionPattern).includes(
      habitData.repetition as RepetitionPattern
    )
  ) {
    return next(new AppError("Invalid repetition pattern", 400));
  }

  // If goal type is provided, validate it
  if (
    habitData.goalType &&
    !Object.values(GoalType).includes(habitData.goalType as GoalType)
  ) {
    return next(new AppError("Invalid goal type", 400));
  }

  // If goal value is provided, validate it
  if (
    habitData.goalValue !== undefined &&
    (typeof habitData.goalValue !== "number" || habitData.goalValue <= 0)
  ) {
    return next(new AppError("Goal value must be a positive number", 400));
  }

  // Validate priority if provided
  if (
    habitData.priority &&
    !Object.values(PriorityLevel).includes(habitData.priority as PriorityLevel)
  ) {
    return next(new AppError("Invalid priority level", 400));
  }

  // Validate consistency between repetition pattern and specific days/dates
  if (
    habitData.repetition === RepetitionPattern.Weekly &&
    habitData.specificDays &&
    !habitData.specificDays.length
  ) {
    return next(
      new AppError("Weekly habits require specific days to be set", 400)
    );
  }

  if (
    habitData.repetition === RepetitionPattern.Monthly &&
    habitData.specificDates &&
    !habitData.specificDates.length
  ) {
    return next(
      new AppError("Monthly habits require specific dates to be set", 400)
    );
  }

  next();
}

/**
 * Validates that request body contains valid fields for marking a habit as complete
 */
export function validateCompleteHabit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const completionData = req.body as CompleteHabitDto;

  // Check for required date field
  if (!completionData.date) {
    return next(new AppError("Date is required", 400));
  }

  // Validate date format
  if (!isValidDateString(completionData.date)) {
    return next(
      new AppError("Invalid date format. Use YYYY-MM-DD format", 400)
    );
  }

  // If value is provided, ensure it's a positive number
  if (
    completionData.value !== undefined &&
    (typeof completionData.value !== "number" || completionData.value < 0)
  ) {
    return next(new AppError("Value must be a non-negative number", 400));
  }

  // If notes are provided, ensure they're a string
  if (
    completionData.notes !== undefined &&
    typeof completionData.notes !== "string"
  ) {
    return next(new AppError("Notes must be a string", 400));
  }

  next();
}

/**
 * Validates that a date parameter is in the correct format
 */
export function validateDateParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dateParam = req.params[paramName];

    if (!dateParam) {
      return next(new AppError(`${paramName} parameter is required`, 400));
    }

    if (!isValidDateString(dateParam)) {
      return next(
        new AppError(`Invalid ${paramName} format. Use YYYY-MM-DD format`, 400)
      );
    }

    next();
  };
}

/**
 * Validates that startDate and endDate query parameters are in the correct format
 */
export function validateDateRange(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { startDate, endDate } = req.query;

  if (!startDate) {
    return next(new AppError("startDate query parameter is required", 400));
  }

  if (!endDate) {
    return next(new AppError("endDate query parameter is required", 400));
  }

  if (!isValidDateString(startDate as string)) {
    return next(
      new AppError("Invalid startDate format. Use YYYY-MM-DD format", 400)
    );
  }

  if (!isValidDateString(endDate as string)) {
    return next(
      new AppError("Invalid endDate format. Use YYYY-MM-DD format", 400)
    );
  }

  // Ensure startDate is not after endDate
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (start > end) {
    return next(new AppError("startDate cannot be later than endDate", 400));
  }

  next();
}

/**
 * Validates if a string is in YYYY-MM-DD format
 */
function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Further validate that it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  return date.toISOString().split("T")[0] === dateString;
}

/**
 * Middleware to validate time range parameters
 */
export function validateTimeRange(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { startDate, endDate } = req.query;

  // If no dates provided, use default (last 30 days)
  if (!startDate && !endDate) {
    // Create default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    req.query.startDate = start.toISOString().split("T")[0];
    req.query.endDate = end.toISOString().split("T")[0];
    return next();
  }

  // Validate startDate if provided
  if (startDate && typeof startDate === "string") {
    if (!isValidDate(startDate)) {
      return next(
        new AppError(
          `Invalid startDate format: ${startDate}. Use YYYY-MM-DD format.`,
          400
        )
      );
    }
  }

  // Validate endDate if provided
  if (endDate && typeof endDate === "string") {
    if (!isValidDate(endDate)) {
      return next(
        new AppError(
          `Invalid endDate format: ${endDate}. Use YYYY-MM-DD format.`,
          400
        )
      );
    }
  }

  // If only one date is provided, set the other
  if (startDate && !endDate) {
    // Default to today for endDate
    req.query.endDate = new Date().toISOString().split("T")[0];
  } else if (!startDate && endDate) {
    // Default to 30 days before endDate for startDate
    const end = new Date(endDate as string);
    const start = new Date(end);
    start.setDate(start.getDate() - 30);
    req.query.startDate = start.toISOString().split("T")[0];
  }

  // Ensure startDate is before endDate
  if (req.query.startDate && req.query.endDate) {
    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);

    if (start > end) {
      return next(new AppError("startDate must be before endDate", 400));
    }
  }

  next();
}
