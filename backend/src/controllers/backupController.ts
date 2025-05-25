import { Request, Response } from "express";
import { createBackup } from "../services/dataService";
import { formatDateToString } from "../utils/dateUtils";

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
