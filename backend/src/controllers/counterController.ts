import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  Counter,
  CreateCounterRequest,
  UpdateCounterRequest,
  PatchCounterRequest,
} from "@shared/types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import * as fs from "fs/promises";
import * as path from "path";

const COUNTERS_FILE = path.join(__dirname, "../../data/counters.json");

/**
 * Read counters from file
 */
async function readCounters(): Promise<Counter[]> {
  try {
    const data = await fs.readFile(COUNTERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

/**
 * Write counters to file
 */
async function writeCounters(counters: Counter[]): Promise<void> {
  await fs.writeFile(COUNTERS_FILE, JSON.stringify(counters, null, 2));
}

/**
 * Get all counters
 * @route GET /api/counters
 */
export const getAllCounters = asyncHandler(
  async (req: Request, res: Response) => {
    const counters = await readCounters();

    res.status(200).json({
      success: true,
      data: counters,
    });
  }
);

/**
 * Get a counter by ID
 * @route GET /api/counters/:id
 */
export const getCounterById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const counters = await readCounters();
    const counter = counters.find((c) => c.id === id);

    if (!counter) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: counter,
    });
  }
);

/**
 * Create a new counter
 * @route POST /api/counters
 */
export const createCounter = asyncHandler(
  async (req: Request, res: Response) => {
    const counterData: CreateCounterRequest = req.body;

    // Validate counter data
    if (!counterData.name || counterData.name.trim() === "") {
      throw new AppError("Counter name is required", 400);
    }

    if (counterData.goal === undefined || counterData.goal < 0) {
      throw new AppError("Counter goal must be a non-negative number", 400);
    }

    const counters = await readCounters();
    const now = new Date().toISOString();

    const newCounter: Counter = {
      id: uuidv4(),
      name: counterData.name.trim(),
      goal: counterData.goal,
      motivationNote: counterData.motivationNote?.trim() || "",
      currentCount: counterData.currentCount || 0,
      createdAt: now,
      updatedAt: now,
    };

    counters.push(newCounter);
    await writeCounters(counters);

    res.status(201).json({
      success: true,
      data: newCounter,
      message: "Counter created successfully",
    });
  }
);

/**
 * Update a counter
 * @route PUT /api/counters/:id
 */
export const updateCounter = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateCounterRequest = req.body;

    // Validate update data
    if (updateData.name !== undefined && updateData.name.trim() === "") {
      throw new AppError("Counter name cannot be empty", 400);
    }

    if (updateData.goal !== undefined && updateData.goal < 0) {
      throw new AppError("Counter goal must be a non-negative number", 400);
    }

    const counters = await readCounters();
    const counterIndex = counters.findIndex((c) => c.id === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    const updatedCounter: Counter = {
      ...counters[counterIndex],
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.goal !== undefined && { goal: updateData.goal }),
      ...(updateData.motivationNote !== undefined && {
        motivationNote: updateData.motivationNote.trim(),
      }),
      updatedAt: new Date().toISOString(),
    };

    counters[counterIndex] = updatedCounter;
    await writeCounters(counters);

    res.status(200).json({
      success: true,
      data: updatedCounter,
      message: "Counter updated successfully",
    });
  }
);

/**
 * Patch counter count (increment/decrement or set)
 * @route PATCH /api/counters/:id/count
 */
export const patchCounterCount = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const patchData: PatchCounterRequest = req.body;

    if (patchData.currentCount === undefined) {
      throw new AppError("currentCount is required", 400);
    }

    if (patchData.currentCount < 0) {
      throw new AppError("Counter count cannot be negative", 400);
    }

    const counters = await readCounters();
    const counterIndex = counters.findIndex((c) => c.id === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    counters[counterIndex].currentCount = patchData.currentCount;
    counters[counterIndex].updatedAt = new Date().toISOString();

    await writeCounters(counters);

    res.status(200).json({
      success: true,
      data: counters[counterIndex],
      message: "Counter count updated successfully",
    });
  }
);

/**
 * Delete a counter
 * @route DELETE /api/counters/:id
 */
export const deleteCounter = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const counters = await readCounters();
    const counterIndex = counters.findIndex((c) => c.id === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    counters.splice(counterIndex, 1);
    await writeCounters(counters);

    res.status(200).json({
      success: true,
      message: "Counter deleted successfully",
    });
  }
);
