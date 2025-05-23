import express from "express";
import * as completionController from "../controllers/completionController";

const router = express.Router();

// GET /api/completions/date/:date - Get all completions for a specific date
router.get("/date/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const completions = await completionController.getDailyCompletions(
      req,
      res
    );
    return completions;
  } catch (error) {
    console.error(`Error getting completions for date ${date}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to get completions",
      error: error.message,
    });
  }
});

// GET /api/completions/habit/:habitId - Get completions for a specific habit
router.get("/habit/:habitId", completionController.getHabitCompletions);

// GET /api/completions/range/:startDate/:endDate - Get completions for a date range
router.get("/range/:startDate/:endDate", async (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    // Forward to records controller that handles date ranges
    return res.redirect(`/api/records/weekly/${startDate}?endDate=${endDate}`);
  } catch (error) {
    console.error(
      `Error getting completions for range ${startDate} to ${endDate}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to get completions by date range",
      error: error.message,
    });
  }
});

// POST /api/completions - Create a new completion
router.post("/", completionController.markHabitComplete);

// POST /api/completions/toggle - Toggle a completion
router.post("/toggle", completionController.markHabitComplete);

// DELETE /api/completions/:habitId/:date - Delete a completion
router.delete("/:habitId/:date", completionController.deleteCompletion);

export default router;
