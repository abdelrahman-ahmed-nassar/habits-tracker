import { Router } from "express";
import path from "path";
import { TypedRequest, TypedResponse } from "../types/express";
import { NextFunction } from "express";
import { BackupService } from "../services/backupService";
import { FileSystemService } from "../services/fileSystemService";
import { AppError } from "../middlewares/errorMiddleware";

interface IBackupRequest {
  entityName?: string;
  keepCount?: number;
}

interface IRestoreRequest {
  entityName: string;
  backupName?: string;
}

const router = Router();
const backupService = new BackupService();
const fileSystemService = new FileSystemService();

/**
 * Get list of all data files
 */
router.get(
  "/files",
  async (req, res: TypedResponse<string[]>, next: NextFunction) => {
    try {
      const result = await fileSystemService.listDataFiles();

      if (!result.success) {
        throw new AppError(`Failed to list data files: ${result.error}`, 500);
      }

      res.success(result.value, "Data files retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get list of backups for a specific entity
 */
router.get(
  "/entity/:entityName",
  async (req, res: TypedResponse<string[]>, next: NextFunction) => {
    try {
      const { entityName } = req.params;

      const result = await fileSystemService.listBackups(entityName);

      if (!result.success) {
        throw new AppError(
          `Failed to list backups for ${entityName}: ${result.error}`,
          500
        );
      }

      res.success(
        result.value,
        `Backups for ${entityName} retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get list of all full system backups
 */
router.get(
  "/system",
  async (req, res: TypedResponse<string[]>, next: NextFunction) => {
    try {
      const backups = await backupService.listFullBackups();
      res.success(backups, "Full system backups retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a backup of a specific entity
 */
router.post(
  "/entity",
  async (
    req: TypedRequest<IBackupRequest>,
    res: TypedResponse<string>,
    next: NextFunction
  ) => {
    try {
      const { entityName } = req.body;

      if (!entityName) {
        throw new AppError("Entity name is required", 400);
      }

      const result = await fileSystemService.createBackup(entityName);

      if (!result.success) {
        throw new AppError(
          `Failed to create backup for ${entityName}: ${result.error}`,
          500
        );
      }

      res.success(result.value, `Backup of ${entityName} created successfully`);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a full system backup
 */
router.post(
  "/system",
  async (req, res: TypedResponse<string>, next: NextFunction) => {
    try {
      const backupPath = await backupService.performFullBackup();
      const backupFileName = path.basename(backupPath);

      res.success(backupFileName, "Full system backup created successfully");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Restore a specific entity from backup
 */
router.post(
  "/restore/entity",
  async (
    req: TypedRequest<IRestoreRequest>,
    res: TypedResponse<string>,
    next: NextFunction
  ) => {
    try {
      const { entityName } = req.body;

      if (!entityName) {
        throw new AppError("Entity name is required", 400);
      }

      const result = await fileSystemService.restoreFromLatestBackup(
        entityName
      );

      if (!result.success) {
        throw new AppError(
          `Failed to restore ${entityName}: ${result.error}`,
          500
        );
      }

      res.success(
        result.value,
        `${entityName} restored successfully from backup`
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Restore from a full system backup
 * Not fully implemented - requires extract-zip or similar library
 */
router.post(
  "/restore/system",
  async (
    req: TypedRequest<{ backupName: string }>,
    res: TypedResponse<boolean>,
    next: NextFunction
  ) => {
    try {
      const { backupName } = req.body;

      if (!backupName) {
        throw new AppError("Backup name is required", 400);
      }

      // Note: This is a simplified example. In a real implementation,
      // you would need to validate the backup name and ensure it exists.
      const backupDir = path.join(
        process.env.DATA_DIR || "./data",
        "backups",
        "full"
      );
      const backupPath = path.join(backupDir, backupName);

      const result = await backupService.restoreFromFullBackup(backupPath);
      res.success(result, "System restored successfully from backup");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Clean up old entity backups
 */
router.post(
  "/cleanup/entity",
  async (
    req: TypedRequest<IBackupRequest>,
    res: TypedResponse<number>,
    next: NextFunction
  ) => {
    try {
      const { entityName, keepCount = 5 } = req.body;

      if (!entityName) {
        throw new AppError("Entity name is required", 400);
      }

      const result = await fileSystemService.cleanupOldBackups(
        entityName,
        keepCount
      );

      if (!result.success) {
        throw new AppError(
          `Failed to clean up backups for ${entityName}: ${result.error}`,
          500
        );
      }

      res.success(
        result.value,
        `Cleaned up old backups for ${entityName}, kept the ${keepCount} most recent`
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Clean up old full system backups
 */
router.post(
  "/cleanup/system",
  async (
    req: TypedRequest<{ keepCount: number }>,
    res: TypedResponse<number>,
    next: NextFunction
  ) => {
    try {
      const { keepCount = 5 } = req.body;
      const deletedCount = await backupService.cleanupOldFullBackups(keepCount);

      res.success(
        deletedCount,
        `Cleaned up old system backups, kept the ${keepCount} most recent`
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
