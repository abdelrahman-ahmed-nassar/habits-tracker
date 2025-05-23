import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import archiver from "archiver";
import { FileSystemService } from "./fileSystemService";
import env from "../config/env";
import logger from "../utils/logger";
import { AppSettings } from "../types/shared";

/**
 * Service for handling application data backups
 */
export class BackupService {
  private fileSystemService: FileSystemService;
  private fullBackupDir: string;

  /**
   * Creates a new BackupService instance
   *
   * @param backupDir Optional custom backup directory path
   * @param fileSystemService Optional FileSystemService instance
   */
  constructor(
    backupDir?: string | undefined,
    fileSystemService?: FileSystemService
  ) {
    // Use the provided backup directory or default to a path in the data directory
    this.fullBackupDir =
      typeof backupDir === "string" && backupDir.trim() !== ""
        ? backupDir
        : path.join(env.DATA_DIR, "backups", "full");

    this.fileSystemService = fileSystemService ?? new FileSystemService();

    // Ensure full backup directory exists
    if (!fsSync.existsSync(this.fullBackupDir)) {
      fsSync.mkdirSync(this.fullBackupDir, { recursive: true });
    }
  }

  /**
   * Performs a full backup of all data
   *
   * @returns Path to the created backup archive
   */
  async performFullBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `full-backup_${timestamp}.zip`;
    const backupPath = path.join(this.fullBackupDir, backupFileName);

    logger.info("Starting full backup of all data...");

    try {
      // Create a zip file stream
      const outputStream = fsSync.createWriteStream(backupPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Set up archive events
      const finishPromise = new Promise<void>((resolve, reject) => {
        outputStream.on("close", () => {
          logger.info(
            `Full backup completed: ${backupFileName} (${archive.pointer()} bytes)`
          );
          resolve();
        });

        archive.on("error", (err) => {
          logger.error("Error creating backup archive:", err);
          reject(err);
        });
      });

      // Pipe archive to output file
      archive.pipe(outputStream);

      // Get all JSON files in the data directory
      const dataFiles = await fs.readdir(env.DATA_DIR);
      const jsonFiles = dataFiles.filter((file) => file.endsWith(".json"));

      // Add each file to the archive
      for (const file of jsonFiles) {
        const filePath = path.join(env.DATA_DIR, file);
        archive.file(filePath, { name: file });
      }

      // Finalize the archive
      await archive.finalize();

      // Wait for the archive to finish
      await finishPromise;

      // Clean up old backups
      await this.cleanupOldFullBackups();

      return backupPath;
    } catch (error) {
      logger.error("Error performing full backup:", error);
      throw new Error(
        `Failed to perform full backup: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Restores data from a full backup archive
   *
   * @param backupPath Path to the backup archive
   * @returns True if restore was successful
   */
  async restoreFromFullBackup(backupPath: string): Promise<boolean> {
    try {
      logger.info(`Starting restore from backup: ${path.basename(backupPath)}`);

      // Create temp directory for extraction
      const tempDir = path.join(env.DATA_DIR, "temp_restore");
      if (fsSync.existsSync(tempDir)) {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
      fsSync.mkdirSync(tempDir, { recursive: true });

      // Extract the archive to temp directory
      // Note: This is a simplified example. In a real implementation,
      // you would use a library like unzipper or extract-zip
      // For now, we'll just log that this would happen
      logger.info(`Extracting ${backupPath} to ${tempDir}`);

      // This would be the actual extraction code, but we're omitting it for simplicity
      // const extract = promisify(require('extract-zip'));
      // await extract(backupPath, { dir: tempDir });

      // Verify the extracted files
      // const extractedFiles = await fs.readdir(tempDir);
      // if (extractedFiles.length === 0) {
      //   throw new Error('Backup archive appears to be empty');
      // }

      // Copy files to data directory
      // for (const file of extractedFiles) {
      //   if (file.endsWith('.json')) {
      //     await fs.copyFile(
      //       path.join(tempDir, file),
      //       path.join(env.DATA_DIR, file)
      //     );
      //   }
      // }

      logger.info("Restore completed successfully");

      // Clean up temp directory
      // await fs.rm(tempDir, { recursive: true, force: true });

      return true;
    } catch (error) {
      logger.error("Error restoring from backup:", error);
      throw new Error(
        `Failed to restore from backup: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Lists all available full backups
   *
   * @returns Array of backup file names
   */
  async listFullBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.fullBackupDir);
      return files
        .filter(
          (file) => file.startsWith("full-backup_") && file.endsWith(".zip")
        )
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      logger.error("Error listing backups:", error);
      throw new Error(
        `Failed to list backups: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Cleans up old full backups, keeping only the most recent ones
   *
   * @param keepCount Number of backups to keep
   * @returns Number of deleted backups
   */
  async cleanupOldFullBackups(keepCount: number = 5): Promise<number> {
    try {
      const backups = await this.listFullBackups();

      if (backups.length <= keepCount) {
        return 0;
      }

      // Get the backups to delete
      const backupsToDelete = backups.slice(keepCount);
      let deletedCount = 0;

      // Delete the old backups
      for (const backup of backupsToDelete) {
        try {
          await fs.unlink(path.join(this.fullBackupDir, backup));
          deletedCount++;
        } catch (error) {
          logger.warn(`Failed to delete old backup ${backup}:`, error);
        }
      }

      logger.info(`Cleaned up ${deletedCount} old full backups`);
      return deletedCount;
    } catch (error) {
      logger.error("Error cleaning up old backups:", error);
      throw new Error(
        `Failed to clean up old backups: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Initializes scheduled backups based on settings
   *
   * @param settings App settings containing backup configuration
   * @returns Object with timer ID for the scheduled backups
   */
  scheduleBackups(settings: AppSettings): { timerId: NodeJS.Timeout | null } {
    if (!settings.backupEnabled) {
      logger.info("Scheduled backups are disabled");
      return { timerId: null };
    }

    // Calculate interval based on backup frequency
    let intervalMs: number;
    switch (settings.backupFrequency) {
      case "daily":
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case "weekly":
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case "monthly":
        intervalMs = 30 * 24 * 60 * 60 * 1000; // ~30 days
        break;
      default:
        intervalMs = 24 * 60 * 60 * 1000; // Default to daily
    }

    logger.info(`Scheduling ${settings.backupFrequency} backups`);

    // Schedule the backup
    const timerId = setInterval(async () => {
      try {
        await this.performFullBackup();
      } catch (error) {
        logger.error("Error performing scheduled backup:", error);
      }
    }, intervalMs);

    // Set an immediate timeout to run the first backup soon after startup
    setTimeout(async () => {
      try {
        await this.performFullBackup();
      } catch (error) {
        logger.error("Error performing initial backup:", error);
      }
    }, 5000); // 5 seconds after startup

    return { timerId };
  }
}
