/**
 * Notes-related interfaces and types for the Habits Tracker application
 */

/**
 * Represents a daily note entry
 */
export interface DailyNote {
  /**
   * Unique identifier for the note
   */
  id: string;

  /**
   * Date associated with the note in ISO format (YYYY-MM-DD)
   */
  date: string;

  /**
   * Note content text
   */
  content: string;

  /**
   * Optional title for the note
   */
  title?: string;

  /**
   * ISO datetime string of when the note was created
   */
  createdAt: string;

  /**
   * ISO datetime string of when the note was last updated
   */
  updatedAt: string;

  /**
   * Optional tags for categorizing notes
   */
  tags?: string[];

  /**
   * Optional mood rating (1-5)
   */
  mood?: number;
}

/**
 * Represents a motivation entry attached to a specific habit
 */
export interface HabitMotivation {
  /**
   * Unique identifier for the motivation entry
   */
  id: string;

  /**
   * Reference to the associated habit ID
   */
  habitId: string;

  /**
   * Motivation content text
   */
  content: string;

  /**
   * ISO datetime string of when the motivation was created
   */
  createdAt: string;

  /**
   * ISO datetime string of when the motivation was last updated
   */
  updatedAt: string;

  /**
   * Optional source or attribution for the motivation
   */
  source?: string;

  /**
   * Optional image URL associated with the motivation
   */
  imageUrl?: string;
}

/**
 * Represents a filter for querying notes
 */
export interface NoteFilter {
  /**
   * Optional start date in ISO format (YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * Optional end date in ISO format (YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Optional search term to filter notes by content
   */
  searchTerm?: string;

  /**
   * Optional tags to filter notes by
   */
  tags?: string[];
}

/**
 * Type guard to check if an object is a valid DailyNote
 */
export function isDailyNote(obj: unknown): obj is DailyNote {
  const note = obj as Partial<DailyNote>;
  return (
    typeof note === "object" &&
    note !== null &&
    typeof note.id === "string" &&
    typeof note.date === "string" &&
    typeof note.content === "string" &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string"
  );
}

/**
 * Type guard to check if an object is a valid HabitMotivation
 */
export function isHabitMotivation(obj: unknown): obj is HabitMotivation {
  const motivation = obj as Partial<HabitMotivation>;
  return (
    typeof motivation === "object" &&
    motivation !== null &&
    typeof motivation.id === "string" &&
    typeof motivation.habitId === "string" &&
    typeof motivation.content === "string" &&
    typeof motivation.createdAt === "string" &&
    typeof motivation.updatedAt === "string"
  );
}

/**
 * Notes interfaces for the Habits Tracker application
 */

/**
 * Note interface representing a user note for a habit
 */
export interface Note {
  /**
   * Unique identifier for the note
   */
  id: string;

  /**
   * The habit ID this note is associated with
   */
  habitId: string;

  /**
   * Date the note is for (ISO string YYYY-MM-DD)
   */
  date: string;

  /**
   * Note content
   */
  content: string;

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last update timestamp
   */
  updatedAt: string;
}
