import express from "express";
import * as analyticsController from "../controllers/analyticsController";
import { validateTimeRange } from "../middlewares/validationMiddleware";

const router = express.Router();

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overall analytics for all habits
 * @access  Public
 * @query   {string} startDate - Start date in YYYY-MM-DD format
 * @query   {string} endDate - End date in YYYY-MM-DD format
 * @query   {boolean} includeArchived - Whether to include archived habits
 */
router.get(
  "/overview",
  validateTimeRange,
  analyticsController.getOverallAnalytics
);

/**
 * @route   GET /api/analytics/habits/:id
 * @desc    Get analytics for a specific habit
 * @access  Public
 * @param   {string} id - Habit ID
 * @query   {string} startDate - Start date in YYYY-MM-DD format
 * @query   {string} endDate - End date in YYYY-MM-DD format
 */
router.get(
  "/habits/:id",
  validateTimeRange,
  analyticsController.getHabitAnalytics
);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get completion trends over time
 * @access  Public
 * @query   {string} startDate - Start date in YYYY-MM-DD format
 * @query   {string} endDate - End date in YYYY-MM-DD format
 * @query   {string} granularity - Time granularity (daily, weekly, monthly)
 * @query   {boolean} includeArchived - Whether to include archived habits
 */
router.get(
  "/trends",
  validateTimeRange,
  analyticsController.getCompletionTrends
);

/**
 * @route   GET /api/analytics/daily/:date
 * @desc    Get analytics for a specific day
 * @access  Public
 * @param   {string} date - Date in YYYY-MM-DD format
 */
router.get("/daily/:date", analyticsController.getDailyAnalytics);

/**
 * @route   GET /api/analytics/weekly/:startDate
 * @desc    Get analytics for a week starting at startDate
 * @access  Public
 * @param   {string} startDate - Start date in YYYY-MM-DD format
 */
router.get("/weekly/:startDate", analyticsController.getWeeklyAnalytics);

/**
 * @route   GET /api/analytics/monthly/:year/:month
 * @desc    Get analytics for a specific month
 * @access  Public
 * @param   {string} year - Year (e.g., 2023)
 * @param   {string} month - Month (1-12)
 */
router.get("/monthly/:year/:month", analyticsController.getMonthlyAnalytics);

/**
 * @route   GET /api/analytics/day-of-week
 * @desc    Get day of week analytics
 * @access  Public
 * @query   {string} startDate - Start date in YYYY-MM-DD format
 * @query   {string} endDate - End date in YYYY-MM-DD format
 * @query   {boolean} includeArchived - Whether to include archived habits
 */
router.get(
  "/day-of-week",
  validateTimeRange,
  analyticsController.getDayOfWeekAnalysis
);

/**
 * @route   GET /api/analytics/tags
 * @desc    Get analytics by habit tags/categories
 * @access  Public
 * @query   {string} startDate - Start date in YYYY-MM-DD format
 * @query   {string} endDate - End date in YYYY-MM-DD format
 * @query   {boolean} includeArchived - Whether to include archived habits
 */
router.get("/tags", validateTimeRange, analyticsController.getTagAnalytics);

export default router;
