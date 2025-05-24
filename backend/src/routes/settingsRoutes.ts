import express from "express";
import * as settingsController from "../controllers/settingsController";

const router = express.Router();

// GET /api/settings - Get current settings
router.get("/", settingsController.getSettings);

// PUT /api/settings - Update settings
router.put("/", settingsController.updateSettings);

export default router;
