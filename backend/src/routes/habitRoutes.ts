import express from "express";
import * as habitController from "../controllers/habitController";
import * as completionController from "../controllers/completionController";

const router = express.Router();

// GET /api/habits - Get all habits
router.get("/", habitController.getAllHabits);

// GET /api/habits/:id - Get a specific habit
router.get("/:id", habitController.getHabitById);

// POST /api/habits - Create new habit
router.post("/", habitController.createHabit);

// PUT /api/habits/:id - Update habit
router.put("/:id", habitController.updateHabit);

// DELETE /api/habits/:id - Delete habit
router.delete("/:id", habitController.deleteHabit);

// GET /api/habits/:id/records - Get habit completion records
router.get("/:id/records", completionController.getHabitCompletions);

// POST /api/habits/:id/complete - Mark habit as complete for a date
router.post("/:id/complete", completionController.markHabitComplete);

// DELETE /api/habits/:id/complete/:date - Unmark completion
router.delete("/:id/complete/:date", completionController.deleteCompletion);

// POST /api/habits/:id/archive - Archive a habit
router.post("/:id/archive", habitController.archiveHabit);

// POST /api/habits/:id/restore - Restore a habit
router.post("/:id/restore", habitController.restoreHabit);

// Export routes
export default router;
