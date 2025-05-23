import { Habit, HabitCompletion } from "@/types";

/**
 * Fallback data to use when API is unavailable
 */

export const fallbackHabits: Habit[] = [
  {
    id: "1",
    name: "Morning Meditation",
    description: "15 minutes of mindful meditation",
    category: "Wellness",
    frequency: [1, 2, 3, 4, 5, 6, 7],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-blue-500",
    icon: "meditation",
  },
  {
    id: "2",
    name: "Read a Book",
    description: "Read for at least 30 minutes",
    category: "Learning",
    frequency: [1, 3, 5, 7],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-green-500",
    icon: "book",
  },
  {
    id: "3",
    name: "Exercise",
    description: "30 minutes workout",
    category: "Fitness",
    frequency: [2, 4, 6],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-red-500",
    icon: "dumbbell",
  },
  {
    id: "4",
    name: "Drink Water",
    description: "Drink at least 8 glasses of water",
    category: "Health",
    frequency: [1, 2, 3, 4, 5, 6, 7],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: "bg-cyan-500",
    icon: "droplet",
  },
];

export const getFallbackCompletions = (date: string): HabitCompletion[] => {
  return [
    {
      id: "1",
      habitId: "1", // Morning Meditation
      date,
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      habitId: "3", // Exercise
      date,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const isFetchError = (error: any): boolean => {
  return (
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Network Error") ||
    error?.response?.status === 500
  );
};
