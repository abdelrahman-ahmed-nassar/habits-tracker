import { Router } from "express";
import { TypedRequest, TypedResponse } from "../types/express";
import { DataService } from "../services/dataService";
import { Habit } from "@ultimate-habits-tracker/shared";
import { AppError } from "../middlewares/errorMiddleware";

const router = Router();
const habitService = new DataService<Habit>("habits");

// Get all habits
router.get("/", async (req, res: TypedResponse<Habit[]>, next) => {
  try {
    const habits = await habitService.getAll();
    res.success(habits, "Habits retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Get a single habit by ID
router.get("/:id", async (req, res: TypedResponse<Habit>, next) => {
  try {
    const habit = await habitService.getById(req.params.id);
    res.success(habit, "Habit retrieved successfully");
  } catch (error) {
    next(error);
  }
});

// Create a new habit
router.post(
  "/",
  async (req: TypedRequest<Habit>, res: TypedResponse<Habit>, next) => {
    try {
      // Validate required fields
      const { name, tag, repetition, goalType, goalValue } = req.body;

      if (
        !name ||
        !tag ||
        !repetition ||
        !goalType ||
        goalValue === undefined
      ) {
        throw new AppError("Missing required habit fields", 400);
      }

      // Generate ID if not provided
      if (!req.body.id) {
        req.body.id = Date.now().toString();
      }

      // Set created timestamp
      const now = new Date().toISOString();
      req.body.createdAt = now;
      req.body.updatedAt = now;

      const newHabit = await habitService.create(req.body);
      res.success(newHabit, "Habit created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
);

// Update a habit
router.put(
  "/:id",
  async (
    req: TypedRequest<Partial<Habit>>,
    res: TypedResponse<Habit>,
    next
  ) => {
    try {
      // Update timestamp
      req.body.updatedAt = new Date().toISOString();

      const updatedHabit = await habitService.update(req.params.id, req.body);
      res.success(updatedHabit, "Habit updated successfully");
    } catch (error) {
      next(error);
    }
  }
);

// Delete a habit
router.delete("/:id", async (req, res: TypedResponse<null>, next) => {
  try {
    await habitService.delete(req.params.id);
    res.success(null, "Habit deleted successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
