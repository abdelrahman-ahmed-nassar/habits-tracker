import express, { Router } from "express";
import * as settingsController from "../controllers/settingsController";

const router: Router = express.Router();

// GET /api/settings - Get current settings
router.get("/", settingsController.getSettings);

// PUT /api/settings - Update settings
router.put("/", settingsController.updateSettings);

// DELETE /api/settings/reset-data - Reset all data
router.delete("/reset-data", settingsController.resetAllData);

export default router;
