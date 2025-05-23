import fs from "fs";
import path from "path";
import { promisify } from "util";

// Convert callback-based fs functions to Promise-based
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// Base directory for data storage
const dataDir = path.join(__dirname, "../../data");
const backupDir = path.join(dataDir, "backups");

/**
 * Initialize the storage directories
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // Ensure data directory exists
    if (!(await existsAsync(dataDir))) {
      await mkdirAsync(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    }

    // Ensure backups directory exists
    if (!(await existsAsync(backupDir))) {
      await mkdirAsync(backupDir, { recursive: true });
      console.log(`Created backups directory: ${backupDir}`);
    }
  } catch (error) {
    console.error("Error initializing storage directories:", error);
    throw new Error(
      `Storage initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Ensure a file exists with default content
 * @param fileName The name of the file to check/create
 * @param defaultContent The default content if file doesn't exist
 */
export const ensureFileExists = async (
  fileName: string,
  defaultContent: any
): Promise<void> => {
  try {
    const filePath = path.join(dataDir, fileName);

    // Check if file exists
    if (!(await existsAsync(filePath))) {
      // Create directory if it's a nested path
      const fileDir = path.dirname(filePath);
      if (fileDir !== dataDir && !(await existsAsync(fileDir))) {
        await mkdirAsync(fileDir, { recursive: true });
      }

      // Write default content
      await writeFileAsync(
        filePath,
        JSON.stringify(defaultContent, null, 2),
        "utf8"
      );
      console.log(`Created file with default content: ${fileName}`);
    }
  } catch (error) {
    console.error(`Error ensuring file ${fileName} exists:`, error);
    throw error;
  }
};

/**
 * Read data from a JSON file
 * @param fileName The name of the file to read
 * @returns The parsed JSON data
 */
export const readData = async <T>(fileName: string): Promise<T> => {
  try {
    const filePath = path.join(dataDir, fileName);

    // Ensure file exists before reading
    if (!(await existsAsync(filePath))) {
      throw new Error(`File does not exist: ${fileName}`);
    }

    const data = await readFileAsync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Error parsing JSON from ${fileName}:`, error);
      throw new Error(`Invalid JSON in file ${fileName}`);
    }
    console.error(`Error reading data from ${fileName}:`, error);
    throw error;
  }
};

/**
 * Write data to a JSON file
 * @param fileName The name of the file to write to
 * @param data The data to write
 */
export const writeData = async <T>(
  fileName: string,
  data: T
): Promise<void> => {
  try {
    const filePath = path.join(dataDir, fileName);
    await writeFileAsync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing data to ${fileName}:`, error);
    throw error;
  }
};

/**
 * List all files in a directory
 * @param directory The directory to list files from (relative to data directory)
 * @returns Array of file names
 */
export const listFiles = async (directory: string = ""): Promise<string[]> => {
  try {
    const targetDir = directory ? path.join(dataDir, directory) : dataDir;

    if (!(await existsAsync(targetDir))) {
      return [];
    }

    return fs.readdirSync(targetDir);
  } catch (error) {
    console.error(`Error listing files in ${directory}:`, error);
    throw error;
  }
};

/**
 * Delete a file
 * @param fileName The name of the file to delete
 * @returns Whether the deletion was successful
 */
export const deleteFile = async (fileName: string): Promise<boolean> => {
  try {
    const filePath = path.join(dataDir, fileName);

    if (!(await existsAsync(filePath))) {
      return false;
    }

    await promisify(fs.unlink)(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
    throw error;
  }
};

// Initialize storage on module load
initializeStorage()
  .then(() => console.log("Storage initialized"))
  .catch((err) => console.error("Storage initialization failed:", err));
