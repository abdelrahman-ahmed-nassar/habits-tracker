import express from "express";

const router = express.Router();

// GET /api/habits - Get all habits
router.get("/", (req, res) => {
  res.json({ message: "Get all habits" });
});

// POST /api/habits - Create new habit
router.post("/", (req, res) => {
  res.json({ message: "Create new habit" });
});

// GET /api/habits/:id - Get a specific habit
router.get("/:id", (req, res) => {
  res.json({ message: `Get habit ${req.params.id}` });
});

// PUT /api/habits/:id - Update habit
router.put("/:id", (req, res) => {
  res.json({ message: `Update habit ${req.params.id}` });
});

// DELETE /api/habits/:id - Delete habit
router.delete("/:id", (req, res) => {
  res.json({ message: `Delete habit ${req.params.id}` });
});

// GET /api/habits/:id/records - Get habit completion records
router.get("/:id/records", (req, res) => {
  res.json({ message: `Get records for habit ${req.params.id}` });
});

// POST /api/habits/:id/complete - Mark habit as complete for a date
router.post("/:id/complete", (req, res) => {
  res.json({ message: `Mark habit ${req.params.id} as complete` });
});

export default router;
