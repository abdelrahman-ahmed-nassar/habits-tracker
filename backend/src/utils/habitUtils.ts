import { Habit } from "../../../shared/types";

/**
 * Filter habits by search term
 * @param habits Array of habits to filter
 * @param searchTerm Search term to filter by
 * @returns Filtered habits
 */
export const filterHabitsBySearchTerm = (
  habits: Habit[],
  searchTerm: string
): Habit[] => {
  if (!searchTerm) return habits;

  const term = searchTerm.toLowerCase();
  return habits.filter(
    (habit) =>
      habit.name.toLowerCase().includes(term) ||
      (habit.description && habit.description.toLowerCase().includes(term)) ||
      (habit.motivationNote &&
        habit.motivationNote.toLowerCase().includes(term))
  );
};

/**
 * Filter habits by tag
 * @param habits Array of habits to filter
 * @param tag Tag to filter by
 * @returns Filtered habits
 */
export const filterHabitsByTag = (habits: Habit[], tag: string): Habit[] => {
  if (!tag) return habits;

  return habits.filter(
    (habit) => habit.tag.toLowerCase() === tag.toLowerCase()
  );
};

/**
 * Filter habits by active status
 * @param habits Array of habits to filter
 * @param isActive Active status to filter by
 * @returns Filtered habits
 */
export const filterHabitsByActiveStatus = (
  habits: Habit[],
  isActive: boolean
): Habit[] => {
  return habits.filter((habit) => habit.isActive === isActive);
};

type SortDirection = "asc" | "desc";

/**
 * Sort habits by field
 * @param habits Array of habits to sort
 * @param field Field to sort by
 * @param direction Sort direction ('asc' or 'desc')
 * @returns Sorted habits
 */
export const sortHabits = (
  habits: Habit[],
  field: keyof Habit,
  direction: SortDirection = "asc"
): Habit[] => {
  return [...habits].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    const multiplier = direction === "asc" ? 1 : -1;

    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
};

/**
 * Parse sort string ('-field' for descending, 'field' for ascending)
 * @param sortStr Sort string
 * @returns [field, direction]
 */
export const parseSortString = (
  sortStr: string
): [keyof Habit, SortDirection] => {
  const isDesc = sortStr.startsWith("-");
  const field = isDesc ? sortStr.substring(1) : sortStr;
  const direction = isDesc ? "desc" : "asc";

  return [field as keyof Habit, direction];
};

/**
 * Apply filters and sorting to habits
 * @param habits Array of habits
 * @param filters Filter options
 * @returns Filtered and sorted habits
 */
export const filterAndSortHabits = (
  habits: Habit[],
  filters: {
    searchTerm?: string;
    tag?: string;
    isActive?: boolean;
    sortField?: keyof Habit;
    sortDirection?: SortDirection;
  }
): Habit[] => {
  let result = [...habits];

  // Apply filters
  if (filters.searchTerm) {
    result = filterHabitsBySearchTerm(result, filters.searchTerm);
  }

  if (filters.tag) {
    result = filterHabitsByTag(result, filters.tag);
  }

  if (filters.isActive !== undefined) {
    result = filterHabitsByActiveStatus(result, filters.isActive);
  }

  // Apply sorting
  if (filters.sortField) {
    result = sortHabits(
      result,
      filters.sortField,
      filters.sortDirection || "asc"
    );
  }

  return result;
};
