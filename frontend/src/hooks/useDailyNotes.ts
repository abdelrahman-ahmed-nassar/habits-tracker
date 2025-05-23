import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/services/notesApi";
import { CreateNoteDto, UpdateNoteDto } from "@/types";
import { formatDate } from "@/utils/dateUtils";

export function useDailyNotes(date?: string) {
  const queryClient = useQueryClient();
  const today = date || formatDate(new Date());
  const queryKey = ["notes", today];

  // Fetch note for a specific date
  const {
    data: note,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => notesApi.getByDate(today),
    // Handle 404 (no note for this date) gracefully
    retry: (failureCount, error: any) => {
      return failureCount < 2 && error.response?.status !== 404;
    },
    // If we get a 404, return null instead of throwing an error
    onError: (err: any) => {
      if (err.response?.status === 404) {
        queryClient.setQueryData(queryKey, null);
      }
    },
  });

  // Create a new note
  const createNote = useMutation({
    mutationFn: (noteData: CreateNoteDto) => notesApi.create(noteData),
    onSuccess: (newNote) => {
      queryClient.setQueryData(queryKey, newNote);
    },
  });

  // Update a note
  const updateNote = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      notesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousNote = queryClient.getQueryData(queryKey);

      // Optimistically update the note in cache
      if (previousNote) {
        queryClient.setQueryData(queryKey, {
          ...previousNote,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      // Return context with the snapshotted value
      return { previousNote };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to reset the cache
      if (context?.previousNote) {
        queryClient.setQueryData(queryKey, context.previousNote);
      }
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(queryKey, updatedNote);
    },
  });

  // Delete a note
  const deleteNote = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousNote = queryClient.getQueryData(queryKey);

      // Optimistically remove the note from cache
      queryClient.setQueryData(queryKey, null);

      // Return context with the snapshotted value
      return { previousNote };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context to reset the cache
      if (context?.previousNote) {
        queryClient.setQueryData(queryKey, context.previousNote);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Save or update note (create if doesn't exist, update if it does)
  const saveNote = async (content: string) => {
    if (note) {
      return updateNote.mutateAsync({ id: note.id, data: { content } });
    } else {
      return createNote.mutateAsync({ date: today, content });
    }
  };

  // Get all notes (for search/listing)
  const useAllNotes = () => {
    return useQuery({
      queryKey: ["notes", "all"],
      queryFn: notesApi.getAll,
    });
  };

  return {
    note,
    isLoading,
    error,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    saveNote,
    useAllNotes,
  };
}
