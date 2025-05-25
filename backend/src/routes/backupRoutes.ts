import express from "express";
import {
  createBackupController,
  restoreFromBackupController,
} from "../controllers/backupController";

const router = express.Router();

// Create a backup
router.post("/", createBackupController);

// Restore from a backup
router.post("/restore", restoreFromBackupController);

export default router;
