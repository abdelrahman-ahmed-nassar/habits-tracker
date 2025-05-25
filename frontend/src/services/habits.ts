import { ApiService } from "@/services/api";
import type { Habit } from "@shared/types/habit";
import type { CreateHabitDto } from "@shared/types/api";

interface UpdateHabitDto extends Partial<CreateHabitDto> {}

interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
}

interface CreateCompletionDto {
  date: string;
}

class HabitsService extends ApiService {
  async getAllHabits() {
    return this.get<Habit[]>("/habits");
  }

  async getHabit(id: string) {
    return this.get<Habit>(`/habits/${id}`);
  }

  async createHabit(data: CreateHabitDto) {
    return this.post<Habit>("/habits", data);
  }

  async updateHabit(id: string, data: UpdateHabitDto) {
    return this.put<Habit>(`/habits/${id}`, data);
  }

  async deleteHabit(id: string) {
    return this.delete<void>(`/habits/${id}`);
  }

  async getHabitRecords(id: string) {
    return this.get<HabitRecord[]>(`/habits/${id}/records`);
  }

  async completeHabit(id: string, data: CreateCompletionDto) {
    return this.post<HabitRecord>(`/habits/${id}/complete`, data);
  }

  async deleteCompletion(id: string, date: string) {
    return this.delete<void>(`/habits/${id}/complete/${date}`);
  }

  async archiveHabit(id: string) {
    return this.post<Habit>(`/habits/${id}/archive`);
  }

  async restoreHabit(id: string) {
    return this.post<Habit>(`/habits/${id}/restore`);
  }
}

export const habitsService = new HabitsService();
