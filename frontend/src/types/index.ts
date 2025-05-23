// Re-export shared types from the backend
export * from "../../../shared/types";

// Frontend-specific types
export interface ThemeMode {
  mode: "light" | "dark" | "system";
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  preferences?: {
    theme: ThemeMode["mode"];
    notifications: boolean;
  };
}

// Habit Types
export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: number[];
  createdAt: string;
  updatedAt: string;
  color?: string;
  icon?: string;
  priority?: "low" | "medium" | "high";
  reminderTime?: string;
}

export interface CreateHabitDto {
  name: string;
  description: string;
  category: string;
  frequency: number[];
  color?: string;
  icon?: string;
  priority?: "low" | "medium" | "high";
  reminderTime?: string;
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {}

// Habit Completion Types
export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateCompletionDto {
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

// Note Types
export interface Note {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  date: string;
  content: string;
}

export interface UpdateNoteDto {
  content: string;
}

// Analytics Types
export interface AnalyticsOverview {
  totalHabits: number;
  completionRate: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  weeklyData: {
    week: string;
    completed: number;
    total: number;
  }[];
  habitDistribution: {
    category: string;
    count: number;
  }[];
  topHabits: {
    habitId: string;
    name: string;
    completionRate: number;
  }[];
}

export interface HabitAnalytics {
  habitId: string;
  name: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  dailyData: {
    date: string;
    completed: boolean;
  }[];
}

export interface DailyAnalytics {
  date: string;
  completionRate: number;
  habits: {
    id: string;
    name: string;
    completed: boolean;
    streak: number;
  }[];
}

export interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  completionRate: number;
  dailyData: {
    date: string;
    completed: number;
    total: number;
  }[];
  habits: {
    id: string;
    name: string;
    completed: number;
    total: number;
  }[];
}

export interface MonthlyAnalytics {
  year: number;
  month: number;
  completionRate: number;
  weeklyData: {
    week: string;
    completed: number;
    total: number;
  }[];
  habits: {
    id: string;
    name: string;
    completed: number;
    total: number;
  }[];
}
