import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreateHabitDto, Habit } from "../../../shared/types";
import { ValidationError } from "../types/models";
import { validateHabitCreate } from "../utils/validation";
import { getTodayDateString } from "../utils/dateUtils";
import { filterAndSortHabits, parseSortString } from "../utils/habitUtils";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";

/**
 * Get all habits
 * @route GET /api/habits
 */
export const getAllHabits = asyncHandler(
  async (req: Request, res: Response) => {
    const habits = await dataService.getHabits();

    // Parse query params for filtering and sorting
    let { sort, filter, tag, active } = req.query;
    active = "true";

    // Set up filter options
    const filterOptions: {
      searchTerm?: string;
      tag?: string;
      isActive?: boolean;
      sortField?: keyof Habit;
      sortDirection?: "asc" | "desc";
    } = {};

    // Process search term
    if (filter && typeof filter === "string") {
      filterOptions.searchTerm = filter;
    }

    // Process tag filter
    if (tag && typeof tag === "string") {
      filterOptions.tag = tag;
    }

    // Process active status filter
    if (active !== undefined) {
      filterOptions.isActive = active === "true";
    }

    // Process sorting
    if (sort && typeof sort === "string") {
      const [sortField, sortDirection] = parseSortString(sort);
      filterOptions.sortField = sortField;
      filterOptions.sortDirection = sortDirection;
    }

    // Apply filters and sorting
    const filteredHabits = filterAndSortHabits(habits, filterOptions);

    res.status(200).json({
      success: true,
      data: filteredHabits,
    });
  }
);

/**
 * Get a habit by ID
 * @route GET /api/habits/:id
 */
export const getHabitById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const habit = await dataService.getHabitById(id);

    if (!habit) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: habit,
    });
  }
);

/**
 * Create a new habit
 * @route POST /api/habits
 */
export const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitData: CreateHabitDto = req.body;

  // Validate habit data
  const errors = validateHabitCreate(habitData);

  if (errors.length > 0) {
    throw new AppError("Invalid habit data", 400, errors);
  }

  // Create habit with all required fields
  const habit = await dataService.createHabit(habitData);

  res.status(201).json({
    success: true,
    data: habit,
    message: "Habit created successfully",
  });
});

/**
 * Update a habit
 * @route PUT /api/habits/:id
 */
export const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const habitData: Partial<Habit> = req.body;

  // Validate the update data
  if (habitData.name !== undefined && habitData.name.trim() === "") {
    throw new AppError("Name cannot be empty", 400);
  }

  // Find existing habit
  const existingHabit = await dataService.getHabitById(id);

  if (!existingHabit) {
    throw new AppError(`Habit with ID ${id} not found`, 404);
  }

  // Update the habit
  const updatedHabit = await dataService.updateHabit(id, habitData);

  res.status(200).json({
    success: true,
    data: updatedHabit,
    message: "Habit updated successfully",
  });
});

/**
 * Delete a habit
 * @route DELETE /api/habits/:id
 */
export const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if habit exists
  const existingHabit = await dataService.getHabitById(id);

  if (!existingHabit) {
    throw new AppError(`Habit with ID ${id} not found`, 404);
  }

  // Delete habit
  await dataService.deleteHabit(id);

  // Delete associated completion records
  // This would normally be in a transaction but we'll handle it separately
  const completions = await dataService.getCompletionsByHabitId(id);
  if (completions.length > 0) {
    // We need to remove completions for this habit from the completions file
    const allCompletions = await dataService.getCompletions();
    const updatedCompletions = allCompletions.filter((c) => c.habitId !== id);
    await dataService.replaceAllCompletions(updatedCompletions);
  }

  res.status(200).json({
    success: true,
    message: "Habit and associated records deleted successfully",
  });
});

/**
 * Archive a habit (make it inactive)
 * @route POST /api/habits/:id/archive
 */
export const archiveHabit = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find existing habit
    const existingHabit = await dataService.getHabitById(id);

    if (!existingHabit) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Update the habit to be inactive
    const updatedHabit = await dataService.updateHabit(id, { isActive: false });

    res.status(200).json({
      success: true,
      data: updatedHabit,
      message: "Habit archived successfully",
    });
  }
);

/**
 * Restore a habit (make it active)
 * @route POST /api/habits/:id/restore
 */
export const restoreHabit = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find existing habit
    const existingHabit = await dataService.getHabitById(id);

    if (!existingHabit) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Update the habit to be active
    const updatedHabit = await dataService.updateHabit(id, { isActive: true });

    res.status(200).json({
      success: true,
      data: updatedHabit,
      message: "Habit restored successfully",
    });
  }
);
