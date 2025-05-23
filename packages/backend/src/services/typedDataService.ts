import { FileSystemService } from "./fileSystemService";
import { AppError } from "../middlewares/errorMiddleware";
import logger from "../utils/logger";

/**
 * Generic data service for handling CRUD operations with typed entities
 * Uses FileSystemService for low-level file operations
 */
export class TypedDataService<T extends { id: string }> {
  private fileService: FileSystemService;
  private entityName: string;
  private validator?: (data: unknown) => boolean;

  /**
   * Create a new typed data service
   *
   * @param entityName Name of the entity (used for file name and logging)
   * @param validator Optional type guard function to validate entities
   * @param fileService Optional FileSystemService instance (creates a new one if not provided)
   */
  constructor(
    entityName: string,
    validator?: (data: unknown) => boolean,
    fileService?: FileSystemService
  ) {
    this.entityName = entityName;
    this.validator = validator;
    this.fileService = fileService || new FileSystemService();
  }

  /**
   * Initializes the data file if it doesn't exist
   */
  async init(): Promise<void> {
    const existsResult = await this.fileService.fileExists(this.entityName);

    if (existsResult.success && existsResult.value === false) {
      // File doesn't exist, create it with empty array
      const writeResult = await this.fileService.writeData(this.entityName, []);

      if (!writeResult.success) {
        logger.error(
          `Failed to initialize ${this.entityName} data file:`,
          writeResult.error
        );
        throw new AppError(
          `Failed to initialize ${this.entityName} data file`,
          500
        );
      }

      logger.info(`Created new data file for ${this.entityName}`);
    }
  }

  /**
   * Get all items
   *
   * @returns A Promise resolving to an array of all items
   */
  async getAll(): Promise<T[]> {
    await this.init();

    const result = await this.fileService.readData<T[]>(this.entityName);

    if (!result.success) {
      logger.error(`Failed to read ${this.entityName} data:`, result.error);
      throw new AppError(`Failed to read ${this.entityName} data`, 500);
    }

    return result.value;
  }

  /**
   * Get a single item by ID
   *
   * @param id ID of the item to find
   * @returns A Promise resolving to the found item
   * @throws AppError if item is not found
   */
  async getById(id: string): Promise<T> {
    const items = await this.getAll();
    const item = items.find((item) => item.id === id);

    if (!item) {
      throw new AppError(`${this.entityName} with ID ${id} not found`, 404);
    }

    return item;
  }

  /**
   * Query items based on a filter function
   *
   * @param filterFn Function to filter items
   * @returns A Promise resolving to an array of filtered items
   */
  async query(filterFn: (item: T) => boolean): Promise<T[]> {
    const items = await this.getAll();
    return items.filter(filterFn);
  }

  /**
   * Create a new item
   *
   * @param item The item to create
   * @returns A Promise resolving to the created item
   * @throws AppError if an item with the same ID already exists
   */
  async create(item: T): Promise<T> {
    const items = await this.getAll();

    // Check if item with this ID already exists
    if (items.some((existing) => existing.id === item.id)) {
      throw new AppError(
        `${this.entityName} with ID ${item.id} already exists`,
        409
      );
    }

    // Add the item
    items.push(item);

    // Save with validation if provided
    const result = await this.fileService.writeData(
      this.entityName,
      items,
      this.validator
        ? (data): boolean => {
            if (!Array.isArray(data)) return false;
            // Validate each item if a validator is provided
            return data.every((item) => this.validator!(item));
          }
        : undefined
    );

    if (!result.success) {
      logger.error(`Failed to create ${this.entityName}:`, result.error);
      throw new AppError(`Failed to create ${this.entityName}`, 500);
    }

    return item;
  }

  /**
   * Update an existing item
   *
   * @param id ID of the item to update
   * @param updatedItem Partial item with updates
   * @returns A Promise resolving to the updated item
   * @throws AppError if item is not found
   */
  async update(id: string, updatedItem: Partial<T>): Promise<T> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError(`${this.entityName} with ID ${id} not found`, 404);
    }

    // Merge the existing item with the updates, keeping the same ID
    items[index] = { ...items[index], ...updatedItem, id } as T;

    // Save with validation if provided
    const result = await this.fileService.writeData(
      this.entityName,
      items,
      this.validator
        ? (data): boolean => {
            if (!Array.isArray(data)) return false;
            return data.every((item) => this.validator!(item));
          }
        : undefined
    );

    if (!result.success) {
      logger.error(`Failed to update ${this.entityName}:`, result.error);
      throw new AppError(`Failed to update ${this.entityName}`, 500);
    }

    return items[index];
  }

  /**
   * Delete an item
   *
   * @param id ID of the item to delete
   * @throws AppError if item is not found
   */
  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const initialLength = items.length;
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === initialLength) {
      throw new AppError(`${this.entityName} with ID ${id} not found`, 404);
    }

    const result = await this.fileService.writeData(
      this.entityName,
      filteredItems
    );

    if (!result.success) {
      logger.error(`Failed to delete ${this.entityName}:`, result.error);
      throw new AppError(`Failed to delete ${this.entityName}`, 500);
    }
  }

  /**
   * Create a backup of the data file
   *
   * @returns A promise resolving to the path of the backup file
   */
  async backup(): Promise<string> {
    const result = await this.fileService.createBackup(this.entityName);

    if (!result.success) {
      throw new AppError(
        `Failed to backup ${this.entityName} data: ${result.error}`,
        500
      );
    }

    return result.value;
  }

  /**
   * Restore data from the latest backup
   *
   * @returns A promise resolving to the path of the restored backup file
   */
  async restore(): Promise<string> {
    const result = await this.fileService.restoreFromLatestBackup(
      this.entityName
    );

    if (!result.success) {
      throw new AppError(
        `Failed to restore ${this.entityName} data: ${result.error}`,
        500
      );
    }

    return result.value;
  }

  /**
   * List all available backups for this entity
   *
   * @returns A promise resolving to a list of backup file names
   */
  async listBackups(): Promise<string[]> {
    const result = await this.fileService.listBackups(this.entityName);

    if (!result.success) {
      throw new AppError(
        `Failed to list backups for ${this.entityName}: ${result.error}`,
        500
      );
    }

    return result.value;
  }

  /**
   * Clean up old backups, keeping only the most recent ones
   *
   * @param keepCount Number of recent backups to keep
   * @returns A promise resolving to the number of deleted backups
   */
  async cleanupOldBackups(keepCount: number = 5): Promise<number> {
    const result = await this.fileService.cleanupOldBackups(
      this.entityName,
      keepCount
    );

    if (!result.success) {
      throw new AppError(
        `Failed to clean up backups for ${this.entityName}: ${result.error}`,
        500
      );
    }

    return result.value;
  }
}
