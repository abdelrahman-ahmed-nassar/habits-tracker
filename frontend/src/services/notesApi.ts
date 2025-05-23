import { get, post, put, del } from "./api";
import { Note, CreateNoteDto, UpdateNoteDto } from "@/types";

export const notesApi = {
  // Get all notes
  getAll: async () => {
    return get<Note[]>("/notes");
  },

  // Get a note by ID
  getById: async (id: string) => {
    return get<Note>(`/notes/${id}`);
  },

  // Get a note by date
  getByDate: async (date: string) => {
    return get<Note>(`/notes/date/${date}`);
  },

  // Create a new note
  create: async (noteData: CreateNoteDto) => {
    return post<Note>("/notes", noteData);
  },

  // Update a note
  update: async (id: string, noteData: UpdateNoteDto) => {
    return put<Note>(`/notes/${id}`, noteData);
  },

  // Delete a note
  delete: async (id: string) => {
    return del<{ success: boolean }>(`/notes/${id}`);
  },
};
