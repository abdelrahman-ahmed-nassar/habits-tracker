/**
 * Restore script for habits tracker data
 * Restores data from a specified backup file
 *
 * Usage: npx ts-node src/scripts/restore.ts <backup-filename>
 * Example: npx ts-node src/scripts/restore.ts backup-2025-05-25.json
 */

import { restoreFromBackup } from "../services/dataService";
import path from "path";
import fs from "fs";
import { BackupData } from "../types/models";

async function runRestore() {
  try {
    const backupFile = process.argv[2];

    if (!backupFile) {
      console.error("Please provide a backup filename");
      console.log(
        "Usage: npx ts-node src/scripts/restore.ts <backup-filename>"
      );
      process.exit(1);
    }

    const backupPath = path.join(process.cwd(), "data", "backups", backupFile);

    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupPath}`);
      process.exit(1);
    }

    console.log("Starting restore process...");
    console.log(`Restoring from: ${backupPath}`);

    // Read and parse the backup file
    const backupContent = fs.readFileSync(backupPath, "utf8");
    const backupData: BackupData = JSON.parse(backupContent);

    // Restore from the backup data
    await restoreFromBackup(backupData);

    console.log("Restore completed successfully!");
    console.log(`Restored:`);
    console.log(`- ${backupData.habits.length} habits`);
    console.log(`- ${backupData.completions.length} completion records`);
    console.log(`- ${backupData.notes.length} notes`);

    process.exit(0);
  } catch (error) {
    console.error("Error restoring backup:", error);
    process.exit(1);
  }
}

// Run the restore
runRestore();
