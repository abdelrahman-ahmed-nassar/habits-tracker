/**
 * Date utility functions for the habits tracker
 */

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns Current date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  return formatDateToString(today);
};

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param date The Date object to format
 * @returns Formatted date string
 */
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Parses a date string to a Date object
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Get the day of week (0-6) from a date string
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (dateString: string): number => {
  const date = parseDate(dateString);
  return date.getDay();
};

/**
 * Get the day of month (1-31) from a date string
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Day of month
 */
export const getDayOfMonth = (dateString: string): number => {
  const date = parseDate(dateString);
  return date.getDate();
};

/**
 * Checks if a date is today
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Whether the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDateString();
};

/**
 * Get date string for a specific number of days ago
 * @param daysAgo Number of days ago
 * @returns Date string in YYYY-MM-DD format
 */
export const getDateDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateToString(date);
};

/**
 * Get date string for a specific number of days from now
 * @param daysAhead Number of days from now
 * @returns Date string in YYYY-MM-DD format
 */
export const getDateDaysAhead = (daysAhead: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return formatDateToString(date);
};

/**
 * Get all dates between two date strings (inclusive)
 * @param startDateString Start date in YYYY-MM-DD format
 * @param endDateString End date in YYYY-MM-DD format
 * @returns Array of date strings in YYYY-MM-DD format
 */
export const getDatesBetween = (
  startDateString: string,
  endDateString: string
): string[] => {
  const dateArray: string[] = [];
  const startDate = parseDate(startDateString);
  const endDate = parseDate(endDateString);

  // Return empty array if end date is before start date
  if (endDate < startDate) {
    return [];
  }

  // Use a loop to add all dates to the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(formatDateToString(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
};

/**
 * Check if a specific date should be active for a habit based on its repetition pattern
 * @param dateString Date to check in YYYY-MM-DD format
 * @param repetition Repetition type (daily, weekly, monthly)
 * @param specificDays Specific days for the habit (weekdays or month dates)
 * @returns Whether the habit is active on this date
 */
export const isDateActiveForHabit = (
  dateString: string,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): boolean => {
  // Daily habits are active every day
  if (repetition === "daily") {
    return true;
  }

  // If no specific days are specified, assume all days are active
  if (!specificDays || specificDays.length === 0) {
    return true;
  }

  if (repetition === "weekly") {
    const dayOfWeek = getDayOfWeek(dateString);
    return specificDays.includes(dayOfWeek);
  }

  if (repetition === "monthly") {
    const dayOfMonth = getDayOfMonth(dateString);
    return specificDays.includes(dayOfMonth);
  }

  return false;
};
