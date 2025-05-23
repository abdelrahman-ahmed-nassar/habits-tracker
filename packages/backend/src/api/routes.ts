/**
 * API Routes for the Ultimate Habits Tracker
 */
import express from "express";
import * as analyticsController from "../controllers/analyticsController";
import * as chartDataController from "../controllers/chartDataController";

const router = express.Router();

// Define routes
router.get("/", (req, res) => {
  res.send("Ultimate Habits Tracker API");
});

// Analytics routes
router.get("/analytics/summary", analyticsController.getOverallAnalytics);
router.get("/analytics/trend", analyticsController.getCompletionTrends);
router.get("/analytics/daily/:date", analyticsController.getDailyAnalytics);
router.get(
  "/analytics/weekly/:startDate",
  analyticsController.getWeeklyAnalytics
);
router.get(
  "/analytics/monthly/:year/:month",
  analyticsController.getMonthlyAnalytics
);
router.get("/analytics/day-of-week", analyticsController.getDayOfWeekAnalysis);
router.get("/analytics/tags", analyticsController.getTagAnalytics);
router.get("/analytics/habit/:id", analyticsController.getHabitAnalytics);

// Chart data routes
router.get("/charts/daily-trend", chartDataController.getDailyCompletionTrend);
router.get(
  "/charts/weekly-performance",
  chartDataController.getWeeklyPerformance
);
router.get(
  "/charts/category-breakdown",
  chartDataController.getCategoryBreakdown
);
router.get("/charts/monthly-heatmap", chartDataController.getMonthlyHeatmap);
router.get("/charts/habit-trend/:habitId", chartDataController.getHabitTrend);
router.get(
  "/charts/habits-comparison",
  chartDataController.getHabitsComparison
);

export default router;
