export interface CompletionRecord {
    id: string;
    habitId: string;
    date: string;
    completed: boolean;
    value?: number;
    completedAt: string;
}
export type { CompletionRecord as default };
