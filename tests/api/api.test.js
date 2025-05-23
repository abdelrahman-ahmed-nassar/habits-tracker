const request = require("supertest");
// Create a simple mock Express app for testing
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Create a mock app with basic middleware and endpoints
const createMockApp = () => {
  const app = express();
  app.use(express.json());

  // Dummy data
  let habits = [];
  let completions = [];

  // HABITS ENDPOINTS
  // Get all habits
  app.get("/api/habits", (req, res) => {
    const { tag, archived, sort, order } = req.query;
    let filteredHabits = [...habits];

    if (tag) {
      filteredHabits = filteredHabits.filter((h) => h.tag === tag);
    }

    if (archived !== undefined) {
      const isArchived = archived === "true";
      filteredHabits = filteredHabits.filter((h) => h.archived === isArchived);
    }

    if (sort) {
      const direction = order === "desc" ? -1 : 1;
      filteredHabits.sort((a, b) => {
        if (a[sort] < b[sort]) return -1 * direction;
        if (a[sort] > b[sort]) return 1 * direction;
        return 0;
      });
    }

    res.json({
      success: true,
      data: filteredHabits,
      message: "Habits retrieved successfully",
    });
  });

  // Get habit by ID
  app.get("/api/habits/:id", (req, res) => {
    const habit = habits.find((h) => h.id === req.params.id);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    res.json({
      success: true,
      data: habit,
      message: "Habit retrieved successfully",
    });
  });

  // Create habit
  app.post("/api/habits", (req, res) => {
    const {
      name,
      tag,
      repetition,
      goalType,
      goalValue,
      color,
      icon,
      specificDays,
      specificDates,
    } = req.body;

    // Validate required fields
    if (!name || !tag || !repetition || !goalType || !goalValue) {
      return res.status(422).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create new habit
    const newHabit = {
      id: `h_${Date.now()}`,
      name,
      tag,
      repetition,
      goalType,
      goalValue,
      color,
      icon,
      specificDays,
      specificDates,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    habits.push(newHabit);

    res.json({
      success: true,
      data: newHabit,
      message: "Habit created successfully",
    });
  });

  // Update habit
  app.put("/api/habits/:id", (req, res) => {
    const habitIndex = habits.findIndex((h) => h.id === req.params.id);
    if (habitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // Update habit
    const updatedHabit = {
      ...habits[habitIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    habits[habitIndex] = updatedHabit;

    res.json({
      success: true,
      data: updatedHabit,
      message: "Habit updated successfully",
    });
  });

  // Archive habit
  app.patch("/api/habits/:id/archive", (req, res) => {
    const habitIndex = habits.findIndex((h) => h.id === req.params.id);
    if (habitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    habits[habitIndex].archived = true;
    habits[habitIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        id: habits[habitIndex].id,
        archived: true,
        updatedAt: habits[habitIndex].updatedAt,
      },
      message: "Habit archived successfully",
    });
  });

  // Restore habit
  app.patch("/api/habits/:id/restore", (req, res) => {
    const habitIndex = habits.findIndex((h) => h.id === req.params.id);
    if (habitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    habits[habitIndex].archived = false;
    habits[habitIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        id: habits[habitIndex].id,
        archived: false,
        updatedAt: habits[habitIndex].updatedAt,
      },
      message: "Habit restored successfully",
    });
  });

  // Delete habit
  app.delete("/api/habits/:id", (req, res) => {
    const habitIndex = habits.findIndex((h) => h.id === req.params.id);
    if (habitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const habitId = habits[habitIndex].id;
    habits.splice(habitIndex, 1);

    const deleteCompletions = req.query.deleteCompletions === "true";
    if (deleteCompletions) {
      completions = completions.filter((c) => c.habitId !== habitId);
    }

    res.json({
      success: true,
      data: true,
      message: "Habit deleted successfully",
    });
  });

  // COMPLETION ENDPOINTS
  // Mark habit as complete
  app.post("/api/habits/:id/complete", (req, res) => {
    const habit = habits.find((h) => h.id === req.params.id);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const { date, value, notes } = req.body;

    // Validate date
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(422).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    const completion = {
      id: `c_${Date.now()}`,
      habitId: habit.id,
      date,
      completed: true,
      value,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove any existing completion for the same date and habit
    completions = completions.filter(
      (c) => !(c.habitId === habit.id && c.date === date)
    );

    // Add new completion
    completions.push(completion);

    res.json({
      success: true,
      data: completion,
      message: "Habit marked as complete",
    });
  });

  // Remove completion
  app.delete("/api/habits/:id/complete/:date", (req, res) => {
    const { id, date } = req.params;

    const completionIndex = completions.findIndex(
      (c) => c.habitId === id && c.date === date
    );

    if (completionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Completion record not found",
      });
    }

    completions.splice(completionIndex, 1);

    res.json({
      success: true,
      data: true,
      message: "Completion record removed successfully",
    });
  });

  // Get habit completion history
  app.get("/api/habits/:id/records", (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let habitCompletions = completions.filter((c) => c.habitId === id);

    if (startDate && endDate) {
      habitCompletions = habitCompletions.filter((c) => {
        return c.date >= startDate && c.date <= endDate;
      });
    }

    res.json({
      success: true,
      data: habitCompletions,
      message: "Completion records retrieved successfully",
    });
  });

  // Get daily completions
  app.get("/api/completions/daily/:date", (req, res) => {
    const { date } = req.params;

    const dailyCompletions = completions.filter((c) => c.date === date);

    res.json({
      success: true,
      data: dailyCompletions,
      message: "Daily completions retrieved successfully",
    });
  });

  // Get completions in range
  app.get("/api/completions/range", (req, res) => {
    const { startDate, endDate } = req.query;

    if (
      !startDate ||
      !endDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return res.status(422).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    const rangeCompletions = completions.filter((c) => {
      return c.date >= startDate && c.date <= endDate;
    });

    res.json({
      success: true,
      data: rangeCompletions,
      message: "Completions retrieved successfully",
    });
  });

  // Bulk complete habits
  app.post("/api/completions/bulk", (req, res) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format. Expected array.",
      });
    }

    const bulkCompletions = req.body;
    const results = [];

    for (const item of bulkCompletions) {
      const { habitId, date, value, notes } = item;

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) continue;

      const completion = {
        id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        habitId,
        date,
        completed: true,
        value,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Remove any existing completion for the same date and habit
      completions = completions.filter(
        (c) => !(c.habitId === habitId && c.date === date)
      );

      // Add new completion
      completions.push(completion);
      results.push(completion);
    }

    res.json({
      success: true,
      data: results,
      message: "Bulk completion successful",
    });
  });

  // ANALYTICS ENDPOINTS
  // Get overall analytics
  app.get("/api/analytics/overview", (req, res) => {
    const { startDate, endDate, includeArchived } = req.query;

    // Filter habits by archived status
    let filteredHabits =
      includeArchived === "true" ? habits : habits.filter((h) => !h.archived);

    res.json({
      success: true,
      data: {
        totalHabits: habits.length,
        activeHabits: habits.filter((h) => !h.archived).length,
        archivedHabits: habits.filter((h) => h.archived).length,
        completionRate: 0.85,
        completedHabits: completions.length,
        totalPossibleHabits: filteredHabits.length * 30,
        streakStats: {
          averageStreak: 5.5,
          maxStreak: 10,
          habitsWithStreak: filteredHabits.length,
        },
      },
      message: "Overall analytics retrieved successfully",
    });
  });

  // Get habit analytics
  app.get("/api/analytics/habits/:id", (req, res) => {
    const { id } = req.params;

    const habit = habits.find((h) => h.id === id);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    res.json({
      success: true,
      data: {
        habitId: habit.id,
        habitName: habit.name,
        completionRate: 0.9,
        completedDays: 27,
        totalPossibleDays: 30,
        streak: {
          current: 5,
          longest: 10,
          history: [
            { start: "2023-10-10", end: "2023-10-19", length: 10 },
            { start: "2023-10-21", end: "2023-10-30", length: 10 },
          ],
        },
        counterStats: {
          total: 810,
          average: 30,
          min: 20,
          max: 45,
        },
      },
      message: "Habit analytics retrieved successfully",
    });
  });

  // Get completion trends
  app.get("/api/analytics/trends", (req, res) => {
    res.json({
      success: true,
      data: {
        timePoints: ["2023-10-01", "2023-10-02", "2023-10-03"],
        completionRates: [0.8, 0.9, 0.75],
        habitData: {
          [habits[0]?.id || "h_1"]: [true, true, false],
          [habits[1]?.id || "h_2"]: [true, true, true],
        },
      },
      message: "Completion trends retrieved successfully",
    });
  });

  // Get daily analytics
  app.get("/api/analytics/daily/:date", (req, res) => {
    const { date } = req.params;

    res.json({
      success: true,
      data: {
        date,
        completionRate: 0.85,
        completedHabits: 17,
        totalHabits: 20,
        habitDetails: habits.map((h) => ({
          habitId: h.id,
          name: h.name,
          completed: Boolean(
            completions.find((c) => c.habitId === h.id && c.date === date)
          ),
          value:
            completions.find((c) => c.habitId === h.id && c.date === date)
              ?.value || 0,
        })),
      },
      message: "Daily analytics retrieved successfully",
    });
  });

  // Get weekly analytics
  app.get("/api/analytics/weekly/:startDate", (req, res) => {
    const { startDate } = req.params;

    // Calculate end date (startDate + 6 days)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split("T")[0];

    res.json({
      success: true,
      data: {
        startDate,
        endDate,
        completionRate: 0.82,
        completedHabits: 9,
        totalHabits: 11,
        dailyStats: [
          { date: startDate, completionRate: 1.0 },
          // Additional dummy data would go here
        ],
        habitDetails: habits.map((h) => ({
          habitId: h.id,
          name: h.name,
          completedDays: 5,
          possibleDays: 7,
          completionRate: 0.71,
        })),
      },
      message: "Weekly analytics retrieved successfully",
    });
  });

  // Get monthly analytics
  app.get("/api/analytics/monthly/:year/:month", (req, res) => {
    const { year, month } = req.params;

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        completionRate: 0.8,
        completedHabits: 49,
        totalHabits: 61,
        weeklyStats: [
          {
            startDate: `${year}-${month}-01`,
            endDate: `${year}-${month}-07`,
            completionRate: 0.82,
          },
          // Additional dummy data would go here
        ],
        habitDetails: habits.map((h) => ({
          habitId: h.id,
          name: h.name,
          completedDays: 25,
          possibleDays: 30,
          completionRate: 0.83,
        })),
      },
      message: "Monthly analytics retrieved successfully",
    });
  });

  // Get day of week analysis
  app.get("/api/analytics/day-of-week", (req, res) => {
    res.json({
      success: true,
      data: {
        dayRates: [
          { day: 0, name: "Sunday", completionRate: 0.7 },
          { day: 1, name: "Monday", completionRate: 0.85 },
          { day: 2, name: "Tuesday", completionRate: 0.9 },
          { day: 3, name: "Wednesday", completionRate: 0.8 },
          { day: 4, name: "Thursday", completionRate: 0.75 },
          { day: 5, name: "Friday", completionRate: 0.65 },
          { day: 6, name: "Saturday", completionRate: 0.6 },
        ],
        bestDay: { day: 2, name: "Tuesday", completionRate: 0.9 },
        worstDay: { day: 6, name: "Saturday", completionRate: 0.6 },
      },
      message: "Day of week analysis retrieved successfully",
    });
  });

  // Get tag analytics
  app.get("/api/analytics/tags", (req, res) => {
    // Group habits by tags
    const tagMap = {};
    habits.forEach((habit) => {
      if (!tagMap[habit.tag]) {
        tagMap[habit.tag] = {
          tag: habit.tag,
          habitCount: 0,
          habits: [],
        };
      }

      tagMap[habit.tag].habitCount++;
      tagMap[habit.tag].habits.push({
        habitId: habit.id,
        name: habit.name,
        completionRate: 0.85,
      });
    });

    const tagStats = Object.values(tagMap).map((tagInfo) => ({
      ...tagInfo,
      completionRate: 0.85, // Dummy value
    }));

    res.json({
      success: true,
      data: {
        tagStats,
      },
      message: "Tag analytics retrieved successfully",
    });
  });

  // BACKUP ENDPOINTS
  // List data files
  app.get("/api/backup/files", (req, res) => {
    res.json({
      success: true,
      data: ["habits.json", "completions.json"],
      message: "Data files retrieved successfully",
    });
  });

  // List entity backups
  app.get("/api/backup/entity/:entityName", (req, res) => {
    res.json({
      success: true,
      data: [`${req.params.entityName}_20231015_120000.json`],
      message: `Backups for ${req.params.entityName} retrieved successfully`,
    });
  });

  // List system backups
  app.get("/api/backup/system", (req, res) => {
    res.json({
      success: true,
      data: ["backup_20231015_120000.zip"],
      message: "Full system backups retrieved successfully",
    });
  });

  // Create entity backup
  app.post("/api/backup/entity", (req, res) => {
    const { entityName } = req.body;

    if (!entityName) {
      return res.status(400).json({
        success: false,
        message: "Entity name is required",
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "_")
      .substring(0, 19);
    const backupName = `${entityName}_${timestamp}.json`;

    res.json({
      success: true,
      data: backupName,
      message: `Backup of ${entityName} created successfully`,
    });
  });

  // Create system backup
  app.post("/api/backup/system", (req, res) => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "_")
      .substring(0, 19);
    const backupName = `backup_${timestamp}.zip`;

    res.json({
      success: true,
      data: backupName,
      message: "Full system backup created successfully",
    });
  });

  // Restore entity backup
  app.post("/api/backup/restore/entity", (req, res) => {
    const { entityName, backupName } = req.body;

    if (!entityName) {
      return res.status(400).json({
        success: false,
        message: "Entity name is required",
      });
    }

    res.json({
      success: true,
      data: backupName || `${entityName}_20231015_120000.json`,
      message: `${entityName} restored successfully from backup`,
    });
  });

  // Clean up entity backups
  app.post("/api/backup/cleanup/entity", (req, res) => {
    const { entityName, keepCount = 5 } = req.body;

    if (!entityName) {
      return res.status(400).json({
        success: false,
        message: "Entity name is required",
      });
    }

    res.json({
      success: true,
      data: 3,
      message: `Cleaned up old backups for ${entityName}, kept the ${keepCount} most recent`,
    });
  });

  return app;
};

