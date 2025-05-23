/**
 * Type validators for JSON data
 * This file contains validation functions for the shared types
 */

import {
  IHabit,
  ICompletion,
  INote,
  IAnalytics,
  ISettings,
} from "../types/shared";

/**
 * Creates a validator function for an array of items
 *
 * @param itemValidator Function to validate individual items
 * @returns Function that validates an array of items
 */
export function createArrayValidator<T>(
  itemValidator: (data: unknown) => boolean
): (data: unknown) => boolean {
  return (data: unknown): boolean => {
    if (!Array.isArray(data)) {
      return false;
    }

    return data.every((item) => itemValidator(item));
  };
}

/**
 * Checks if a value is an object (non-null and not an array)
 *
 * @param value Value to check
 * @returns True if the value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type validator for habits
 *
 * @param data Data to validate
 * @returns True if the data matches the IHabit interface
 */
export function isHabit(data: unknown): data is IHabit {
  if (!isObject(data)) return false;

  // Check required properties
  const requiredProps = [
    "id",
    "name",
    "tag",
    "repetition",
    "goalType",
    "goalValue",
    "createdAt",
    "updatedAt",
  ];

  for (const prop of requiredProps) {
    if (!(prop in data)) return false;
  }

  // Check property types
  if (
    typeof data.id !== "string" ||
    typeof data.name !== "string" ||
    typeof data.tag !== "string" ||
    typeof data.repetition !== "string" ||
    typeof data.goalType !== "string" ||
    typeof data.goalValue !== "number" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return false;
  }

  // Check arrays if they exist
  if (
    ("specificDays" in data && !Array.isArray(data.specificDays)) ||
    ("specificDates" in data && !Array.isArray(data.specificDates))
  ) {
    return false;
  }

  // Check optional property types if they exist
  if (
    ("color" in data && typeof data.color !== "string") ||
    ("icon" in data && typeof data.icon !== "string") ||
    ("archived" in data && typeof data.archived !== "boolean")
  ) {
    return false;
  }

  return true;
}

/**
 * Type validator for completions
 *
 * @param data Data to validate
 * @returns True if the data matches the ICompletion interface
 */
export function isCompletion(data: unknown): data is ICompletion {
  if (!isObject(data)) return false;

  // Check required properties
  const requiredProps = [
    "id",
    "habitId",
    "date",
    "completed",
    "createdAt",
    "updatedAt",
  ];

  for (const prop of requiredProps) {
    if (!(prop in data)) return false;
  }

  // Check property types
  if (
    typeof data.id !== "string" ||
    typeof data.habitId !== "string" ||
    typeof data.date !== "string" ||
    typeof data.completed !== "boolean" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return false;
  }

  // Check optional property types if they exist
  if (
    ("value" in data && typeof data.value !== "number") ||
    ("notes" in data && typeof data.notes !== "string")
  ) {
    return false;
  }

  return true;
}

/**
 * Type validator for notes
 *
 * @param data Data to validate
 * @returns True if the data matches the INote interface
 */
export function isNote(data: unknown): data is INote {
  if (!isObject(data)) return false;

  // Check required properties
  const requiredProps = ["id", "habitId", "content", "createdAt", "updatedAt"];

  for (const prop of requiredProps) {
    if (!(prop in data)) return false;
  }

  // Check property types
  if (
    typeof data.id !== "string" ||
    typeof data.habitId !== "string" ||
    typeof data.content !== "string" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return false;
  }

  return true;
}

/**
 * Type validator for analytics
 *
 * @param data Data to validate
 * @returns True if the data matches the IAnalytics interface
 */
export function isAnalytics(data: unknown): data is IAnalytics {
  if (!isObject(data)) return false;

  // Check required properties
  const requiredProps = [
    "id",
    "habitId",
    "period",
    "startDate",
    "endDate",
    "totalCompletions",
    "streakCurrent",
    "streakLongest",
    "createdAt",
    "updatedAt",
  ];

  for (const prop of requiredProps) {
    if (!(prop in data)) return false;
  }

  // Check property types
  if (
    typeof data.id !== "string" ||
    typeof data.habitId !== "string" ||
    typeof data.period !== "string" ||
    typeof data.startDate !== "string" ||
    typeof data.endDate !== "string" ||
    typeof data.totalCompletions !== "number" ||
    typeof data.streakCurrent !== "number" ||
    typeof data.streakLongest !== "number" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return false;
  }

  return true;
}

/**
 * Type validator for settings
 *
 * @param data Data to validate
 * @returns True if the data matches the ISettings interface
 */
export function isSettings(data: unknown): data is ISettings {
  if (!isObject(data)) return false;

  // Check required properties
  const requiredProps = [
    "id",
    "userId",
    "theme",
    "firstDayOfWeek",
    "backupEnabled",
    "backupFrequency",
    "createdAt",
    "updatedAt",
  ];

  for (const prop of requiredProps) {
    if (!(prop in data)) return false;
  }

  // Check property types
  if (
    typeof data.id !== "string" ||
    typeof data.userId !== "string" ||
    typeof data.theme !== "string" ||
    typeof data.firstDayOfWeek !== "number" ||
    typeof data.backupEnabled !== "boolean" ||
    typeof data.backupFrequency !== "string" ||
    typeof data.createdAt !== "string" ||
    typeof data.updatedAt !== "string"
  ) {
    return false;
  }

  return true;
}

// Create array validators for each type
export const isHabitsArray = createArrayValidator(isHabit);
export const isCompletionsArray = createArrayValidator(isCompletion);
export const isNotesArray = createArrayValidator(isNote);
export const isAnalyticsArray = createArrayValidator(isAnalytics);

// Export all validators as a collection for easy access
export const validators = {
  habits: isHabitsArray,
  completions: isCompletionsArray,
  notes: isNotesArray,
  analytics: isAnalyticsArray,
  settings: isSettings,
};
