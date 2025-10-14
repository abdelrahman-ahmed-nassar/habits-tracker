export interface DailyNote {
    id: string;
    date: string;
    content: string;
    mood?: string;
    productivityLevel?: string;
    createdAt: string;
    updatedAt: string;
}
export type { DailyNote as default };
