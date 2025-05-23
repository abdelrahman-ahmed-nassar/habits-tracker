/**
 * Completion-related interfaces and types for tracking habit completion
 */

/**
 * Represents a single habit completion record
 */
export interface Completion {
  /**
   * Unique identifier for the completion record
   */
  id: string;

  /**
   * Reference to the habit ID this completion is for
   */
  habitId: string;

  /**
   * Date of the completion in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Whether the habit was completed or not
   */
  completed: boolean;

  /**
   * Optional numeric value for counter-type habits
   * Represents how many times the habit was completed
   */
  value?: number;

  /**
   * ISO datetime string of when the completion was recorded
   */
  timestamp: string;

  /**
   * Optional notes about the completion
   */
  notes?: string;
}

/**
 * Represents streak information for a habit
 */
export interface StreakInfo {
  /**
   * Reference to the habit ID
   */
  habitId: string;

  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Longest recorded streak for this habit
   */
  longestStreak: number;

  /**
   * ISO date string of last completed date or null if never completed
   */
  lastCompletedDate: string | null;

  /**
   * Start date of the current streak in ISO format (YYYY-MM-DD)
   */
  currentStreakStartDate: string | null;
}

/**
 * Filter criteria for querying completions
 */
export interface CompletionFilter {
  /**
   * Optional habit ID to filter completions for a specific habit
   */
  habitId?: string;

  /**
   * Optional start date range in ISO format (YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * Optional end date range in ISO format (YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Optional filter for completion status
   */
  completed?: boolean;
}

/**
 * Summary of completions for a given day
 */
export interface DailyCompletionStatus {
  /**
   * Date in ISO format (YYYY-MM-DD)
   */
  date: string;

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
}

/**
 * Type guard to check if an object is a valid Completion
 */
export function isCompletion(obj: unknown): obj is Completion {
  const completion = obj as Partial<Completion>;
  return (
    typeof completion === "object" &&
    completion !== null &&
    typeof completion.id === "string" &&
    typeof completion.habitId === "string" &&
    typeof completion.date === "string" &&
    typeof completion.completed === "boolean" &&
    typeof completion.timestamp === "string" &&
    (completion.value === undefined || typeof completion.value === "number") &&
    (completion.notes === undefined || typeof completion.notes === "string")
  );
}
