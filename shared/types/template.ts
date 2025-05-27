export interface NoteTemplate {
  id: string;
  name: string;
  template: string;
  createdAt?: string;
  updatedAt?: string;
}

// Re-export for backward compatibility
export type { NoteTemplate as default };
