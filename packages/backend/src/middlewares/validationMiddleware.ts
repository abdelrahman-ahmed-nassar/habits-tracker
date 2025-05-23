import { Request, Response, NextFunction } from "express";
import {
  Habit,
  isHabit,
  HabitTag,
  RepetitionPattern,
  GoalType,
  PriorityLevel,
} from "../../../shared/src/habits";
import { CreateHabitDto, UpdateHabitDto } from "../../../shared/src/api";
import { AppError } from "./errorMiddleware";

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
