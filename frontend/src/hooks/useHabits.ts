import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habitsApi } from "@/services/habitsApi";
import { CreateHabitDto, UpdateHabitDto, Habit } from "@/types";

export function useHabits() {
  const queryClient = useQueryClient();
  const queryKey = ["habits"];

  // Fetch all habits
  const {
    data: habitsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: habitsApi.getAll,
  });

  // Extract the habits data from the response
  const habits = habitsResponse?.data || [];

  // Create new habit
  const createHabit = useMutation({
    mutationFn: (newHabit: CreateHabitDto) => habitsApi.create(newHabit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update habit
  const updateHabit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitDto }) =>
      habitsApi.update(id, data),
    onSuccess: (updatedHabit) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const oldHabits = old.data || [];
        const updatedHabits = oldHabits.map((habit: Habit) =>
          habit.id === updatedHabit.data.id ? updatedHabit.data : habit
        );
        return { ...old, data: updatedHabits };
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete habit
  const deleteHabit = useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData(queryKey);

      // Optimistically remove the habit from cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const oldHabits = old.data || [];
        return {
          ...old,
          data: oldHabits.filter((habit: Habit) => habit.id !== deletedId),
        };
      });

      // Return context with the snapshotted value
      return { previousHabits };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to reset the cache
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKey, context.previousHabits);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Get a single habit by ID
  const getHabitById = (id: string) => {
    return habits.find((habit) => habit.id === id);
  };

  return {
    habits,
    isLoading,
    error,
    refetch,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
  };
}
