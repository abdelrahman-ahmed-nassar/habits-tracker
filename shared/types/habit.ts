export interface Habit {
  id: string;
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[]; // weekdays (0-6) or month dates (1-31)
  goalType: "counter" | "streak";
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  motivationNote?: string;
  isActive: boolean;
}
