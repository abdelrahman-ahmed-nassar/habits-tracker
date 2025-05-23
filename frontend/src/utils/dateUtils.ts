import {
  format,
  parse,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  getMonth,
  getYear,
  addMonths,
  subMonths,
} from "date-fns";

// Format date to YYYY-MM-DD format
export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Parse string date in YYYY-MM-DD format
export const parseDate = (dateString: string): Date => {
  return parse(dateString, "yyyy-MM-dd", new Date());
};

// Get today's date as YYYY-MM-DD
export const getTodayString = (): string => {
  return formatDate(new Date());
};

// Get yesterday's date as YYYY-MM-DD
export const getYesterdayString = (): string => {
  return formatDate(subDays(new Date(), 1));
};

// Get tomorrow's date as YYYY-MM-DD
export const getTomorrowString = (): string => {
  return formatDate(addDays(new Date(), 1));
};

// Get start of current week as YYYY-MM-DD
export const getCurrentWeekStartString = (): string => {
  return formatDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
};

// Get end of current week as YYYY-MM-DD
export const getCurrentWeekEndString = (): string => {
  return formatDate(endOfWeek(new Date(), { weekStartsOn: 1 }));
};

// Get array of dates in current week as YYYY-MM-DD strings
export const getCurrentWeekDates = (): string[] => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map((date) => formatDate(date));
};

// Get array of dates for a specific week as YYYY-MM-DD strings
export const getWeekDates = (startDateString: string): string[] => {
  const start = parseDate(startDateString);
  const end = endOfWeek(start, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map((date) => formatDate(date));
};

// Get previous week's start date as YYYY-MM-DD
export const getPreviousWeekStartString = (
  currentWeekStart: string
): string => {
  const currentWeekStartDate = parseDate(currentWeekStart);
  return formatDate(subWeeks(currentWeekStartDate, 1));
};

// Get next week's start date as YYYY-MM-DD
export const getNextWeekStartString = (currentWeekStart: string): string => {
  const currentWeekStartDate = parseDate(currentWeekStart);
  return formatDate(addWeeks(currentWeekStartDate, 1));
};

// Get array of dates in current month as YYYY-MM-DD strings
export const getCurrentMonthDates = (): string[] => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  return eachDayOfInterval({ start, end }).map((date) => formatDate(date));
};

// Get array of dates for a specific month as YYYY-MM-DD strings
export const getMonthDates = (year: number, month: number): string[] => {
  // Note: month is 0-indexed (0 = January, 11 = December)
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  return eachDayOfInterval({ start, end }).map((date) => formatDate(date));
};

// Get previous month (returns [year, month])
export const getPreviousMonth = (
  year: number,
  month: number
): [number, number] => {
  const date = subMonths(new Date(year, month), 1);
  return [getYear(date), getMonth(date)];
};

// Get next month (returns [year, month])
export const getNextMonth = (year: number, month: number): [number, number] => {
  const date = addMonths(new Date(year, month), 1);
  return [getYear(date), getMonth(date)];
};

// Check if a date is today
export const isDateToday = (dateString: string): boolean => {
  return isToday(parseDate(dateString));
};

// Check if two dates are the same day
export const isSameDayString = (
  dateString1: string,
  dateString2: string
): boolean => {
  return isSameDay(parseDate(dateString1), parseDate(dateString2));
};

// Format date for display (e.g., "Monday, Jan 1, 2023")
export const formatDateForDisplay = (dateString: string): string => {
  return format(parseDate(dateString), "EEEE, MMM d, yyyy");
};

// Format month for display (e.g., "January 2023")
export const formatMonthForDisplay = (year: number, month: number): string => {
  return format(new Date(year, month), "MMMM yyyy");
};
