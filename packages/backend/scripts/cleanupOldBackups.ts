#!/usr/bin/env ts-node

/**
 * Script to clean up old backups
 */

import { BackupService } from "../src/services/backupService";
import { FileSystemService } from "../src/services/fileSystemService";

// ANSI color codes for prettier output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Parse command line arguments
const args = process.argv.slice(2);
const keepCount = parseInt(args[0], 10) || 5;

async function cleanupBackups() {
  console.log(
    `${colors.cyan}${colors.bold}=== Cleaning Up Old Backups ===${colors.reset}`
  );
  console.log(
    `${colors.cyan}Keeping the ${keepCount} most recent backups of each type${colors.reset}`
  );

  try {
    // Clean up full backups
    const backupService = new BackupService();
    const fullBackupsDeleted = await backupService.cleanupOldFullBackups(
      keepCount
    );
    console.log(
      `${colors.green}Deleted ${fullBackupsDeleted} old full system backups${colors.reset}`
    );

    // Clean up entity backups
    const fileSystemService = new FileSystemService();
    const dataFilesResult = await fileSystemService.listDataFiles();

    if (dataFilesResult.success) {
      const entityFiles = dataFilesResult.value;
      console.log(
        `${colors.cyan}Cleaning up backups for ${entityFiles.length} entities...${colors.reset}`
      );

      let totalEntityBackupsDeleted = 0;

      for (const entityName of entityFiles) {
        const result = await fileSystemService.cleanupOldBackups(
          entityName,
          keepCount
        );
        if (result.success) {
          totalEntityBackupsDeleted += result.value;
          if (result.value > 0) {
            console.log(
              `${colors.yellow}- Deleted ${result.value} old backups of ${entityName}${colors.reset}`
            );
          }
        } else {
          console.log(
            `${colors.red}- Error cleaning up backups for ${entityName}: ${result.error}${colors.reset}`
          );
        }
      }

      console.log(
        `${colors.green}Deleted ${totalEntityBackupsDeleted} old entity backups${colors.reset}`
      );
    } else {
      console.log(
        `${colors.red}Error listing data files: ${dataFilesResult.error}${colors.reset}`
      );
    }

    console.log(
      `${colors.green}${colors.bold}✓ Backup cleanup completed!${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}${colors.bold}Error cleaning up backups:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Run the cleanup
cleanupBackups();
