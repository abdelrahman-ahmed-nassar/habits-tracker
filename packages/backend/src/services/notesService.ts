/**
 * Notes Service
 * Manages habit notes data
 */
import { Note } from "../../../shared/src/notes";

/**
 * Service for managing habit notes
 */
export class NotesService {
  private notes: Note[] = [];

  /**
   * Get all notes
   */
  async getAllNotes(): Promise<Note[]> {
    // In a real app, this would fetch from a database
    return this.notes;
  }

  /**
   * Get a note by ID
   */
  async getNoteById(id: string): Promise<Note | null> {
    // In a real app, this would fetch from a database
    const note = this.notes.find((note) => note.id === id);
    return note || null;
  }

  /**
   * Create a new note
   */
  async createNote(note: Omit<Note, "id">): Promise<Note> {
    // In a real app, this would save to a database
    const newNote: Note = {
      ...note,
      id: Math.random().toString(36).substring(2, 15),
    };

    this.notes.push(newNote);
    return newNote;
  }

  /**
   * Update a note
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    // In a real app, this would update in a database
    const index = this.notes.findIndex((note) => note.id === id);

    if (index === -1) {
      return null;
    }

    const updatedNote = {
      ...this.notes[index],
      ...updates,
      id, // Ensure ID remains the same
    };

    this.notes[index] = updatedNote;
    return updatedNote;
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<boolean> {
    // In a real app, this would delete from a database
    const initialLength = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== id);
    return this.notes.length < initialLength;
  }
}
