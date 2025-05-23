/**
 * Backup script for habits tracker data
 * Creates a full backup of all data in the backups folder
 *
 * Run with: npx ts-node src/scripts/backup.ts
 */

import { createBackup } from "../services/dataService";
import { formatDateToString } from "../utils/dateUtils";

async function runBackup() {
  try {
    console.log("Starting backup process...");
    const now = new Date();
    console.log(`Backup timestamp: ${now.toISOString()}`);

    const backupData = await createBackup();

    console.log("Backup created successfully!");
    console.log(`Backed up:`);
    console.log(`- ${backupData.habits.length} habits`);
    console.log(`- ${backupData.completions.length} completion records`);
    console.log(`- ${backupData.notes.length} notes`);
    console.log(
      `Backup stored at: data/backups/backup-${formatDateToString(now)}.json`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating backup:", error);
    process.exit(1);
  }
}

// Run the backup
runBackup();
