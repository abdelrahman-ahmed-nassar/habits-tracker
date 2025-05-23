/**
 * Chart Data Service
 * Prepares data for various chart types in the application
 */
import {
  LineChartData,
  BarChartData,
  PieChartData,
  CalendarHeatmapData,
  ChartDataPoint,
  TimeSeriesDataPoint,
  ChartSeries,
  ChartGranularity,
  HeatmapCell,
  ChartColorSchemes,
} from "../../../shared/src/charts";
import { Habit, HabitTag } from "../../../shared/src/habits";
import { Completion } from "../../../shared/src/completions";
import { DailyCompletionSummary } from "../../../shared/src/analytics";
import {
  formatChartDate,
  formatShortDate,
  formatDayOfWeek,
  generateDateLabels,
  generateMonthRanges,
} from "../utils/chartDateUtils";
import {
  calculateDayOfWeekStats,
  calculateStatsByTag,
} from "../utils/statisticsUtils";

/**
 * Chart data preparation service for frontend chart components
 */
export class ChartDataService {
  /**
   * Create daily completion trend data for line chart
   * @param dailySummaries - Daily completion summary data
   * @param startDate - Start date for the chart
   * @param endDate - End date for the chart
   * @param granularity - Time granularity for grouping data
   * @returns Formatted line chart data
   */
  prepareDailyCompletionTrend(
    dailySummaries: DailyCompletionSummary[],
    startDate: string,
    endDate: string,
    granularity: ChartGranularity = ChartGranularity.Daily
  ): LineChartData {
    // Generate date range labels
    const labels = generateDateLabels(startDate, endDate, granularity);

    // Group summaries by date based on granularity
    const groupedData = this.groupDataByGranularity(
      dailySummaries,
      granularity
    );

    // Create completion rate series
    const completionRates: TimeSeriesDataPoint[] = [];

    // Create data points for each date in the range
    for (const [dateStr, summaries] of Object.entries(groupedData)) {
      // Calculate total completions and scheduled
      let totalScheduled = 0;
      let totalCompleted = 0;

      summaries.forEach((summary) => {
        totalScheduled += summary.totalCount;
        totalCompleted += summary.completedCount;
      });

      // Calculate completion rate
      const completionRate =
        totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

      // Format date for display based on granularity
      const dateObj = new Date(dateStr);
      const formattedDate = formatChartDate(dateObj, granularity);

      completionRates.push({
        date: dateStr,
        label: formattedDate,
        value: Math.round(completionRate * 100), // Convert to percentage
        metadata: {
          totalCount: totalScheduled,
          completedCount: totalCompleted,
        },
      });
    }

    // Sort by date
    completionRates.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Create chart data
    const series: ChartSeries[] = [
      {
        name: "Completion Rate",
        data: completionRates,
        color: ChartColorSchemes.blues[5],
      },
    ];

    return {
      series,
      labels,
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Create weekly performance data for bar chart
   * @param dailySummaries - Daily completion summary data
   * @returns Formatted bar chart data
   */
  prepareWeeklyPerformanceData(
    dailySummaries: DailyCompletionSummary[]
  ): BarChartData {
    // Calculate day of week statistics
    const dayStats = calculateDayOfWeekStats(dailySummaries);

    // Sort by day of week (0-6)
    dayStats.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    // Create data points
    const completionRates: ChartDataPoint[] = dayStats.map((stat) => ({
      label: stat.dayName,
      value: Math.round(stat.completionRate * 100), // Convert to percentage
      metadata: {
        totalCount: stat.totalCount,
        completedCount: stat.completedCount,
      },
    }));

    // Create series
    const series: ChartSeries[] = [
      {
        name: "Completion Rate",
        data: completionRates,
        color: ChartColorSchemes.blues[5],
      },
    ];

    // Create labels (day names)
    const labels = dayStats.map((stat) => stat.dayName);

    return {
      series,
      labels,
      stacked: false,
    };
  }

  /**
   * Create category breakdown data for pie/donut chart
   * @param habits - Habit data
   * @param completions - Completion data
   * @returns Formatted pie chart data
   */
  prepareCategoryBreakdownData(
    habits: Habit[],
    completions: Completion[]
  ): PieChartData {
    // Calculate statistics by tag
    const tagStats = calculateStatsByTag(habits, completions);

    // Create segments
    const segments: ChartDataPoint[] = tagStats.map((stat) => ({
      label: stat.tag,
      value: stat.totalCompleted,
      metadata: {
        completionRate: stat.completionRate,
        totalScheduled: stat.totalScheduled,
        habitCount: stat.habitCount,
      },
    }));

    // Sort by value descending
    segments.sort((a, b) => b.value - a.value);

    // Calculate total
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    return {
      segments,
      total,
    };
  }

  /**
   * Create monthly heatmap data for calendar chart
   * @param dailySummaries - Daily completion summary data
   * @param startDate - Start date for the chart
   * @param endDate - End date for the chart
   * @returns Formatted calendar heatmap data
   */
  prepareMonthlyHeatmapData(
    dailySummaries: DailyCompletionSummary[],
    startDate: string,
    endDate: string
  ): CalendarHeatmapData {
    // Create map of date to completion rate
    const dateMap = new Map<string, number>();

    // Fill map with completion rates
    for (const summary of dailySummaries) {
      const rate =
        summary.totalCount > 0
          ? summary.completedCount / summary.totalCount
          : 0;
      dateMap.set(summary.date, rate);
    }

    // Generate cells for all days in range
    const cells: HeatmapCell[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find min/max values for normalization
    let minValue = 1;
    let maxValue = 0;

    // Fill in days
    const current = new Date(start);
    let weekIndex = 0;
    let dayIndex = current.getDay();

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const completionRate = dateMap.get(dateStr) || 0;

      // Update min/max
      if (completionRate > 0 && completionRate < minValue) {
        minValue = completionRate;
      }
      if (completionRate > maxValue) {
        maxValue = completionRate;
      }

      // Create cell
      cells.push({
        x: dayIndex,
        y: weekIndex,
        value: completionRate, // Will normalize later
        originalValue: completionRate,
        date: dateStr,
      });

      // Move to next day
      current.setDate(current.getDate() + 1);
      dayIndex = current.getDay();

      // If we moved to a new week
      if (dayIndex === 0) {
        weekIndex++;
      }
    }

    // Handle case where all values are 0
    if (minValue === 1 && maxValue === 0) {
      minValue = 0;
      maxValue = 1;
    }

    // Normalize values between 0 and 1
    if (maxValue > minValue) {
      for (const cell of cells) {
        if (cell.originalValue === 0) {
          cell.value = 0;
        } else {
          cell.value = (cell.originalValue - minValue) / (maxValue - minValue);
        }
      }
    }

    // Generate month ranges
    const monthRanges = generateMonthRanges(startDate, endDate);

    return {
      cells,
      minValue,
      maxValue,
      dateRange: {
        startDate,
        endDate,
      },
      monthRanges,
    };
  }

  /**
   * Create individual habit trend chart data
   * @param habit - Habit data
   * @param completions - Completions for the habit
   * @param startDate - Start date for the chart
   * @param endDate - End date for the chart
   * @param granularity - Time granularity for grouping data
   * @returns Formatted line chart data
   */
  prepareHabitTrendData(
    habit: Habit,
    completions: Completion[],
    startDate: string,
    endDate: string,
    granularity: ChartGranularity = ChartGranularity.Daily
  ): LineChartData {
    // Filter completions by habit ID and date range
    const filteredCompletions = completions.filter(
      (completion) =>
        completion.habitId === habit.id &&
        completion.date >= startDate &&
        completion.date <= endDate
    );

    // Group completions by date based on granularity
    const groupedCompletions = this.groupCompletionsByGranularity(
      filteredCompletions,
      granularity
    );

    // Generate labels for the date range
    const labels = generateDateLabels(startDate, endDate, granularity);

    // Create data points
    const completionRates: TimeSeriesDataPoint[] = [];

    // Fill data for each date in the grouped completions
    for (const [dateStr, completionsInPeriod] of Object.entries(
      groupedCompletions
    )) {
      // Calculate completion rate for this period
      const totalInPeriod = completionsInPeriod.length;
      const completedInPeriod = completionsInPeriod.filter(
        (c) => c.completed
      ).length;
      const completionRate =
        totalInPeriod > 0 ? completedInPeriod / totalInPeriod : 0;

      // Format date for display
      const dateObj = new Date(dateStr);
      const formattedDate = formatChartDate(dateObj, granularity);

      completionRates.push({
        date: dateStr,
        label: formattedDate,
        value: Math.round(completionRate * 100), // Convert to percentage
        metadata: {
          totalCount: totalInPeriod,
          completedCount: completedInPeriod,
        },
      });
    }

    // Sort by date
    completionRates.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Create chart data
    const series: ChartSeries[] = [
      {
        name: habit.name,
        data: completionRates,
        color: ChartColorSchemes.default[0],
      },
    ];

    return {
      series,
      labels,
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Create comparison chart data between multiple habits
   * @param habits - Habits to compare
   * @param completions - All completions
   * @param startDate - Start date for the chart
   * @param endDate - End date for the chart
   * @param granularity - Time granularity for grouping data
   * @returns Formatted line chart data
   */
  prepareHabitsComparisonData(
    habits: Habit[],
    completions: Completion[],
    startDate: string,
    endDate: string,
    granularity: ChartGranularity = ChartGranularity.Daily
  ): LineChartData {
    // Generate labels for the date range
    const labels = generateDateLabels(startDate, endDate, granularity);

    // Create series for each habit
    const series: ChartSeries[] = [];

    habits.forEach((habit, index) => {
      // Filter completions for this habit
      const habitCompletions = completions.filter(
        (completion) =>
          completion.habitId === habit.id &&
          completion.date >= startDate &&
          completion.date <= endDate
      );

      // Group completions by date based on granularity
      const groupedCompletions = this.groupCompletionsByGranularity(
        habitCompletions,
        granularity
      );

      // Create data points
      const dataPoints: TimeSeriesDataPoint[] = [];

      // Fill data for each date in the grouped completions
      for (const [dateStr, completionsInPeriod] of Object.entries(
        groupedCompletions
      )) {
        // Calculate completion rate for this period
        const totalInPeriod = completionsInPeriod.length;
        const completedInPeriod = completionsInPeriod.filter(
          (c) => c.completed
        ).length;
        const completionRate =
          totalInPeriod > 0 ? completedInPeriod / totalInPeriod : 0;

        // Format date for display
        const dateObj = new Date(dateStr);
        const formattedDate = formatChartDate(dateObj, granularity);

        dataPoints.push({
          date: dateStr,
          label: formattedDate,
          value: Math.round(completionRate * 100), // Convert to percentage
          metadata: {
            totalCount: totalInPeriod,
            completedCount: completedInPeriod,
          },
        });
      }

      // Sort by date
      dataPoints.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      // Add series
      series.push({
        name: habit.name,
        data: dataPoints,
        color:
          ChartColorSchemes.default[index % ChartColorSchemes.default.length],
      });
    });

    return {
      series,
      labels,
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Group daily summaries by time granularity
   */
  private groupDataByGranularity(
    dailySummaries: DailyCompletionSummary[],
    granularity: ChartGranularity
  ): Record<string, DailyCompletionSummary[]> {
    const groupedData: Record<string, DailyCompletionSummary[]> = {};

    for (const summary of dailySummaries) {
      const date = new Date(summary.date);
      let groupKey: string;

      switch (granularity) {
        case ChartGranularity.Daily:
          groupKey = summary.date; // Keep original YYYY-MM-DD
          break;

        case ChartGranularity.Weekly:
          // Group by year and week number
          const year = date.getFullYear();
          const weekNumber = this.getISOWeek(date);
          groupKey = `${year}-W${weekNumber}`;
          break;

        case ChartGranularity.Monthly:
          // Group by year and month
          groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;

        case ChartGranularity.Quarterly:
          // Group by year and quarter
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          groupKey = `${date.getFullYear()}-Q${quarter}`;
          break;

        case ChartGranularity.Yearly:
          // Group by year
          groupKey = date.getFullYear().toString();
          break;

        default:
          groupKey = summary.date;
      }

      // Initialize array if not exists
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }

      // Add to group
      groupedData[groupKey].push(summary);
    }

    return groupedData;
  }

  /**
   * Group completions by time granularity
   */
  private groupCompletionsByGranularity(
    completions: Completion[],
    granularity: ChartGranularity
  ): Record<string, Completion[]> {
    const groupedData: Record<string, Completion[]> = {};

    for (const completion of completions) {
      const date = new Date(completion.date);
      let groupKey: string;

      switch (granularity) {
        case ChartGranularity.Daily:
          groupKey = completion.date; // Keep original YYYY-MM-DD
          break;

        case ChartGranularity.Weekly:
          // Group by year and week number
          const year = date.getFullYear();
          const weekNumber = this.getISOWeek(date);
          groupKey = `${year}-W${weekNumber}`;
          break;

        case ChartGranularity.Monthly:
          // Group by year and month
          groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;

        case ChartGranularity.Quarterly:
          // Group by year and quarter
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          groupKey = `${date.getFullYear()}-Q${quarter}`;
          break;

        case ChartGranularity.Yearly:
          // Group by year
          groupKey = date.getFullYear().toString();
          break;

        default:
          groupKey = completion.date;
      }

      // Initialize array if not exists
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }

      // Add to group
      groupedData[groupKey].push(completion);
    }

    return groupedData;
  }

  /**
   * Calculate ISO week number
   * (Duplicate from chartDateUtils to avoid circular dependencies)
   */
  private getISOWeek(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
