import { Habit } from "../../../shared/types";
import { ApiResponse } from "../types";
import apiService from "./api";

// Frontend-specific types
interface HabitCreate {
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  goalType: "counter" | "streak";
  goalValue: number;
  motivationNote?: string;
}

type HabitUpdate = Partial<HabitCreate>;

class HabitsService {
  private readonly baseUrl = "/habits";

  async getAll(): Promise<ApiResponse<Habit[]>> {
    return apiService.get<Habit[]>(this.baseUrl);
  }

  async getById(id: string): Promise<ApiResponse<Habit>> {
    return apiService.get<Habit>(`${this.baseUrl}/${id}`);
  }

  async create(habit: HabitCreate): Promise<ApiResponse<Habit>> {
    return apiService.post<Habit>(this.baseUrl, habit);
  }

  async update(id: string, habit: HabitUpdate): Promise<ApiResponse<Habit>> {
    return apiService.put<Habit>(`${this.baseUrl}/${id}`, habit);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  async getByCategory(categoryId: string): Promise<ApiResponse<Habit[]>> {
    return apiService.get<Habit[]>(`${this.baseUrl}/category/${categoryId}`);
  }

  async search(query: string): Promise<ApiResponse<Habit[]>> {
    return apiService.get<Habit[]>(`${this.baseUrl}/search`, {
      params: { q: query },
    });
  }

  async getActive(): Promise<ApiResponse<Habit[]>> {
    return apiService.get<Habit[]>(`${this.baseUrl}/active`);
  }

  async getArchived(): Promise<ApiResponse<Habit[]>> {
    return apiService.get<Habit[]>(`${this.baseUrl}/archived`);
  }

  async archive(id: string): Promise<ApiResponse<Habit>> {
    return apiService.patch<Habit>(`${this.baseUrl}/${id}/archive`);
  }

  async unarchive(id: string): Promise<ApiResponse<Habit>> {
    return apiService.patch<Habit>(`${this.baseUrl}/${id}/unarchive`);
  }
}

export const habitsService = new HabitsService();
export default habitsService;
