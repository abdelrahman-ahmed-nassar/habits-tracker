/**
 * Database initialization script
 * Loads sample data into the JSON files
 *
 * Run with: npx ts-node src/scripts/initDb.ts
 */

import { loadSampleData } from "../utils/sampleData";
import { initializeStorage } from "../services/fileStorageService";

async function initializeDatabase() {
  try {
    console.log("Initializing storage...");
    await initializeStorage();

    console.log("Loading sample data...");
    await loadSampleData();

    console.log("Database initialized successfully with sample data!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
