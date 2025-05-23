import { get, post, del } from './api';
import { HabitCompletion, CreateCompletionDto } from '@/types';

export const completionsApi = {
  // Get completions for a specific date
  getByDate: async (date: string) => {
    return get<HabitCompletion[]>(`/completions/date/${date}`);
  },

  // Get completions for a specific habit
  getByHabit: async (habitId: string) => {
    return get<HabitCompletion[]>(`/completions/habit/${habitId}`);
  },

  // Get completions for a date range
  getByDateRange: async (startDate: string, endDate: string) => {
    return get<HabitCompletion[]>(`/completions/range/${startDate}/${endDate}`);
  },

  // Track a habit completion
  create: async (completionData: CreateCompletionDto) => {
    return post<HabitCompletion>('/completions', completionData);
  },

  // Delete a habit completion
  delete: async (habitId: string, date: string) => {
    return del<{ success: boolean }>(`/completions/${habitId}/${date}`);
  },

  // Toggle a habit completion (mark as complete or incomplete)
  toggle: async (habitId: string, date: string) => {
    return post<HabitCompletion>(`/completions/toggle`, { habitId, date });
  }
}; 