import { CompletionRecord } from "../../../shared/types";
import { ApiResponse } from "../types";
import apiService from "./api";

interface CompletionCreate {
  habitId: string;
  date: string;
}

interface BatchCompletionCreate {
  habitId: string;
  dates: string[];
}

class CompletionsService {
  private readonly baseUrl = "/completions";

  async getByHabit(habitId: string): Promise<ApiResponse<CompletionRecord[]>> {
    return apiService.get<CompletionRecord[]>(
      `${this.baseUrl}/habit/${habitId}`
    );
  }

  async getByDate(date: string): Promise<ApiResponse<CompletionRecord[]>> {
    return apiService.get<CompletionRecord[]>(`${this.baseUrl}/date/${date}`);
  }

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<CompletionRecord[]>> {
    return apiService.get<CompletionRecord[]>(`${this.baseUrl}/range`, {
      params: { startDate, endDate },
    });
  }

  async create(
    habitId: string,
    completion: CompletionCreate
  ): Promise<ApiResponse<CompletionRecord>> {
    return apiService.post<CompletionRecord>(
      `${this.baseUrl}/habit/${habitId}`,
      completion
    );
  }

  async delete(habitId: string, date: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(
      `${this.baseUrl}/habit/${habitId}/date/${date}`
    );
  }

  async batchCreate(
    completions: BatchCompletionCreate[]
  ): Promise<ApiResponse<CompletionRecord[]>> {
    return apiService.post<CompletionRecord[]>(
      `${this.baseUrl}/batch`,
      completions
    );
  }

  async batchDelete(
    habitId: string,
    dates: string[]
  ): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/habit/${habitId}/batch`, {
      params: { dates: dates.join(",") },
    });
  }

  async toggle(
    habitId: string,
    date: string
  ): Promise<ApiResponse<CompletionRecord>> {
    return apiService.patch<CompletionRecord>(
      `${this.baseUrl}/habit/${habitId}/toggle`,
      { date }
    );
  }

  async getStreak(
    habitId: string
  ): Promise<ApiResponse<{ current: number; best: number }>> {
    return apiService.get<{ current: number; best: number }>(
      `${this.baseUrl}/habit/${habitId}/streak`
    );
  }

  async getStats(habitId: string): Promise<
    ApiResponse<{
      totalCompletions: number;
      completionRate: number;
      currentStreak: number;
      bestStreak: number;
      lastCompletion: string | null;
    }>
  > {
    return apiService.get(`${this.baseUrl}/habit/${habitId}/stats`);
  }
}

export const completionsService = new CompletionsService();
export default completionsService;
