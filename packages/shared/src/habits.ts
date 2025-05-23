/**
 * Habit-related interfaces and types for the Habits Tracker application
 */

/**
 * Enumeration of possible habit categories/tags
 */
export enum HabitTag {
  Health = "health",
  Work = "work",
  Personal = "personal",
  Learning = "learning",
  Social = "social",
  Fitness = "fitness",
  Mindfulness = "mindfulness",
  Finance = "finance",
  Other = "other",
}

/**
 * Enumeration of possible habit repetition patterns
 */
export enum RepetitionPattern {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

/**
 * Enumeration of possible habit goal types
 */
export enum GoalType {
  Counter = "counter", // For habits with numeric targets (e.g., drink 8 glasses of water)
  Streak = "streak", // For habits with streak goals (e.g., meditate for X days in a row)
}

/**
 * Represents the priority level of a habit
 */
export enum PriorityLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

/**
 * Interface for a habit entity
 */
export interface Habit {
  /**
   * Unique identifier for the habit
   */
  id: string;

  /**
   * Name of the habit
   */
  name: string;

  /**
   * Description of the habit (optional)
   */
  description?: string;

  /**
   * Category/tag for organizing habits
   */
  tag: HabitTag;

  /**
   * How frequently the habit should be performed
   */
  repetition: RepetitionPattern;

  /**
   * For weekly habits: which days of the week the habit should be performed
   * 0 = Sunday, 1 = Monday, etc.
   */
  specificDays?: number[];

  /**
   * For monthly habits: which dates of the month the habit should be performed
   * 1-31 for specific dates
   */
  specificDates?: number[];

  /**
   * The type of goal for this habit (counter or streak)
   */
  goalType: GoalType;

  /**
   * The target value for the goal (number of times or days in streak)
   */
  goalValue: number;

  /**
   * Priority level of the habit
   */
  priority?: PriorityLevel;

  /**
   * Whether the habit is active or archived
   */
  archived: boolean;

  /**
   * ISO date string when the habit was created
   */
  createdAt: string;

  /**
   * ISO date string when the habit was last updated
   */
  updatedAt: string;

  /**
   * Optional color for UI representation
   * Should be a valid CSS color string
   */
  color?: string;

  /**
   * Optional icon name for UI representation
   */
  icon?: string;

  /**
   * Optional start date for the habit (ISO date string)
   */
  startDate?: string;

  /**
   * Optional end date for the habit (ISO date string)
   */
  endDate?: string;
}

/**
 * Interface for habit filter criteria
 */
export interface HabitFilter {
  tags?: HabitTag[];
  includeArchived?: boolean;
  repetition?: RepetitionPattern;
  searchTerm?: string;
}

/**
 * Type guard to check if an object is a valid Habit
 */
export function isHabit(obj: unknown): obj is Habit {
  const habit = obj as Partial<Habit>;
  return (
    typeof habit === "object" &&
    habit !== null &&
    typeof habit.id === "string" &&
    typeof habit.name === "string" &&
    Object.values(HabitTag).includes(habit.tag as HabitTag) &&
    Object.values(RepetitionPattern).includes(
      habit.repetition as RepetitionPattern
    ) &&
    Object.values(GoalType).includes(habit.goalType as GoalType) &&
    typeof habit.goalValue === "number" &&
    typeof habit.createdAt === "string" &&
    typeof habit.updatedAt === "string"
  );
}
