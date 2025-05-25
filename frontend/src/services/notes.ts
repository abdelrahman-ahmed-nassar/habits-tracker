import { ApiService } from "@/services/api";

interface Note {
  id: string;
  date: string;
  content: string;
  mood: string;
  productivityLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteDto {
  date: string;
  content: string;
  mood: string;
  productivityLevel: string;
}

interface UpdateNoteDto {
  content: string;
  mood: string;
  productivityLevel: string;
}

class NotesService extends ApiService {
  async getAllNotes() {
    return this.get<Note[]>("/notes");
  }

  async getNoteByDate(date: string) {
    return this.get<Note>(`/notes/${date}`);
  }

  async createNote(data: CreateNoteDto) {
    return this.post<Note>("/notes", data);
  }

  async updateNote(id: string, data: UpdateNoteDto) {
    return this.put<Note>(`/notes/${id}`, data);
  }

  async deleteNote(id: string) {
    return this.delete<void>(`/notes/${id}`);
  }
}

export const notesService = new NotesService();
