/**
 * Chart date formatting utilities
 */
import { ChartTimeRange, ChartGranularity } from "../../../shared/src/charts";
import { formatDateString } from "./dateUtils";

/**
 * Format a date for display on charts based on granularity
 */
export function formatChartDate(
  date: Date,
  granularity: ChartGranularity
): string {
  switch (granularity) {
    case ChartGranularity.Daily:
      return formatDateString(date); // YYYY-MM-DD

    case ChartGranularity.Weekly:
      const weekNumber = getISOWeek(date);
      const year = date.getFullYear();
      return `W${weekNumber}, ${year}`;

    case ChartGranularity.Monthly:
      return formatMonthYear(date);

    case ChartGranularity.Quarterly:
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;

    case ChartGranularity.Yearly:
      return date.getFullYear().toString();

    default:
      return formatDateString(date);
  }
}

/**
 * Format date to Month Year (e.g., Jan 2023)
 */
export function formatMonthYear(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format date for short display (e.g., Jan 1)
 */
export function formatShortDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format day of week (e.g., Mon, Tue, etc)
 */
export function formatDayOfWeek(date: Date, short: boolean = true): string {
  const days = short
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

  return days[date.getDay()];
}

/**
 * Get ISO week number for a date
 */
export function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Calculate date range from chart time range preset
 */
export function getDateRangeFromPreset(preset: ChartTimeRange): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  // Reset time to the end of day
  endDate.setHours(23, 59, 59, 999);

  switch (preset) {
    case ChartTimeRange.Last7Days:
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      break;

    case ChartTimeRange.Last30Days:
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29);
      break;

    case ChartTimeRange.Last90Days:
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 89);
      break;

    case ChartTimeRange.LastMonth:
      // Last full calendar month
      endDate.setDate(0); // Last day of previous month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      break;

    case ChartTimeRange.LastQuarter:
      // Last full quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
      const lastQuarterStart = new Date(
        lastQuarterEnd.getMonth() >= 3
          ? lastQuarterEnd.getFullYear()
          : lastQuarterEnd.getFullYear() - 1,
        lastQuarterEnd.getMonth() >= 3 ? lastQuarterEnd.getMonth() - 3 + 1 : 9,
        1
      );
      startDate = lastQuarterStart;
      endDate.setTime(lastQuarterEnd.getTime());
      break;

    case ChartTimeRange.LastYear:
      // Last full calendar year
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate.setFullYear(now.getFullYear() - 1, 11, 31);
      break;

    case ChartTimeRange.CurrentMonth:
      // Current month to date
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case ChartTimeRange.CurrentYear:
      // Current year to date
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    default:
      // Default to last 30 days
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29);
  }

  // Set start time to beginning of day
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  };
}

/**
 * Generate date labels for chart axis based on granularity
 */
export function generateDateLabels(
  startDate: string,
  endDate: string,
  granularity: ChartGranularity
): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const labels: string[] = [];

  // Reset start time to beginning of day
  start.setHours(0, 0, 0, 0);

  // Reset end time to end of day
  end.setHours(23, 59, 59, 999);

  if (granularity === ChartGranularity.Daily) {
    // Daily labels
    const current = new Date(start);
    while (current <= end) {
      labels.push(formatShortDate(current));
      current.setDate(current.getDate() + 1);
    }
  } else if (granularity === ChartGranularity.Weekly) {
    // Weekly labels
    const current = new Date(start);
    // Adjust to first day of week (Sunday)
    const dayOfWeek = current.getDay();
    current.setDate(current.getDate() - dayOfWeek);

    while (current <= end) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      labels.push(`${formatShortDate(current)} - ${formatShortDate(weekEnd)}`);
      current.setDate(current.getDate() + 7);
    }
  } else if (granularity === ChartGranularity.Monthly) {
    // Monthly labels
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      labels.push(formatMonthYear(current));
      current.setMonth(current.getMonth() + 1);
    }
  } else if (granularity === ChartGranularity.Quarterly) {
    // Quarterly labels
    const startQuarter = Math.floor(start.getMonth() / 3);
    const startYear = start.getFullYear();
    const endQuarter = Math.floor(end.getMonth() / 3);
    const endYear = end.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const firstQuarter = year === startYear ? startQuarter : 0;
      const lastQuarter = year === endYear ? endQuarter : 3;

      for (let quarter = firstQuarter; quarter <= lastQuarter; quarter++) {
        labels.push(`Q${quarter + 1} ${year}`);
      }
    }
  } else if (granularity === ChartGranularity.Yearly) {
    // Yearly labels
    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
      labels.push(year.toString());
    }
  }

  return labels;
}

/**
 * Generate month ranges for calendar heatmaps
 */
export function generateMonthRanges(
  startDate: string,
  endDate: string
): Array<{
  month: number;
  year: number;
  startIndex: number;
  endIndex: number;
  label: string;
}> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ranges: Array<{
    month: number;
    year: number;
    startIndex: number;
    endIndex: number;
    label: string;
  }> = [];

  // Get first day of month for start date
  const currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  let dayCounter = 0;
  let rangeStart = 0;

  while (currentMonth <= end) {
    // Calculate days in this month
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const monthStart = new Date(currentMonth);

    // If this is the first month, adjust for partial month
    if (
      monthStart.getMonth() === start.getMonth() &&
      monthStart.getFullYear() === start.getFullYear()
    ) {
      rangeStart = dayCounter;
      dayCounter += daysInMonth - start.getDate() + 1;
    } else {
      rangeStart = dayCounter;
      dayCounter += daysInMonth;
    }

    // Add month range
    ranges.push({
      month: currentMonth.getMonth(),
      year: currentMonth.getFullYear(),
      startIndex: rangeStart,
      endIndex: dayCounter - 1,
      label: formatMonthYear(currentMonth),
    });

    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return ranges;
}
