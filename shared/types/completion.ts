export interface CompletionRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // for counter-type goals
  completedAt: string;
}
