import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

const dataDir = path.join(__dirname, "../../data");

// Ensure data directory exists
export const initializeStorage = async (): Promise<void> => {
  try {
    const exists = await existsAsync(dataDir);
    if (!exists) {
      await mkdirAsync(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    }

    // Initialize empty data files if they don't exist
    await ensureFileExists("habits.json", []);
    await ensureFileExists("habitRecords.json", []);
    await ensureFileExists("notes.json", []);
  } catch (error) {
    console.error("Error initializing storage:", error);
    throw new Error(
      `Storage initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Ensure a file exists, create with default content if not
export const ensureFileExists = async (
  fileName: string,
  defaultContent: any
): Promise<void> => {
  const filePath = path.join(dataDir, fileName);
  try {
    const exists = await existsAsync(filePath);
    if (!exists) {
      await writeFileAsync(filePath, JSON.stringify(defaultContent, null, 2));
      console.log(`Created file: ${fileName}`);
    }
  } catch (error) {
    console.error(`Error ensuring file ${fileName} exists:`, error);
    throw error;
  }
};

// Read data from a file
export const readData = async <T>(fileName: string): Promise<T> => {
  try {
    const filePath = path.join(dataDir, fileName);
    const data = await readFileAsync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading data from ${fileName}:`, error);
    throw error;
  }
};

// Write data to a file
export const writeData = async <T>(
  fileName: string,
  data: T
): Promise<void> => {
  try {
    const filePath = path.join(dataDir, fileName);
    await writeFileAsync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing data to ${fileName}:`, error);
    throw error;
  }
};

// Initialize storage on module load
initializeStorage()
  .then(() => console.log("Storage initialized successfully"))
  .catch((err) => console.error("Storage initialization failed:", err));
