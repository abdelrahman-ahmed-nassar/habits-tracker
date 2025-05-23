import fs from "fs/promises";
import path from "path";
import { AppError } from "../middlewares/errorMiddleware";
import env from "../config/env";
import logger from "../utils/logger";

/**
 * Service for handling JSON file storage
 */
export class DataService<T extends { id: string }> {
  private dataPath: string;
  private entityName: string;

  /**
   * Create a new data service for a specific entity type
   * @param entityName Name of the entity (used for file name and logging)
   */
  constructor(entityName: string) {
    this.entityName = entityName;
    this.dataPath = path.join(env.DATA_DIR, `${entityName}.json`);
  }

  /**
   * Initialize the data file if it doesn't exist
   */
  async init(): Promise<void> {
    try {
      await fs.access(this.dataPath);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.dataPath, JSON.stringify([]));
      logger.info(`Created new data file for ${this.entityName}`);
    }
  }

  /**
   * Get all items
   */
  async getAll(): Promise<T[]> {
    await this.init();
    const data = await fs.readFile(this.dataPath, "utf8");
    return JSON.parse(data);
  }

  /**
   * Get a single item by ID
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
   * Create a new item
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

    items.push(item);
    await this.saveAll(items);
    return item;
  }

  /**
   * Update an existing item
   */
  async update(id: string, updatedItem: Partial<T>): Promise<T> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError(`${this.entityName} with ID ${id} not found`, 404);
    }

    // Merge the existing item with the updates
    items[index] = { ...items[index], ...updatedItem, id } as T;
    await this.saveAll(items);
    return items[index];
  }

  /**
   * Delete an item
   */
  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const initialLength = items.length;
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === initialLength) {
      throw new AppError(`${this.entityName} with ID ${id} not found`, 404);
    }

    await this.saveAll(filteredItems);
  }

  /**
   * Save all items to the data file
   */
  private async saveAll(items: T[]): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(items, null, 2));
  }
}