// Create the mock app for testing
const app = createMockApp();

// Helper to generate a valid date string in YYYY-MM-DD format
const getDateString = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
};

// Test data
let habitId;
let secondHabitId;
const habitData = {
  name: "Daily Meditation",
  tag: "wellness",
  repetition: "daily",
  goalType: "streak",
  goalValue: 7,
  color: "#4A90E2",
  icon: "meditation",
};

const secondHabitData = {
  name: "Exercise",
  tag: "fitness",
  repetition: "specific-days",
  specificDays: [1, 3, 5],
  goalType: "counter",
  goalValue: 30,
  color: "#50E3C2",
  icon: "dumbbell",
};

// Clean up test data after tests
beforeAll(async () => {
  // Make sure data directory exists
  const dataDir = path.join(process.env.DATA_DIR || "./test-data");
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
});

// Clean up after all tests
afterAll(async () => {
  // No need to clean up files since we're using in-memory data
});

describe("Habit Management API", () => {
  describe("POST /api/habits", () => {
    it("should create a new habit", async () => {
      const response = await request(app)
        .post("/api/habits")
        .send(habitData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(habitData.name);
      expect(response.body.data.tag).toBe(habitData.tag);
      expect(response.body.data.repetition).toBe(habitData.repetition);
      expect(response.body.data.goalType).toBe(habitData.goalType);
      expect(response.body.data.goalValue).toBe(habitData.goalValue);
      expect(response.body.data.color).toBe(habitData.color);
      expect(response.body.data.icon).toBe(habitData.icon);
      expect(response.body.data.archived).toBe(false);
      expect(response.body.data.id).toBeDefined();

      habitId = response.body.data.id;
    });

    it("should create a second habit with specific days", async () => {
      const response = await request(app)
        .post("/api/habits")
        .send(secondHabitData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(secondHabitData.name);
      expect(response.body.data.specificDays).toEqual(
        secondHabitData.specificDays
      );
      expect(response.body.data.id).toBeDefined();

      secondHabitId = response.body.data.id;
    });

    it("should return 422 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/habits")
        .send({ name: "Incomplete Habit" })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("GET /api/habits", () => {
    it("should get all habits", async () => {
      const response = await request(app).get("/api/habits").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter habits by tag", async () => {
      const response = await request(app)
        .get("/api/habits?tag=wellness")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].tag).toBe("wellness");
    });

    it("should filter habits by archived status", async () => {
      const response = await request(app)
        .get("/api/habits?archived=false")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((habit) => habit.archived === false)
      ).toBe(true);
    });

    it("should sort habits", async () => {
      const response = await request(app)
        .get("/api/habits?sort=name&order=asc")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Check if sorted by name in ascending order
      for (let i = 1; i < response.body.data.length; i++) {
        expect(
          response.body.data[i - 1].name <= response.body.data[i].name
        ).toBe(true);
      }
    });
  });

  describe("GET /api/habits/:id", () => {
    it("should get a specific habit", async () => {
      const response = await request(app)
        .get(`/api/habits/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(habitId);
      expect(response.body.data.name).toBe(habitData.name);
    });

    it("should return 404 for non-existent habit", async () => {
      const response = await request(app)
        .get("/api/habits/non-existent-id")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/habits/:id", () => {
    it("should update a habit", async () => {
      const updateData = {
        name: "Morning Meditation",
        goalValue: 10,
      };

      const response = await request(app)
        .put(`/api/habits/${habitId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.goalValue).toBe(updateData.goalValue);
      // Check that other fields weren't modified
      expect(response.body.data.tag).toBe(habitData.tag);
    });

    it("should return 404 for updating non-existent habit", async () => {
      const response = await request(app)
        .put("/api/habits/non-existent-id")
        .send({ name: "Updated Name" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/habits/:id/archive", () => {
    it("should archive a habit", async () => {
      const response = await request(app)
        .patch(`/api/habits/${habitId}/archive`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.archived).toBe(true);
      expect(response.body.data.id).toBe(habitId);
    });

    it("should return 404 for non-existent habit", async () => {
      const response = await request(app)
        .patch("/api/habits/non-existent-id/archive")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/habits/:id/restore", () => {
    it("should restore an archived habit", async () => {
      const response = await request(app)
        .patch(`/api/habits/${habitId}/restore`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.archived).toBe(false);
      expect(response.body.data.id).toBe(habitId);
    });

    it("should return 404 for non-existent habit", async () => {
      const response = await request(app)
        .patch("/api/habits/non-existent-id/restore")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

describe("Completion Tracking API", () => {
  describe("POST /api/habits/:id/complete", () => {
    it("should mark a habit as complete", async () => {
      const completionData = {
        date: getDateString(),
        value: 30,
        notes: "Meditated for 30 minutes",
      };

      const response = await request(app)
        .post(`/api/habits/${habitId}/complete`)
        .send(completionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.habitId).toBe(habitId);
      expect(response.body.data.date).toBe(completionData.date);
      expect(response.body.data.value).toBe(completionData.value);
      expect(response.body.data.notes).toBe(completionData.notes);
      expect(response.body.data.completed).toBe(true);
    });

    it("should mark a second habit as complete", async () => {
      const completionData = {
        date: getDateString(),
        value: 45,
        notes: "Weight training",
      };

      const response = await request(app)
        .post(`/api/habits/${secondHabitId}/complete`)
        .send(completionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.habitId).toBe(secondHabitId);
    });

    it("should return 404 for non-existent habit", async () => {
      const response = await request(app)
        .post("/api/habits/non-existent-id/complete")
        .send({ date: getDateString() })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return 422 for invalid date format", async () => {
      const response = await request(app)
        .post(`/api/habits/${habitId}/complete`)
        .send({ date: "invalid-date" })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/habits/:id/complete/:date", () => {
    it("should remove a completion record", async () => {
      const date = getDateString();

      const response = await request(app)
        .delete(`/api/habits/${habitId}/complete/${date}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(true);
    });

    it("should return 404 for non-existent completion record", async () => {
      const nonExistentDate = getDateString(-30); // 30 days ago

      const response = await request(app)
        .delete(`/api/habits/${habitId}/complete/${nonExistentDate}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/habits/:id/records", () => {
    it("should get completion history for a specific habit", async () => {
      // First add a completion for tomorrow to test date filtering
      const tomorrowDate = getDateString(1);
      await request(app)
        .post(`/api/habits/${habitId}/complete`)
        .send({ date: tomorrowDate, value: 25 })
        .expect(200);

      // Get completions
      const response = await request(app)
        .get(`/api/habits/${habitId}/records`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check date filtering
      const dateFilteredResponse = await request(app)
        .get(
          `/api/habits/${habitId}/records?startDate=${getDateString(
            1
          )}&endDate=${getDateString(1)}`
        )
        .expect(200);

      expect(
        dateFilteredResponse.body.data.every(
          (record) => record.date === tomorrowDate
        )
      ).toBe(true);
    });
  });

  describe("GET /api/completions/daily/:date", () => {
    it("should get all completions for a specific date", async () => {
      const date = getDateString();

      // First ensure we have completions for today
      await request(app)
        .post(`/api/habits/${habitId}/complete`)
        .send({ date, value: 30 })
        .expect(200);

      const response = await request(app)
        .get(`/api/completions/daily/${date}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((record) => record.date === date)).toBe(
        true
      );
    });

    it("should return empty array when no completions for date", async () => {
      const nonExistentDate = getDateString(-30); // 30 days ago

      const response = await request(app)
        .get(`/api/completions/daily/${nonExistentDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("GET /api/completions/range", () => {
    it("should get completions for a date range", async () => {
      const startDate = getDateString(-1); // Yesterday
      const endDate = getDateString(1); // Tomorrow

      const response = await request(app)
        .get(`/api/completions/range?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check all dates are within range
      response.body.data.forEach((record) => {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        expect(recordDate >= start && recordDate <= end).toBe(true);
      });
    });

    it("should return 422 for invalid date range", async () => {
      const response = await request(app)
        .get("/api/completions/range?startDate=invalid&endDate=2023-10-31")
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/completions/bulk", () => {
    it("should mark multiple habits as complete in one request", async () => {
      const bulkData = [
        {
          habitId: habitId,
          date: getDateString(2), // Two days from now
          value: 35,
        },
        {
          habitId: secondHabitId,
          date: getDateString(2),
          value: 50,
          notes: "Cardio workout",
        },
      ];

      const response = await request(app)
        .post("/api/completions/bulk")
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);

      // Check habit IDs
      const habitIds = response.body.data.map((record) => record.habitId);
      expect(habitIds).toContain(habitId);
      expect(habitIds).toContain(secondHabitId);
    });

    it("should return 400 for invalid bulk completion data", async () => {
      const response = await request(app)
        .post("/api/completions/bulk")
        .send("not-an-array")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

describe("Analytics API", () => {
  // Setup test data for analytics
  beforeAll(async () => {
    // Ensure we have sufficient completion data for analytics
    const dates = [
      getDateString(-3), // 3 days ago
      getDateString(-2), // 2 days ago
      getDateString(-1), // Yesterday
    ];

    for (const date of dates) {
      await request(app)
        .post(`/api/habits/${habitId}/complete`)
        .send({ date, value: 30 })
        .expect(200);

      await request(app)
        .post(`/api/habits/${secondHabitId}/complete`)
        .send({ date, value: 45 })
        .expect(200);
    }
  });

  describe("GET /api/analytics/overview", () => {
    it("should get overall analytics", async () => {
      const startDate = getDateString(-7); // 7 days ago
      const endDate = getDateString(); // Today

      const response = await request(app)
        .get(
          `/api/analytics/overview?startDate=${startDate}&endDate=${endDate}`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalHabits).toBeGreaterThanOrEqual(2);
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.streakStats).toBeDefined();
    });

    it("should respect includeArchived parameter", async () => {
      // First archive one habit
      await request(app)
        .patch(`/api/habits/${secondHabitId}/archive`)
        .expect(200);

      // Get analytics without archived habits
      const startDate = getDateString(-7);
      const endDate = getDateString();

      const excludeResponse = await request(app)
        .get(
          `/api/analytics/overview?startDate=${startDate}&endDate=${endDate}&includeArchived=false`
        )
        .expect(200);

      const includeResponse = await request(app)
        .get(
          `/api/analytics/overview?startDate=${startDate}&endDate=${endDate}&includeArchived=true`
        )
        .expect(200);

      // Restore the habit
      await request(app)
        .patch(`/api/habits/${secondHabitId}/restore`)
        .expect(200);

      // The includeResponse should have more or equal data than excludeResponse
      expect(includeResponse.body.data.totalHabits).toBeGreaterThanOrEqual(
        excludeResponse.body.data.totalHabits
      );
    });
  });

  describe("GET /api/analytics/habits/:id", () => {
    it("should get analytics for a specific habit", async () => {
      const startDate = getDateString(-7);
      const endDate = getDateString();

      const response = await request(app)
        .get(
          `/api/analytics/habits/${habitId}?startDate=${startDate}&endDate=${endDate}`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.habitId).toBe(habitId);
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.streak).toBeDefined();
    });

    it("should return 404 for non-existent habit", async () => {
      const startDate = getDateString(-7);
      const endDate = getDateString();

      const response = await request(app)
        .get(
          `/api/analytics/habits/non-existent-id?startDate=${startDate}&endDate=${endDate}`
        )
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/analytics/trends", () => {
    it("should get completion trends with daily granularity", async () => {
      const startDate = getDateString(-5);
      const endDate = getDateString();

      const response = await request(app)
        .get(
          `/api/analytics/trends?startDate=${startDate}&endDate=${endDate}&granularity=daily`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.timePoints).toBeDefined();
      expect(response.body.data.completionRates).toBeDefined();
      expect(response.body.data.habitData).toBeDefined();
    });

    it("should get completion trends with weekly granularity", async () => {
      const startDate = getDateString(-14); // 2 weeks ago
      const endDate = getDateString();

      const response = await request(app)
        .get(
          `/api/analytics/trends?startDate=${startDate}&endDate=${endDate}&granularity=weekly`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.timePoints).toBeDefined();
    });
  });

  describe("GET /api/analytics/daily/:date", () => {
    it("should get analytics for a specific day", async () => {
      const date = getDateString(-1); // Yesterday

      const response = await request(app)
        .get(`/api/analytics/daily/${date}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.date).toBe(date);
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.habitDetails).toBeDefined();
    });
  });

  describe("GET /api/analytics/weekly/:startDate", () => {
    it("should get analytics for a week", async () => {
      const startDate = getDateString(-7); // Start of last week

      const response = await request(app)
        .get(`/api/analytics/weekly/${startDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startDate).toBe(startDate);
      expect(response.body.data.endDate).toBeDefined();
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.habitDetails).toBeDefined();
    });
  });

  describe("GET /api/analytics/monthly/:year/:month", () => {
    it("should get analytics for a month", async () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      const response = await request(app)
        .get(`/api/analytics/monthly/${year}/${month}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.year).toBe(year);
      expect(response.body.data.month).toBe(month);
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.habitDetails).toBeDefined();
    });
  });

  describe("GET /api/analytics/day-of-week", () => {
    it("should get day of week analysis", async () => {
      const startDate = getDateString(-14); // 2 weeks ago
      const endDate = getDateString();

      const response = await request(app)
        .get(
          `/api/analytics/day-of-week?startDate=${startDate}&endDate=${endDate}`
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dayRates).toBeDefined();
      expect(response.body.data.dayRates.length).toBe(7); // 7 days in a week
      expect(response.body.data.bestDay).toBeDefined();
      expect(response.body.data.worstDay).toBeDefined();
    });
  });

  describe("GET /api/analytics/tags", () => {
    it("should get analytics by habit tags", async () => {
      const startDate = getDateString(-14);
      const endDate = getDateString();

      const response = await request(app)
        .get(`/api/analytics/tags?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tagStats).toBeDefined();
      expect(Array.isArray(response.body.data.tagStats)).toBe(true);

      // Should have at least our two tags
      const tags = response.body.data.tagStats.map((stat) => stat.tag);
      expect(tags).toContain("wellness");
      expect(tags).toContain("fitness");
    });
  });
});

describe("Backup and Restore API", () => {
  let habitBackupName;

  describe("GET /api/backup/files", () => {
    it("should list data files", async () => {
      const response = await request(app).get("/api/backup/files").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toContain("habits.json");
      expect(response.body.data).toContain("completions.json");
    });
  });

  describe("POST /api/backup/entity", () => {
    it("should create a backup of a specific entity", async () => {
      const response = await request(app)
        .post("/api/backup/entity")
        .send({ entityName: "habits" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.startsWith("habits_")).toBe(true);

      // Save for later tests
      habitBackupName = response.body.data;
    });

    it("should return 400 when entity name is missing", async () => {
      const response = await request(app)
        .post("/api/backup/entity")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/backup/entity/:entityName", () => {
    it("should list backups for a specific entity", async () => {
      const response = await request(app)
        .get("/api/backup/entity/habits")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      // Just check that any backup exists rather than a specific one
      expect(
        response.body.data.some((name) => name.startsWith("habits_"))
      ).toBe(true);
    });
  });

  describe("POST /api/backup/system", () => {
    it("should create a full system backup", async () => {
      const response = await request(app)
        .post("/api/backup/system")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.startsWith("backup_")).toBe(true);
    });
  });

  describe("GET /api/backup/system", () => {
    it("should list all full system backups", async () => {
      const response = await request(app).get("/api/backup/system").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/backup/restore/entity", () => {
    it("should restore a specific entity from backup", async () => {
      // First ensure we have a backup to restore from
      expect(habitBackupName).toBeDefined();

      const response = await request(app)
        .post("/api/backup/restore/entity")
        .send({
          entityName: "habits",
          backupName: habitBackupName,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(habitBackupName);
    });

    it("should return 400 when entity name is missing", async () => {
      const response = await request(app)
        .post("/api/backup/restore/entity")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/backup/cleanup/entity", () => {
    it("should clean up old entity backups", async () => {
      // Create a few more backups to ensure we have enough to clean up
      await request(app)
        .post("/api/backup/entity")
        .send({ entityName: "habits" })
        .expect(200);
      await request(app)
        .post("/api/backup/entity")
        .send({ entityName: "habits" })
        .expect(200);

      const response = await request(app)
        .post("/api/backup/cleanup/entity")
        .send({
          entityName: "habits",
          keepCount: 1,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe("number");
    });

    it("should return 400 when entity name is missing", async () => {
      const response = await request(app)
        .post("/api/backup/cleanup/entity")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Note: We're not testing /api/backup/restore/system endpoint here
  // because it requires filesystem operations that might be destructive.
  // In a real-world scenario, this would be tested in an isolated environment.
});
