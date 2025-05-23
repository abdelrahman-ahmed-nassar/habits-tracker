/**
 * Chart data interfaces for the Habits Tracker application
 */

/**
 * Generic chart data point interface
 */
export interface ChartDataPoint {
  /**
   * Label for the data point
   */
  label: string;

  /**
   * Value of the data point
   */
  value: number;

  /**
   * Optional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Time-series data point interface for charts with time dimension
 */
export interface TimeSeriesDataPoint extends ChartDataPoint {
  /**
   * Date string in ISO format (YYYY-MM-DD)
   */
  date: string;
}

/**
 * Series data for line and bar charts
 */
export interface ChartSeries {
  /**
   * Name of the data series
   */
  name: string;

  /**
   * Optional color for the series
   */
  color?: string;

  /**
   * Data points for this series
   */
  data: ChartDataPoint[];
}

/**
 * Line chart data format
 */
export interface LineChartData {
  /**
   * Chart series data
   */
  series: ChartSeries[];

  /**
   * X-axis labels
   */
  labels: string[];

  /**
   * Date range for the chart data
   */
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Bar chart data format
 */
export interface BarChartData {
  /**
   * Chart series data
   */
  series: ChartSeries[];

  /**
   * X-axis labels
   */
  labels: string[];

  /**
   * Whether the bars should be stacked
   */
  stacked?: boolean;
}

/**
 * Pie/donut chart data format
 */
export interface PieChartData {
  /**
   * Data segments for the pie chart
   */
  segments: ChartDataPoint[];

  /**
   * Total value (for percentage calculation)
   */
  total: number;
}

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
  /**
   * X-axis position (e.g., day of the week)
   */
  x: number;

  /**
   * Y-axis position (e.g., week number)
   */
  y: number;

  /**
   * Value intensity (0-1)
   */
  value: number;

  /**
   * Original value before normalization
   */
  originalValue?: number;

  /**
   * Date string in ISO format (YYYY-MM-DD)
   */
  date: string;
}

/**
 * Calendar heatmap data format
 */
export interface CalendarHeatmapData {
  /**
   * Matrix of heatmap cells
   */
  cells: HeatmapCell[];

  /**
   * Min value in the data set
   */
  minValue: number;

  /**
   * Max value in the data set
   */
  maxValue: number;

  /**
   * Date range for the heatmap
   */
  dateRange: {
    startDate: string;
    endDate: string;
  };

  /**
   * Month ranges in the heatmap
   */
  monthRanges: Array<{
    month: number;
    year: number;
    startIndex: number;
    endIndex: number;
    label: string;
  }>;
}

/**
 * Chart time granularity options
 */
export enum ChartGranularity {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  Yearly = "yearly",
}

/**
 * Chart time range presets
 */
export enum ChartTimeRange {
  Last7Days = "last7days",
  Last30Days = "last30days",
  Last90Days = "last90days",
  LastMonth = "lastmonth",
  LastQuarter = "lastquarter",
  LastYear = "lastyear",
  CurrentMonth = "currentmonth",
  CurrentYear = "currentyear",
  Custom = "custom",
}

/**
 * Chart color schemes
 */
export const ChartColorSchemes = {
  /**
   * Default color scheme for charts
   */
  default: [
    "#3f51b5",
    "#f44336",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#00bcd4",
    "#ffeb3b",
    "#795548",
  ],

  /**
   * Success/failure color scheme
   */
  success: ["#4caf50", "#f44336"],

  /**
   * Blues color scale
   */
  blues: [
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
  ],

  /**
   * Completion rate color scheme
   */
  completion: [
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
  ],
};
