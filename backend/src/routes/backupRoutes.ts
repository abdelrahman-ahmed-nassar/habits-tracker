import express from "express";
import { createBackupController } from "../controllers/backupController";

const router = express.Router();

// Create a backup
router.post("/", createBackupController);

export default router;
