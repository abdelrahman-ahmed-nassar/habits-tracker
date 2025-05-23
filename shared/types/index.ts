export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customFrequency?: number;
  startDate: string;
  endDate?: string;
  targetDays?: string[];
  targetCount: number;
  color?: string;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  habitId?: string;
  startDate: string;
  endDate: string;
  completionRate: number;
  streakCurrent: number;
  streakLongest: number;
  totalCompletions: number;
}
