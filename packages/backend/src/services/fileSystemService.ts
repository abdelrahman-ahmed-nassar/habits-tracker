import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { AsyncResult, Result } from "../types/shared";
import env from "../config/env";
import logger from "../utils/logger";
import { AppError } from "../middlewares/errorMiddleware";

// Lock file extension
const LOCK_EXTENSION = ".lock";
// Temp file extension used for atomic writes
const TEMP_EXTENSION = ".tmp";
// Backup file extension
const BACKUP_EXTENSION = ".bak";
// File modes
const FILE_ENCODING = "utf8";

/**
 * Service for handling low-level file system operations for JSON data
 * Provides atomic writes, locking, validation, and error handling
 */
export class FileSystemService {
  /** Base directory for all data files */
  private baseDir: string;

  /** Base directory for backup files */
  private backupDir: string;

  /**
   * Creates a new FileSystemService instance
   *
   * @param baseDir Optional override for base data directory
   * @param backupDir Optional override for backup directory
   */
  constructor(
    baseDir: string = env.DATA_DIR,
    backupDir: string = path.join(env.DATA_DIR, "backups")
  ) {
    this.baseDir = baseDir;
    this.backupDir = backupDir;
    this.ensureDirectories();
  }

  /**
   * Ensures that the data and backup directories exist
   */
  private ensureDirectories(): void {
    if (!fsSync.existsSync(this.baseDir)) {
      fsSync.mkdirSync(this.baseDir, { recursive: true });
      logger.info(`Created data directory: ${this.baseDir}`);
    }

    if (!fsSync.existsSync(this.backupDir)) {
      fsSync.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Gets the full path to a data file
   *
   * @param fileName The name of the file (without extension)
   * @returns The full path to the file with .json extension
   */
  private getFilePath(fileName: string): string {
    // Sanitize filename to prevent directory traversal
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, "");
    return path.join(this.baseDir, `${sanitizedName}.json`);
  }

  /**
   * Gets the path to a lock file for the specified data file
   *
   * @param filePath Path to the data file
   * @returns Path to the corresponding lock file
   */
  private getLockFilePath(filePath: string): string {
    return `${filePath}${LOCK_EXTENSION}`;
  }

  /**
   * Gets the path to a temporary file for atomic writes
   *
   * @param filePath Path to the data file
   * @returns Path to the temporary file
   */
  private getTempFilePath(filePath: string): string {
    return `${filePath}${TEMP_EXTENSION}`;
  }

  /**
   * Gets the path for a backup file
   *
   * @param fileName The name of the file (without extension)
   * @param timestamp Optional timestamp for the backup (defaults to current time)
   * @returns Path to the backup file
   */
  private getBackupFilePath(fileName: string, timestamp?: Date): string {
    const ts = timestamp ? timestamp : new Date();
    const timeStr = ts.toISOString().replace(/[:.]/g, "-");

    // Sanitize filename to prevent directory traversal
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, "");
    return path.join(
      this.backupDir,
      `${sanitizedName}_${timeStr}${BACKUP_EXTENSION}`
    );
  }

