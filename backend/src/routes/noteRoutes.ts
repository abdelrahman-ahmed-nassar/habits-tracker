import express, { Router } from "express";
import * as noteController from "../controllers/noteController";
import * as notesAnalyticsController from "../controllers/notesAnalyticsController";

const router: Router = express.Router();

// GET /api/notes - Get all notes
router.get("/", noteController.getAllNotes);

// Analytics routes
router.get("/analytics/overview", notesAnalyticsController.getNotesAnalytics);
router.get("/analytics/mood-trends", notesAnalyticsController.getMoodTrends);
router.get(
  "/analytics/productivity-correlation",
  notesAnalyticsController.getProductivityCorrelation
);
router.get("/calendar/:year/:month", notesAnalyticsController.getNotesCalendar);

// GET /api/notes/:date - Get notes for a specific date
router.get("/:date", noteController.getNoteByDate);

// POST /api/notes - Create a new note
router.post("/", noteController.createNote);

// PUT /api/notes/:id - Update a note
router.put("/:id", noteController.updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", noteController.deleteNote);

export default router;
