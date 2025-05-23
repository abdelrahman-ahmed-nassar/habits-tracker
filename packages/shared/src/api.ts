/**
 * API request and response Data Transfer Objects (DTOs)
 */

import { Habit, HabitFilter } from "./habits";
import { Completion, CompletionFilter } from "./completions";
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
 * Response for completions list endpoint
 */
export interface CompletionsListResponse {
  completions: Completion[];
  filter?: CompletionFilter;
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
