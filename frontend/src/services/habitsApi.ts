import { get, post, put, del } from "./api";
import { Habit, CreateHabitDto, UpdateHabitDto } from "@/types";

export const habitsApi = {
  // Get all habits
  getAll: async () => {
    return get<Habit[]>("/habits");
  },

  // Get a single habit by ID
  getById: async (id: string) => {
    return get<Habit>(`/habits/${id}`);
  },

  // Create a new habit
  create: async (habitData: CreateHabitDto) => {
    return post<Habit>("/habits", habitData);
  },

  // Update a habit
  update: async (id: string, habitData: UpdateHabitDto) => {
    return put<Habit>(`/habits/${id}`, habitData);
  },

  // Delete a habit
  delete: async (id: string) => {
    return del<{ success: boolean }>(`/habits/${id}`);
  },
};
