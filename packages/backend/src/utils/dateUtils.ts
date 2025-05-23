/**
 * Date utility functions for habit tracking
 */
import { Habit, RepetitionPattern } from "../../../shared/src/habits";
import { isHabitDueOnDate } from "./streakCalculator";

/**
 * Format a date object to YYYY-MM-DD format
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse a date string in YYYY-MM-DD format to a Date object
 * @returns Date object at midnight UTC
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Check if a date is valid
 */
export function isValidDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  return date.toISOString().split("T")[0] === dateStr;
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return formatDateString(new Date());
}

/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Calculate the date range between two dates (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);

  while (current <= end) {
    dates.push(formatDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date < today;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const todayStr = formatDateString(today);
  return dateStr === todayStr;
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date > today;
}

/**
 * Calculate the days between two dates
 */
export function daysBetween(startDateStr: string, endDateStr: string): number {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Set to midnight to ignore time of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // Calculate the time difference in milliseconds
  const timeDiff = endDate.getTime() - startDate.getTime();

  // Convert to days
  return Math.round(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Get all dates when a habit is due within a date range
 */
export function getDueDatesInRange(
  habit: Habit,
  startDateStr: string,
  endDateStr: string
): string[] {
  const dateRange = getDateRange(startDateStr, endDateStr);

  // Filter the dates when the habit is due
  return dateRange.filter((dateStr) => {
    const date = new Date(dateStr);
    return isHabitDueOnDate(habit, date);
  });
}

/**
 * Calculate the days a habit is due in a given month
 */
export function getDueDatesInMonth(
  habit: Habit,
  year: number,
  month: number
): string[] {
  // Month is 0-indexed in JS Date (0 = January)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of the month

  const startDateStr = formatDateString(startDate);
  const endDateStr = formatDateString(endDate);

  return getDueDatesInRange(habit, startDateStr, endDateStr);
}

/**
 * Check if completion is valid for the habit based on its repetition pattern
 */
export function isValidCompletionDate(habit: Habit, dateStr: string): boolean {
  const date = new Date(dateStr);

  // Validate based on repetition pattern
  return isHabitDueOnDate(habit, date);
}

/**
 * Calculate the start and end date of a week containing the provided date
 */
export function getWeekBoundaries(dateStr: string): {
  startDate: string;
  endDate: string;
} {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate the start of the week (Sunday)
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - day);

  // Calculate the end of the week (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  };
}

/**
 * Calculate the start and end date of a month containing the provided date
 */
export function getMonthBoundaries(dateStr: string): {
  startDate: string;
  endDate: string;
} {
  const date = new Date(dateStr);

  // Calculate the start of the month
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

  // Calculate the end of the month
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  };
}
