export interface Habit {
  id: string;
  name: string;
  description: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  goalType: "streak" | "counter";
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  motivationNote?: string;
  isActive: boolean;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value?: number;
  completedAt?: string;
}

export interface Note {
  id: string;
  date: string;
  content: string;
  mood: string;
  productivityLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
