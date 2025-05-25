export interface CompletionRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // for counter-type goals
  completedAt: string;
}

// Re-export for backward compatibility
export type { CompletionRecord as default };
