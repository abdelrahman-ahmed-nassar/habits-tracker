import express from "express";

const router = express.Router();

// GET /api/notes - Get all notes
router.get("/", (req, res) => {
  res.json({ message: "Get all notes" });
});

// GET /api/notes/:date - Get notes for a specific date
router.get("/:date", (req, res) => {
  res.json({ message: `Get notes for date ${req.params.date}` });
});

// POST /api/notes - Create a new note
router.post("/", (req, res) => {
  res.json({ message: "Create new note" });
});

// PUT /api/notes/:id - Update a note
router.put("/:id", (req, res) => {
  res.json({ message: `Update note ${req.params.id}` });
});

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", (req, res) => {
  res.json({ message: `Delete note ${req.params.id}` });
});

export default router;
