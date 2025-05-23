#!/usr/bin/env ts-node

/**
 * Script to manually create a full system backup
 */

import { BackupService } from "../src/services/backupService";
import path from "path";

// ANSI color codes for prettier output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function createBackup() {
  console.log(
    `${colors.cyan}${colors.bold}=== Creating Full System Backup ===${colors.reset}`
  );

  try {
    const backupService = new BackupService();
    const backupPath = await backupService.performFullBackup();
    const backupFileName = path.basename(backupPath);

    console.log(
      `${colors.green}${colors.bold}✓ Backup created successfully!${colors.reset}`
    );
    console.log(`${colors.green}Backup file: ${backupFileName}${colors.reset}`);
    console.log(`${colors.green}Backup path: ${backupPath}${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}${colors.bold}Error creating backup:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Run the backup
createBackup();
