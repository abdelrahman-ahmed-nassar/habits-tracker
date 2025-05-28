import { DailyNote } from '@shared/types/note';

const API_BASE_URL = 'http://localhost:5002/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}



export class NotesService {
  /**
   * Get all notes
   */
  static async getAllNotes(): Promise<DailyNote[]> {
    const response = await fetch(`${API_BASE_URL}/notes`);
    const result: ApiResponse<DailyNote[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch notes');
    }
    
    return result.data;
  }

  /**
   * Get note by date
   * @param date - Date in YYYY-MM-DD format
   */
  static async getNoteByDate(date: string): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes/${date}`);
    const result: ApiResponse<DailyNote> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch note');
    }
    
    return result.data;
  }

  /**
   * Create a new note
   */
  static async createNote(note: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    
    const result: ApiResponse<DailyNote> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create note');
    }
    
    return result.data;
  }

  /**
   * Update an existing note
   */
  static async updateNote(id: string, note: Partial<Omit<DailyNote, 'id' | 'date' | 'createdAt' | 'updatedAt'>>): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    
    const result: ApiResponse<DailyNote> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update note');
    }
    
    return result.data;
  }

  /**
   * Delete a note
   */
  static async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete note');
    }
  }

  /**
   * Get available moods
   */
  static async getMoods(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/options/moods`);
    const result: ApiResponse<string[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch moods');
    }
    
    return result.data;
  }

  /**
   * Add a new mood
   */
  static async addMood(mood: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/options/moods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood }),
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to add mood');
    }
  }

  /**
   * Remove a mood
   */
  static async removeMood(mood: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/options/moods/${encodeURIComponent(mood)}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to remove mood');
    }
  }

  /**
   * Get available productivity levels
   */
  static async getProductivityLevels(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/options/productivity-levels`);
    const result: ApiResponse<string[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch productivity levels');
    }
    
    return result.data;
  }

  /**
   * Add a new productivity level
   */
  static async addProductivityLevel(level: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/options/productivity-levels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level }),
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to add productivity level');
    }
  }

  /**
   * Remove a productivity level
   */
  static async removeProductivityLevel(level: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/options/productivity-levels/${encodeURIComponent(level)}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to remove productivity level');
    }
  }
}