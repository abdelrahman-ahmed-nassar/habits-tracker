import { Router } from "express";
import { TypedRequest, TypedResponse } from "../types/express";
import { DataService } from "../services/dataService";
import { AppError } from "../middlewares/errorMiddleware";
import { NextFunction } from "express";
import { HabitController } from "../controllers/habitController";
import {
  validateCreateHabit,
  validateUpdateHabit,
} from "../middlewares/validationMiddleware";

// Define local Habit interface for testing purposes
// Rename to IHabit to match ESLint naming convention rule
interface IHabit {
  id: string;
  name: string;
  tag: string;
  repetition: string;
  specificDays?: number[];
  specificDates?: number[];
  goalType: string;
  goalValue: number;
  createdAt: string;
  updatedAt: string;
  color?: string;
  icon?: string;
  archived?: boolean;
}

const router = Router();
const habitService = new DataService<IHabit>("habits");
const habitController = new HabitController();

/**
 * @route   GET /api/habits
 * @desc    Get all habits with optional filtering
 * @access  Public
 */
router.get("/", habitController.getAllHabits.bind(habitController));

/**
 * @route   GET /api/habits/:id
 * @desc    Get a single habit by ID
 * @access  Public
 */
router.get("/:id", habitController.getHabitById.bind(habitController));

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 * @access  Public
 */
router.post(
  "/",
  validateCreateHabit,
  habitController.createHabit.bind(habitController)
);

/**
 * @route   PUT /api/habits/:id
 * @desc    Update an existing habit
 * @access  Public
 */
router.put(
  "/:id",
  validateUpdateHabit,
  habitController.updateHabit.bind(habitController)
);

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete a habit
 * @access  Public
 */
router.delete("/:id", habitController.deleteHabit.bind(habitController));

/**
 * @route   PATCH /api/habits/:id/archive
 * @desc    Archive a habit (soft delete)
 * @access  Public
 */
router.patch(
  "/:id/archive",
  habitController.archiveHabit.bind(habitController)
);

export default router;
