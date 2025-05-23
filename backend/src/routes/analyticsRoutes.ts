import express from "express";

const router = express.Router();

// GET /api/analytics - Get analytics data
router.get("/", (req, res) => {
  res.json({ message: "Get analytics data" });
});

// GET /api/analytics/:habitId - Get analytics for specific habit
router.get("/:habitId", (req, res) => {
  res.json({ message: `Get analytics for habit ${req.params.habitId}` });
});

export default router;