  /**
   * Creates a lock file to prevent concurrent access to a data file
   *
   * @param filePath Path to the data file to lock
   * @returns True if lock was acquired, false if already locked
   */
  private async acquireLock(filePath: string): Promise<boolean> {
    const lockPath = this.getLockFilePath(filePath);

    try {
      // Try to create a lock file with exclusive flag
      await fs.writeFile(
        lockPath,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          pid: process.pid,
        }),
        { flag: "wx" }
      );
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        return false; // Lock already exists
      }
      // Unexpected error
      logger.error(`Error acquiring lock for ${filePath}:`, error);
      throw new AppError(
        `Failed to acquire lock for ${path.basename(filePath)}`,
        500
      );
    }
  }

  /**
   * Releases a lock on a data file
   *
   * @param filePath Path to the data file to unlock
   */
  private async releaseLock(filePath: string): Promise<void> {
    const lockPath = this.getLockFilePath(filePath);

    try {
      await fs.unlink(lockPath);
    } catch (error) {
      // Ignore errors when releasing locks
      logger.warn(`Error releasing lock for ${filePath}:`, error);
    }
  }

  /**
   * Tries to acquire a lock with retry mechanism
   *
   * @param filePath Path to the data file to lock
   * @param maxRetries Maximum number of retries
   * @param retryDelayMs Delay between retries in milliseconds
   * @returns True if lock was acquired, false if failed after all retries
   */
  private async tryAcquireLock(
    filePath: string,
    maxRetries: number = 5,
    retryDelayMs: number = 100
  ): Promise<boolean> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const locked = await this.acquireLock(filePath);

      if (locked) {
        return true;
      }

      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs * Math.pow(2, attempt))
        );
      }
    }

    return false;
  }

  /**
   * Validates JSON data against a schema or validator function
   *
   * @param data The data to validate
   * @param validator Function to validate data or check if it matches the expected type
   * @returns Result indicating whether validation passed or failed
   */
  private validateData<T>(
    data: unknown,
    validator: (data: unknown) => boolean
  ): Result<T, string> {
    try {
      if (validator(data)) {
        return { success: true, value: data as T };
      } else {
        return {
          success: false,
          error: "Data validation failed",
          value: {} as T,
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
        value: {} as T,
      };
    }
  }

  /**
   * Safely reads JSON data from a file with proper error handling
   *
   * @param fileName Name of the file to read (without extension)
   * @returns AsyncResult with the parsed data or an error
   */
  async readData<T>(fileName: string): AsyncResult<T> {
    const filePath = this.getFilePath(fileName);

    try {
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        // File doesn't exist, return empty result based on expected type
        return { success: true, value: [] as unknown as T };
      }

      // Read and parse file
      const data = await fs.readFile(filePath, FILE_ENCODING);

      try {
        const parsedData = JSON.parse(data) as T;
        return { success: true, value: parsedData };
      } catch (error) {
        logger.error(`Error parsing JSON data from ${fileName}.json:`, error);
        return {
          success: false,
          error: `Invalid JSON in file ${fileName}.json`,
        };
      }
    } catch (error) {
      logger.error(`Error reading data from ${fileName}.json:`, error);
      return {
        success: false,
        error: `Failed to read ${fileName}.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Writes data to a JSON file with atomic write pattern and locking
   *
   * @param fileName Name of the file to write (without extension)
   * @param data The data to write
   * @param validator Optional function to validate data before writing
   * @returns AsyncResult indicating success or failure
   */
  async writeData<T>(
    fileName: string,
    data: T,
    validator?: (data: unknown) => boolean
  ): AsyncResult<T> {
    const filePath = this.getFilePath(fileName);
    const tempPath = this.getTempFilePath(filePath);

    // Validate data if validator is provided
    if (validator) {
      const validationResult = this.validateData<T>(data, validator);
      if (!validationResult.success) {
        return {
          success: false,
          error: `Validation failed for ${fileName}.json: ${validationResult.error}`,
        };
      }
    }

    // Acquire lock
    const lockAcquired = await this.tryAcquireLock(filePath);
    if (!lockAcquired) {
      return {
        success: false,
        error: `Could not acquire lock for ${fileName}.json. File may be in use.`,
      };
    }

    try {
      // Create backup before writing
      await this.createBackup(fileName);

      // Write to temporary file first
      await fs.writeFile(
        tempPath,
        JSON.stringify(data, null, 2),
        FILE_ENCODING
      );

      // Replace the original file with the temp file (atomic operation)
      await fs.rename(tempPath, filePath);

      return { success: true, value: data };
    } catch (error) {
      logger.error(`Error writing data to ${fileName}.json:`, error);

      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore errors when cleaning up
      }

      return {
        success: false,
        error: `Failed to write to ${fileName}.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    } finally {
      // Always release the lock
      await this.releaseLock(filePath);
    }
  }

  /**
   * Creates a backup of a data file
   *
   * @param fileName Name of the file to back up (without extension)
   * @returns AsyncResult indicating success or failure
   */
  async createBackup(fileName: string): AsyncResult<string> {
    const filePath = this.getFilePath(fileName);
    const backupPath = this.getBackupFilePath(fileName);

    try {
      // Check if original file exists
      try {
        await fs.access(filePath);
      } catch {
        // No file to back up
        return { success: true, value: "No file to backup" };
      }

      // Copy the file to backup location
      await fs.copyFile(filePath, backupPath);
      logger.info(
        `Created backup of ${fileName}.json at ${path.basename(backupPath)}`
      );

      return { success: true, value: backupPath };
    } catch (error) {
      logger.error(`Error creating backup of ${fileName}.json:`, error);
      return {
        success: false,
        error: `Failed to create backup of ${fileName}.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Restores a data file from the most recent backup
   *
   * @param fileName Name of the file to restore (without extension)
   * @returns AsyncResult indicating success or failure
   */
  async restoreFromLatestBackup(fileName: string): AsyncResult<string> {
    // Sanitize filename to prevent directory traversal
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = this.getFilePath(fileName);

    try {
      // Find all backups for this file
      const backupFiles = (await fs.readdir(this.backupDir))
        .filter(
          (file) =>
            file.startsWith(`${sanitizedName}_`) &&
            file.endsWith(BACKUP_EXTENSION)
        )
        .sort()
        .reverse(); // Sort in reverse to get latest backup first

      if (backupFiles.length === 0) {
        return {
          success: false,
          error: `No backups found for ${fileName}.json`,
        };
      }

      // Get the latest backup
      const latestBackup = path.join(this.backupDir, backupFiles[0]);

      // Acquire lock
      const lockAcquired = await this.tryAcquireLock(filePath);
      if (!lockAcquired) {
        return {
          success: false,
          error: `Could not acquire lock for ${fileName}.json. File may be in use.`,
        };
      }

      try {
        // Copy backup to original location
        await fs.copyFile(latestBackup, filePath);
        logger.info(
          `Restored ${fileName}.json from ${path.basename(latestBackup)}`
        );

        return { success: true, value: latestBackup };
      } finally {
        // Always release the lock
        await this.releaseLock(filePath);
      }
    } catch (error) {
      logger.error(`Error restoring ${fileName}.json from backup:`, error);
      return {
        success: false,
        error: `Failed to restore ${fileName}.json from backup: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Gets a list of all available backups for a file
   *
   * @param fileName Name of the file (without extension)
   * @returns AsyncResult with a list of backup files
   */
  async listBackups(fileName: string): AsyncResult<string[]> {
    // Sanitize filename to prevent directory traversal
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, "");

    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(
          (file) =>
            file.startsWith(`${sanitizedName}_`) &&
            file.endsWith(BACKUP_EXTENSION)
        )
        .sort();

      return { success: true, value: backups };
    } catch (error) {
      logger.error(`Error listing backups for ${fileName}.json:`, error);
      return {
        success: false,
        error: `Failed to list backups for ${fileName}.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Cleans up old backups, keeping only the specified number of most recent backups
   *
   * @param fileName Name of the file (without extension)
   * @param keepCount Number of recent backups to keep
   * @returns AsyncResult with the number of deleted backups
   */
  async cleanupOldBackups(
    fileName: string,
    keepCount: number = 5
  ): AsyncResult<number> {
    try {
      const backupsResult = await this.listBackups(fileName);

      if (!backupsResult.success) {
        return { success: false, error: backupsResult.error, value: 0 };
      }

      const backups = backupsResult.value;

      // If we have fewer backups than the keep count, do nothing
      if (backups.length <= keepCount) {
        return { success: true, value: 0 };
      }

      // Sort backups by date, newest first
      backups.sort().reverse();

      // Get the backups to delete (everything after keepCount)
      const backupsToDelete = backups.slice(keepCount);
      let deletedCount = 0;

      // Delete the old backups
      for (const backup of backupsToDelete) {
        try {
          await fs.unlink(path.join(this.backupDir, backup));
          deletedCount++;
        } catch (error) {
          logger.warn(`Failed to delete backup ${backup}:`, error);
        }
      }

      logger.info(
        `Cleaned up ${deletedCount} old backups for ${fileName}.json`
      );
      return { success: true, value: deletedCount };
    } catch (error) {
      logger.error(
        `Error cleaning up old backups for ${fileName}.json:`,
        error
      );
      return {
        success: false,
        error: `Failed to clean up backups for ${fileName}.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        value: 0,
      };
    }
  }

  /**
   * Performs a scheduled backup of all data files
   *
   * @returns AsyncResult with the number of files backed up
   */
  async backupAllData(): AsyncResult<number> {
    try {
      const files = await fs.readdir(this.baseDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));
      let backupCount = 0;

      for (const file of jsonFiles) {
        const fileName = path.basename(file, ".json");
        const result = await this.createBackup(fileName);

        if (result.success) {
          backupCount++;
        }
      }

      logger.info(`Backed up ${backupCount} data files`);
      return { success: true, value: backupCount };
    } catch (error) {
      logger.error("Error backing up all data:", error);
      return {
        success: false,
        error: `Failed to back up all data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Checks if a file exists
   *
   * @param fileName Name of the file to check (without extension)
   * @returns AsyncResult indicating whether the file exists
   */
  async fileExists(fileName: string): AsyncResult<boolean> {
    const filePath = this.getFilePath(fileName);

    try {
      await fs.access(filePath);
      return { success: true, value: true };
    } catch {
      return { success: true, value: false };
    }
  }

  /**
   * Gets a list of all data files
   *
   * @returns AsyncResult with a list of data file names (without extension)
   */
  async listDataFiles(): AsyncResult<string[]> {
    try {
      const files = await fs.readdir(this.baseDir);
      const jsonFiles = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.basename(file, ".json"));

      return { success: true, value: jsonFiles };
    } catch (error) {
      logger.error("Error listing data files:", error);
      return {
        success: false,
        error: `Failed to list data files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Cleans up old full backups, keeping only the most recent ones
   *
   * @param keepCount Number of backups to keep
   * @returns AsyncResult with the number of deleted backups
   */
  async cleanupOldFullBackups(keepCount: number = 5): AsyncResult<number> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(
          (file) => file.startsWith("full-backup_") && file.endsWith(".zip")
        )
        .sort()
        .reverse(); // Most recent first

      if (backups.length <= keepCount) {
        return { success: true, value: 0 };
      }

      // Get the backups to delete
      const backupsToDelete = backups.slice(keepCount);
      let deletedCount = 0;

      // Delete the old backups
      for (const backup of backupsToDelete) {
        try {
          await fs.unlink(path.join(this.backupDir, backup));
          deletedCount++;
        } catch (error) {
          logger.warn(`Failed to delete old backup ${backup}:`, error);
        }
      }

      logger.info(`Cleaned up ${deletedCount} old full backups`);
      return { success: true, value: deletedCount };
    } catch (error) {
      logger.error("Error cleaning up old backups:", error);
      return {
        success: false,
        error: `Failed to clean up old backups: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
