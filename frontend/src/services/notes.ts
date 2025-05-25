import { DailyNote } from "../../../shared/types";
import { ApiResponse } from "../types";
import apiService from "./api";

interface NoteCreate {
  date: string;
  content: string;
  mood: string;
  productivityLevel: string;
}

interface NoteUpdate {
  content: string;
  mood: string;
  productivityLevel: string;
}

class NotesService {
  private readonly baseUrl = "/notes";

  async getAll(): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(this.baseUrl);
  }

  async getById(id: string): Promise<ApiResponse<DailyNote>> {
    return apiService.get<DailyNote>(`${this.baseUrl}/${id}`);
  }

  async getByHabit(habitId: string): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/habit/${habitId}`);
  }

  async getByDate(date: string): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/date/${date}`);
  }

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/range`, {
      params: { startDate, endDate },
    });
  }

  async create(note: NoteCreate): Promise<ApiResponse<DailyNote>> {
    return apiService.post<DailyNote>(this.baseUrl, note);
  }

  async update(id: string, note: NoteUpdate): Promise<ApiResponse<DailyNote>> {
    return apiService.put<DailyNote>(`${this.baseUrl}/${id}`, note);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  async search(query: string): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/search`, {
      params: { q: query },
    });
  }

  async getLatest(limit: number = 10): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/latest`, {
      params: { limit },
    });
  }

  async getByTag(tag: string): Promise<ApiResponse<DailyNote[]>> {
    return apiService.get<DailyNote[]>(`${this.baseUrl}/tag/${tag}`);
  }
}

export const notesService = new NotesService();
export default notesService;
