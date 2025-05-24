import express from "express";
import * as completionController from "../controllers/completionController";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

// GET /api/completions/date/:date - Get all completions for a specific date
router.get("/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const completions = await completionController.getDailyCompletions(
      req,
      res,
      next
    );
    return completions;
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 500));
    } else {
      next(new AppError("An unknown error occurred", 500));
    }
  }
});

// GET /api/completions/habit/:habitId - Get completions for a specific habit
router.get("/habit/:habitId", completionController.getHabitCompletions);

// GET /api/completions/range/:startDate/:endDate - Get completions for a date range
router.get(
  "/range/:startDate/:endDate",
  completionController.getCompletionsInRange
);

// POST /api/completions - Create a new completion
router.post("/", completionController.markHabitComplete);

// POST /api/completions/toggle - Toggle a completion
router.post("/toggle", completionController.markHabitComplete);

// DELETE /api/completions/:habitId/:date - Delete a completion
router.delete("/:habitId/:date", completionController.deleteCompletion);

export default router;
