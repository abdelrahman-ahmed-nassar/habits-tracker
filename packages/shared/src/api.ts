/**
 * API request and response Data Transfer Objects (DTOs)
 */

import { Habit, HabitFilter } from "./habits";
import {
  Completion,
  CompletionFilter,
  StreakInfo,
  DailyCompletionStatus,
} from "./completions";
import { DailyNote, HabitMotivation, NoteFilter } from "./notes";
import { AnalyticsParams, AnalyticsSummary } from "./analytics";
import { AppSettings, UserSettings } from "./settings";

/**
 * Base response interface for all API responses
 */
export interface ApiResponse<T> {
  /**
   * Response data
   */
  data: T;

  /**
   * Success status
   */
  success: boolean;

  /**
   * Response message
   */
  message?: string;
}

/**
 * Error response interface
 */
export interface ApiErrorResponse {
  /**
   * Error message
   */
  message: string;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Error details
   */
  details?: unknown;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  /**
   * Page number (1-based)
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for the current page
   */
  items: T[];

  /**
   * Total number of items across all pages
   */
  totalItems: number;

  /**
   * Current page number
   */
  currentPage: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}

// ===================
// Habit DTOs
// ===================

/**
 * DTO for creating a new habit
 */
export type CreateHabitDto = Omit<Habit, "id" | "createdAt" | "updatedAt">;

/**
 * DTO for updating an existing habit
 */
export type UpdateHabitDto = Partial<
  Omit<Habit, "id" | "createdAt" | "updatedAt">
>;

/**
 * Response for habit list endpoint
 */
export interface HabitsListResponse {
  habits: Habit[];
  filter?: HabitFilter;
}

// ===================
// Completion DTOs
// ===================

/**
 * DTO for creating a completion record
 */
export type CreateCompletionDto = Omit<Completion, "id" | "timestamp">;

/**
 * DTO for updating a completion record
 */
export type UpdateCompletionDto = Partial<
  Omit<Completion, "id" | "habitId" | "date" | "timestamp">
>;

/**
 * DTO for completing a habit
 */
export interface CompleteHabitDto {
  /**
   * Date for the completion in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Optional value for counter-type habits
   */
  value?: number;

  /**
   * Optional notes for the completion
   */
  notes?: string;
}

/**
 * DTO for bulk habit completion
 */
export interface BulkCompleteDto {
  /**
   * Habit ID to mark as complete
   */
  habitId: string;

  /**
   * Date for the completion in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Whether to mark as completed (true) or uncompleted (false)
   */
  completed?: boolean;

  /**
   * Optional value for counter-type habits
   */
  value?: number;

  /**
   * Optional notes for the completion
   */
  notes?: string;
}

/**
 * Response for completions list endpoint
 */
export interface CompletionsListResponse {
  completions: Completion[];
  filter?: CompletionFilter;
}

/**
 * Statistics for completion history
 */
export interface CompletionStatistics {
  /**
   * Total number of completions
   */
  totalCompletions: number;

  /**
   * Completion rate as a decimal (0-1)
   */
  completionRate: number;

  /**
   * Streak information for the habit
   */
  streakData: StreakInfo;
}

/**
 * Response for habit completion history
 */
export interface CompletionHistoryResponse {
  /**
   * The habit details
   */
  habit: Habit;

  /**
   * Array of completion records
   */
  completions: Completion[];

  /**
   * Completion statistics
   */
  statistics: CompletionStatistics;
}

/**
 * Response for daily completions
 */
export interface DailyCompletionsResponse {
  /**
   * The date in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Array of completion records for the day
   */
  completions: Completion[];

  /**
   * Summary of completions for the day
   */
  summary: {
    /**
     * Total number of habits scheduled for this date
     */
    totalHabits: number;

    /**
     * Number of completed habits
     */
    completedHabits: number;

    /**
     * Completion rate as a decimal (0-1)
     */
    completionRate: number;
  };
}

/**
 * Aggregate statistics for a date range of completions
 */
export interface CompletionRangeStats {
  /**
   * Total number of habits tracked in this period
   */
  totalHabits: number;

  /**
   * Total number of completions in this period
   */
  totalCompletions: number;

  /**
   * Average completion rate across the period
   */
  averageCompletionRate: number;
}

/**
 * Response for completions in a date range
 */
export interface CompletionRangeResponse {
  /**
   * Start date of the range in ISO format (YYYY-MM-DD)
   */
  startDate: string;

  /**
   * End date of the range in ISO format (YYYY-MM-DD)
   */
  endDate: string;

  /**
   * All completions in the date range
   */
  completions: Completion[];

  /**
   * Daily summaries for each day in the range
   */
  dailySummaries: DailyCompletionStatus[];

  /**
   * Aggregate statistics for the date range
   */
  aggregateStats: CompletionRangeStats;
}

// ===================
// Notes DTOs
// ===================

/**
 * DTO for creating a daily note
 */
export type CreateDailyNoteDto = Omit<
  DailyNote,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * DTO for updating a daily note
 */
export type UpdateDailyNoteDto = Partial<
  Omit<DailyNote, "id" | "date" | "createdAt" | "updatedAt">
>;

/**
 * DTO for creating a habit motivation
 */
export type CreateHabitMotivationDto = Omit<
  HabitMotivation,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * DTO for updating a habit motivation
 */
export type UpdateHabitMotivationDto = Partial<
  Omit<HabitMotivation, "id" | "habitId" | "createdAt" | "updatedAt">
>;

// ===================
// Settings DTOs
// ===================

/**
 * DTO for updating user settings
 */
export type UpdateUserSettingsDto = Partial<UserSettings>;

/**
 * DTO for updating app settings
 */
export type UpdateAppSettingsDto = Partial<AppSettings>;

/**
 * Data backup request
 */
export interface BackupRequestDto {
  /**
   * Custom backup path (optional)
   */
  backupPath?: string;

  /**
   * Whether to include all data types
   */
  includeAll: boolean;

  /**
   * Specific data types to include (if includeAll is false)
   */
  include?: ("habits" | "completions" | "notes" | "settings")[];
}

/**
 * Data import request
 */
export interface ImportRequestDto {
  /**
   * Path to the import file
   */
  importPath: string;

  /**
   * Whether to clear existing data before import
   */
  clearExisting: boolean;
}

/**
 * Type guard to check if an object is a valid ApiErrorResponse
 */
export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  const error = obj as Partial<ApiErrorResponse>;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof error.message === "string" &&
    typeof error.statusCode === "number"
  );
}
