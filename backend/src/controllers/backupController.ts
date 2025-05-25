import { Request, Response } from "express";
import { createBackup, restoreFromBackup } from "../services/dataService";
import { formatDateToString } from "../utils/dateUtils";
import path from "path";
import fs from "fs";
import { BackupData } from "../types/models";

/**
 * @route   POST /api/backup
 * @desc    Create a backup of all data
 * @access  Public
 */
export const createBackupController = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const backupData = await createBackup();

    res.json({
      success: true,
      message: "Backup created successfully",
      data: {
        timestamp: now.toISOString(),
        habits: backupData.habits.length,
        completions: backupData.completions.length,
        notes: backupData.notes.length,
        backupPath: `data/backups/backup-${formatDateToString(now)}.json`,
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create backup",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @route   POST /api/backup/restore
 * @desc    Restore data from a backup file
 * @access  Public
 */
export const restoreFromBackupController = async (
  req: Request,
  res: Response
) => {
  try {
    const { backupFile } = req.body;

    if (!backupFile) {
      return res.status(400).json({
        success: false,
        message: "Backup filename is required",
      });
    }

    const backupPath = path.join(process.cwd(), "data", "backups", backupFile);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file not found",
      });
    }

    // Read and parse the backup file
    const backupContent = fs.readFileSync(backupPath, "utf8");
    const backupData: BackupData = JSON.parse(backupContent);

    // Restore from the backup data
    await restoreFromBackup(backupData);

    res.json({
      success: true,
      message: "Backup restored successfully",
      data: {
        habits: backupData.habits.length,
        completions: backupData.completions.length,
        notes: backupData.notes.length,
        restoredFrom: backupFile,
      },
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore backup",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
