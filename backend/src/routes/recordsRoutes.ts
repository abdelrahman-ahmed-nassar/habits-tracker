import express from "express";
import * as recordsController from "../controllers/recordsController";

const router = express.Router();

// GET /api/records/daily/:date - Get all completions for specific date
router.get("/daily/:date", recordsController.getDailyRecords);

// GET /api/records/weekly/:startDate - Get week's completion data
router.get("/weekly/:startDate", recordsController.getWeeklyRecords);

// GET /api/records/monthly/:year/:month - Get month's completion data
router.get("/monthly/:year/:month", recordsController.getMonthlyRecords);

export default router;
