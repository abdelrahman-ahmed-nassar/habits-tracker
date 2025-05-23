import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completionsApi } from "@/services/completionsApi";
import { CreateCompletionDto, HabitCompletion } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { getFallbackCompletions, isFetchError } from "@/utils/fallbackData";

export function useHabitCompletions(date?: string) {
  const queryClient = useQueryClient();
  const today = date || formatDate(new Date());
  const queryKey = ["completions", today];

  // Fetch habit completions for a specific date
  const {
    data: completionsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => completionsApi.getByDate(today),
    retry: 1,
    onError: (error) => {
      console.error("Failed to fetch completions:", error);
    }
  });

  // Extract completions data from response or use fallback
  const completions = completionsResponse?.data || 
    (isFetchError(error) ? getFallbackCompletions(today) : []);

  // Track a new habit completion
  const trackCompletion = useMutation({
    mutationFn: (completionData: CreateCompletionDto) =>
      completionsApi.create(completionData),
    onMutate: async (newCompletionData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousCompletions = queryClient.getQueryData(queryKey);

      // Create optimistic completion
      const optimisticCompletion = {
        id: "temp-id-" + Date.now(),
        habitId: newCompletionData.habitId,
        date: newCompletionData.date,
        completed: newCompletionData.completed,
        notes: newCompletionData.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic completion to cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return { data: [optimisticCompletion] };
        const oldCompletions = old.data || [];
        return { ...old, data: [...oldCompletions, optimisticCompletion] };
      });

      // Return context with the snapshotted value
      return { previousCompletions };
    },
    onError: (_err, _variables, context) => {
      console.error("Failed to track completion:", _err);
      // If the mutation fails, use the context to reset the cache
      if (context?.previousCompletions) {
        queryClient.setQueryData(queryKey, context.previousCompletions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Toggle habit completion (mark as complete/incomplete)
  const toggleCompletion = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      completionsApi.toggle(habitId, date),
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousCompletions = queryClient.getQueryData(queryKey);

      // Optimistically update the completion status
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const oldCompletions = old.data || [];

        // Check if completion already exists
        const existingIndex = oldCompletions.findIndex(
          (completion: HabitCompletion) =>
            completion.habitId === habitId && completion.date === date
        );

        if (existingIndex >= 0) {
          // Toggle existing completion
          const updated = [...oldCompletions];
          updated[existingIndex] = {
            ...updated[existingIndex],
            completed: !updated[existingIndex].completed,
            updatedAt: new Date().toISOString(),
          };
          return { ...old, data: updated };
        } else {
          // Create new completion
          return {
            ...old,
            data: [
              ...oldCompletions,
              {
                id: "temp-id-" + Date.now(),
                habitId,
                date,
                completed: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        }
      });

      // Return context with the snapshotted value
      return { previousCompletions };
    },
    onError: (_err, _variables, context) => {
      console.error("Failed to toggle completion:", _err);
      // If the mutation fails, use the context to reset the cache
      if (context?.previousCompletions) {
        queryClient.setQueryData(queryKey, context.previousCompletions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete a habit completion
  const deleteCompletion = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      completionsApi.delete(habitId, date),
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousCompletions = queryClient.getQueryData(queryKey);

      // Optimistically remove the completion from cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const oldCompletions = old.data || [];
        return {
          ...old,
          data: oldCompletions.filter(
            (completion: HabitCompletion) =>
              !(completion.habitId === habitId && completion.date === date)
          ),
        };
      });

      // Return context with the snapshotted value
      return { previousCompletions };
    },
    onError: (_err, _variables, context) => {
      console.error("Failed to delete completion:", _err);
      // If the mutation fails, use the context to reset the cache
      if (context?.previousCompletions) {
        queryClient.setQueryData(queryKey, context.previousCompletions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Get habit completions by date range
  const getCompletionsByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ["completions", "range", startDate, endDate],
      queryFn: () => completionsApi.getByDateRange(startDate, endDate),
      retry: 1,
      onError: (error) => {
        console.error("Failed to fetch date range completions:", error);
      }
    });
  };

  // Get completions for a specific habit
  const getCompletionsByHabit = (habitId: string) => {
    return useQuery({
      queryKey: ["completions", "habit", habitId],
      queryFn: () => completionsApi.getByHabit(habitId),
      retry: 1,
      onError: (error) => {
        console.error("Failed to fetch habit completions:", error);
      }
    });
  };

  // Check if a habit is completed for the current date
  const isHabitCompletedForDate = (habitId: string): boolean => {
    return completions.some(
      (completion: HabitCompletion) =>
        completion.habitId === habitId && completion.completed
    );
  };

  return {
    completions,
    isLoading,
    error,
    refetch,
    trackCompletion,
    toggleCompletion,
    deleteCompletion,
    getCompletionsByDateRange,
    getCompletionsByHabit,
    isHabitCompletedForDate,
  };
}
