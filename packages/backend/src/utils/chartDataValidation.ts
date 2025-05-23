/**
 * Chart data validation utilities
 */
import {
  LineChartData,
  BarChartData,
  PieChartData,
  CalendarHeatmapData,
  ChartDataPoint,
  ChartSeries,
  HeatmapCell,
} from "../../../shared/src/charts";

/**
 * Ensure chart data is valid and well-formed
 */
export class ChartDataValidator {
  /**
   * Validate line chart data
   * @param data Line chart data to validate
   * @returns Valid line chart data (with corrections if needed)
   */
  validateLineChartData(data: LineChartData): LineChartData {
    // Create a copy to avoid mutation of the original
    const validData = structuredClone(data);

    // Ensure series exists
    if (!Array.isArray(validData.series)) {
      validData.series = [];
    }

    // Validate each series
    validData.series = validData.series.map((series) =>
      this.validateChartSeries(series)
    );

    // Ensure labels exist
    if (!Array.isArray(validData.labels)) {
      validData.labels = [];
    }

    // If date range is missing, try to infer from data
    if (!validData.dateRange && validData.series.length > 0) {
      const allDates = validData.series
        .flatMap((series) => series.data)
        .filter((point) => "date" in point)
        .map((point) => (point as any).date as string)
        .filter(Boolean);

      if (allDates.length > 0) {
        validData.dateRange = {
          startDate: allDates.reduce((a, b) => (a < b ? a : b)),
          endDate: allDates.reduce((a, b) => (a > b ? a : b)),
        };
      }
    }

    return validData;
  }

  /**
   * Validate bar chart data
   * @param data Bar chart data to validate
   * @returns Valid bar chart data (with corrections if needed)
   */
  validateBarChartData(data: BarChartData): BarChartData {
    // Create a copy to avoid mutation of the original
    const validData = structuredClone(data);

    // Ensure series exists
    if (!Array.isArray(validData.series)) {
      validData.series = [];
    }

    // Validate each series
    validData.series = validData.series.map((series) =>
      this.validateChartSeries(series)
    );

    // Ensure labels exist
    if (!Array.isArray(validData.labels)) {
      validData.labels = [];
    }

    // Ensure each series has data for each label
    if (validData.labels.length > 0) {
      validData.series.forEach((series) => {
        if (series.data.length < validData.labels.length) {
          // Fill missing data points with zeros
          const existingLabels = new Set(
            series.data.map((point) => point.label)
          );

          validData.labels.forEach((label) => {
            if (!existingLabels.has(label)) {
              series.data.push({
                label,
                value: 0,
              });
            }
          });
        }
      });
    }

    // Set default stacked property if missing
    if (validData.stacked === undefined) {
      validData.stacked = false;
    }

    return validData;
  }

  /**
   * Validate pie chart data
   * @param data Pie chart data to validate
   * @returns Valid pie chart data (with corrections if needed)
   */
  validatePieChartData(data: PieChartData): PieChartData {
    // Create a copy to avoid mutation of the original
    const validData = structuredClone(data);

    // Ensure segments exist
    if (!Array.isArray(validData.segments)) {
      validData.segments = [];
    }

    // Validate each data point
    validData.segments = validData.segments.map((segment) =>
      this.validateDataPoint(segment)
    );

    // Filter out zero or negative values
    validData.segments = validData.segments.filter(
      (segment) => segment.value > 0
    );

    // If total is missing or invalid, calculate from segments
    if (typeof validData.total !== "number" || validData.total <= 0) {
      validData.total = validData.segments.reduce(
        (sum, segment) => sum + segment.value,
        0
      );
    }

    // If total is zero, set it to a default value to avoid division by zero
    if (validData.total === 0) {
      validData.total = 1;
    }

    return validData;
  }

