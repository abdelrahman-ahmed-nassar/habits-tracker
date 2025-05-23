/**
 * Habit-related interfaces and types
 */

export enum HabitTag {
  Health = "health",
  Work = "work",
  Personal = "personal",
  Learning = "learning",
  Social = "social",
  Other = "other",
}

export enum RepetitionPattern {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export enum GoalType {
  Counter = "counter",
  Streak = "streak",
}

export interface Habit {
  id: string;
  name: string;
  tag: HabitTag;
  repetition: RepetitionPattern;
  specificDays?: number[]; // 0 = Sunday, 1 = Monday, etc. (for weekly repetition)
  specificDates?: number[]; // 1-31 for monthly repetition
  goalType: GoalType;
  goalValue: number; // target count or streak days
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  color?: string; // Optional color for UI
  icon?: string; // Optional icon name
  archived?: boolean; // Whether the habit is archived
}
