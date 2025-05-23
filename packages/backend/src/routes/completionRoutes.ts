import { Router } from "express";
import { CompletionController } from "../controllers/completionController";
import {
  validateCompleteHabit,
  validateDateParam,
  validateDateRange,
} from "../middlewares/validationMiddleware";

const router = Router();
const completionController = new CompletionController();

/**
 * @route   POST /api/habits/:id/complete
 * @desc    Mark a habit as complete for a specific date
 * @access  Public
 * @body    { date: string, value?: number, notes?: string }
 */
router.post(
  "/habits/:id/complete",
  validateCompleteHabit,
  completionController.completeHabit.bind(completionController)
);

/**
 * @route   DELETE /api/habits/:id/complete/:date
 * @desc    Remove a completion record for a habit on a specific date
 * @access  Public
 */
router.delete(
  "/habits/:id/complete/:date",
  validateDateParam("date"),
  completionController.uncompleteHabit.bind(completionController)
);

/**
 * @route   GET /api/habits/:id/records
 * @desc    Get completion history for a specific habit
 * @access  Public
 * @query   startDate - Optional start date for filtering (YYYY-MM-DD)
 * @query   endDate - Optional end date for filtering (YYYY-MM-DD)
 */
router.get(
  "/habits/:id/records",
  completionController.getHabitCompletionHistory.bind(completionController)
);

/**
 * @route   GET /api/completions/daily/:date
 * @desc    Get all completions for a specific date
 * @access  Public
 */
router.get(
  "/completions/daily/:date",
  validateDateParam("date"),
  completionController.getDailyCompletions.bind(completionController)
);

/**
 * @route   GET /api/completions/range
 * @desc    Get completions for a date range
 * @access  Public
 * @query   startDate - Start date for filtering (YYYY-MM-DD)
 * @query   endDate - End date for filtering (YYYY-MM-DD)
 */
router.get(
  "/completions/range",
  validateDateRange,
  completionController.getCompletionsInRange.bind(completionController)
);

/**
 * @route   POST /api/completions/bulk
 * @desc    Mark multiple habits complete in a single request
 * @access  Public
 * @body    Array of { habitId: string, date: string, value?: number, notes?: string }
 */
router.post(
  "/completions/bulk",
  completionController.bulkCompleteHabits.bind(completionController)
);

export default router;