  /**
   * Validate calendar heatmap data
   * @param data Heatmap data to validate
   * @returns Valid heatmap data (with corrections if needed)
   */
  validateCalendarHeatmapData(data: CalendarHeatmapData): CalendarHeatmapData {
    // Create a copy to avoid mutation of the original
    const validData = structuredClone(data);

    // Ensure cells exist
    if (!Array.isArray(validData.cells)) {
      validData.cells = [];
    }

    // Validate each cell
    validData.cells = validData.cells.map((cell) =>
      this.validateHeatmapCell(cell)
    );

    // Ensure min and max values are valid
    if (typeof validData.minValue !== "number") {
      validData.minValue = 0;
    }

    if (typeof validData.maxValue !== "number") {
      const maxValue = validData.cells.reduce(
        (max, cell) => Math.max(max, cell.value, cell.originalValue || 0),
        0
      );
      validData.maxValue = maxValue > 0 ? maxValue : 1;
    }

    // Ensure date range exists
    if (!validData.dateRange) {
      const dates = validData.cells
        .map((cell) => cell.date)
        .filter(Boolean)
        .sort();

      validData.dateRange = {
        startDate:
          dates.length > 0 ? dates[0] : new Date().toISOString().split("T")[0],
        endDate:
          dates.length > 0
            ? dates[dates.length - 1]
            : new Date().toISOString().split("T")[0],
      };
    }

    // Ensure month ranges exist
    if (
      !Array.isArray(validData.monthRanges) ||
      validData.monthRanges.length === 0
    ) {
      validData.monthRanges = [];

      // Simple fallback for missing month ranges
      if (validData.dateRange) {
        const startDate = new Date(validData.dateRange.startDate);
        const endDate = new Date(validData.dateRange.endDate);

        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();

        // Calculate approximate month positions
        const totalDays =
          Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        let currentMonth = startMonth;
        let currentYear = startYear;
        let daysSoFar = 0;

        while (
          currentYear < endYear ||
          (currentYear === endYear && currentMonth <= endMonth)
        ) {
          const daysInMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
          ).getDate();

          validData.monthRanges.push({
            month: currentMonth,
            year: currentYear,
            startIndex: daysSoFar,
            endIndex: daysSoFar + daysInMonth - 1,
            label: `${currentMonth + 1}/${currentYear}`,
          });

          daysSoFar += daysInMonth;

          // Move to next month
          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }
      }
    }

    return validData;
  }

  /**
   * Validate a chart series
   * @param series Series to validate
   * @returns Validated series
   */
  private validateChartSeries(series: ChartSeries): ChartSeries {
    // Create a copy
    const validSeries: ChartSeries = {
      name: series.name || "Unnamed Series",
      color: series.color,
      data: Array.isArray(series.data)
        ? series.data.map((point) => this.validateDataPoint(point))
        : [],
    };

    return validSeries;
  }

  /**
   * Validate a chart data point
   * @param point Data point to validate
   * @returns Validated data point
   */
  private validateDataPoint(point: ChartDataPoint): ChartDataPoint {
    // Create a copy
    const validPoint: ChartDataPoint = {
      label: point.label || "Unlabeled",
      value: typeof point.value === "number" ? point.value : 0,
      metadata: point.metadata || {},
    };

    return validPoint;
  }

  /**
   * Validate a heatmap cell
   * @param cell Heatmap cell to validate
   * @returns Validated heatmap cell
   */
  private validateHeatmapCell(cell: HeatmapCell): HeatmapCell {
    // Create a copy
    const validCell: HeatmapCell = {
      x: typeof cell.x === "number" ? cell.x : 0,
      y: typeof cell.y === "number" ? cell.y : 0,
      value:
        typeof cell.value === "number"
          ? Math.max(0, Math.min(1, cell.value))
          : 0, // Ensure value is between 0-1
      originalValue:
        typeof cell.originalValue === "number"
          ? cell.originalValue
          : cell.value,
      date: cell.date || new Date().toISOString().split("T")[0],
    };

    return validCell;
  }
}
