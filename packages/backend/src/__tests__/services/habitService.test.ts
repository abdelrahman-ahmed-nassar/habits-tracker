import { HabitService } from "../../services/habitService";
import { TypedDataService } from "../../services/typedDataService";
import {
  Habit,
  HabitTag,
  RepetitionPattern,
  GoalType,
} from "../../../../shared/src/habits";
import { Completion } from "../../../../shared/src/completions";

// Mock the TypedDataService
jest.mock("../../services/typedDataService");

describe("HabitService", () => {
  let habitService: HabitService;
  let mockHabit: Habit;
  let mockCompletions: Completion[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create service instance
    habitService = new HabitService();

    // Set up mock data
    mockHabit = {
      id: "test-habit-1",
      name: "Test Habit",
      tag: HabitTag.Health,
      repetition: RepetitionPattern.Daily,
      goalType: GoalType.Streak,
      goalValue: 7,
      archived: false,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    };

    // Mock today as 2023-01-05 for consistent testing
    jest.useFakeTimers().setSystemTime(new Date("2023-01-05T12:00:00Z"));

    // Set up mock completions
    mockCompletions = [
      {
        id: "comp-1",
        habitId: "test-habit-1",
        date: "2023-01-04T12:00:00Z",
        value: 1,
        notes: "Completed yesterday",
      },
      {
        id: "comp-2",
        habitId: "test-habit-1",
        date: "2023-01-03T12:00:00Z",
        value: 1,
        notes: "Completed 2 days ago",
      },
      {
        id: "comp-3",
        habitId: "test-habit-1",
        date: "2023-01-02T12:00:00Z",
        value: 1,
        notes: "Completed 3 days ago",
      },
    ];

    // Mock the TypedDataService methods
    (TypedDataService.prototype.getAll as jest.Mock).mockImplementation(
      (entityName) => {
        if (entityName === "habits" || !entityName) {
          return Promise.resolve([mockHabit]);
        } else if (entityName === "completions") {
          return Promise.resolve(mockCompletions);
        }
        return Promise.resolve([]);
      }
    );

    (TypedDataService.prototype.getById as jest.Mock).mockResolvedValue(
      mockHabit
    );
    (TypedDataService.prototype.create as jest.Mock).mockImplementation(
      (item) => Promise.resolve(item)
    );
    (TypedDataService.prototype.update as jest.Mock).mockImplementation(
      (id, updates) => {
        const updated = { ...mockHabit, ...updates };
        return Promise.resolve(updated);
      }
    );
    (TypedDataService.prototype.delete as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  afterEach(() => {
    // Restore timers
    jest.useRealTimers();
  });

  describe("getAllHabits", () => {
    it("should return habits with streak information", async () => {
      const result = await habitService.getAllHabits();

      // Check that the data service was called
      expect(TypedDataService.prototype.getAll).toHaveBeenCalledWith();

      // Check that we have streak data
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockHabit.id);
      expect(result[0].streak).toBeDefined();
      expect(result[0].streak.currentStreak).toBe(3); // 3 consecutive days completed
    });

    it("should filter out archived habits by default", async () => {
      // Mock a mix of archived and active habits
      const archivedHabit = {
        ...mockHabit,
        id: "archived-habit",
        archived: true,
      };
      (TypedDataService.prototype.getAll as jest.Mock).mockImplementation(
        (entityName) => {
          if (entityName === "habits" || !entityName) {
            return Promise.resolve([mockHabit, archivedHabit]);
          } else if (entityName === "completions") {
            return Promise.resolve(mockCompletions);
          }
          return Promise.resolve([]);
        }
      );

      const result = await habitService.getAllHabits();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockHabit.id);
      expect(result[0].archived).toBe(false);
    });

    it("should include archived habits when filter.includeArchived is true", async () => {
      // Mock a mix of archived and active habits
      const archivedHabit = {
        ...mockHabit,
        id: "archived-habit",
        archived: true,
      };
      (TypedDataService.prototype.getAll as jest.Mock).mockImplementation(
        (entityName) => {
          if (entityName === "habits" || !entityName) {
            return Promise.resolve([mockHabit, archivedHabit]);
          } else if (entityName === "completions") {
            return Promise.resolve(mockCompletions);
          }
          return Promise.resolve([]);
        }
      );

      const result = await habitService.getAllHabits({ includeArchived: true });

      expect(result).toHaveLength(2);
      expect(result.some((h) => h.archived)).toBe(true);
    });
  });

  describe("getHabitById", () => {
    it("should return a habit with streak information", async () => {
      const result = await habitService.getHabitById("test-habit-1");

      // Check that the data service was called with the right ID
      expect(TypedDataService.prototype.getById).toHaveBeenCalledWith(
        "test-habit-1"
      );

      // Check that we have streak data
      expect(result.id).toBe(mockHabit.id);
      expect(result.streak).toBeDefined();
      expect(result.streak.currentStreak).toBe(3); // 3 consecutive days completed
    });
  });

  describe("createHabit", () => {
    it("should create a new habit with generated ID and timestamps", async () => {
      const habitData = {
        name: "New Habit",
        tag: HabitTag.Learning,
        repetition: RepetitionPattern.Daily,
        goalType: GoalType.Counter,
        goalValue: 5,
      };

      const result = await habitService.createHabit(habitData);

      // Check ID and timestamps were generated
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.archived).toBe(false);

      // Check streak data was added
      expect(result.streak).toBeDefined();
      expect(result.streak.currentStreak).toBe(0); // New habit has no completions
    });

    it("should validate weekly habits require specific days", async () => {
      const habitData = {
        name: "Weekly Habit Without Days",
        tag: HabitTag.Learning,
        repetition: RepetitionPattern.Weekly,
        goalType: GoalType.Counter,
        goalValue: 5,
      };

      await expect(habitService.createHabit(habitData)).rejects.toThrow(
        "Weekly habits require specific days to be set"
      );
    });

    it("should validate monthly habits require specific dates", async () => {
      const habitData = {
        name: "Monthly Habit Without Dates",
        tag: HabitTag.Learning,
        repetition: RepetitionPattern.Monthly,
        goalType: GoalType.Counter,
        goalValue: 5,
      };

      await expect(habitService.createHabit(habitData)).rejects.toThrow(
        "Monthly habits require specific dates to be set"
      );
    });
  });

  describe("updateHabit", () => {
    it("should update a habit and preserve other fields", async () => {
      const updates = {
        name: "Updated Name",
        goalValue: 10,
      };

      const result = await habitService.updateHabit("test-habit-1", updates);

      // Check update was called with right parameters
      expect(TypedDataService.prototype.update).toHaveBeenCalledWith(
        "test-habit-1",
        expect.objectContaining({
          name: "Updated Name",
          goalValue: 10,
          updatedAt: expect.any(String),
        })
      );

      // Check fields were updated
      expect(result.name).toBe("Updated Name");
      expect(result.goalValue).toBe(10);

      // Check streak data was added
      expect(result.streak).toBeDefined();
    });
  });

  describe("deleteHabit", () => {
    it("should delete a habit", async () => {
      await habitService.deleteHabit("test-habit-1", false);

      // Check delete was called with right parameters
      expect(TypedDataService.prototype.delete).toHaveBeenCalledWith(
        "test-habit-1"
      );
    });

    it("should delete a habit and its completions when deleteCompletions is true", async () => {
      // Mock multiple completions for this habit
      (TypedDataService.prototype.getAll as jest.Mock).mockImplementation(
        (entityName) => {
          if (entityName === "completions") {
            return Promise.resolve([
              { id: "comp-1", habitId: "test-habit-1" },
              { id: "comp-2", habitId: "test-habit-1" },
              { id: "comp-3", habitId: "different-habit" },
            ]);
          }
          return Promise.resolve([mockHabit]);
        }
      );

      await habitService.deleteHabit("test-habit-1", true);

      // Check habit was deleted
      expect(TypedDataService.prototype.delete).toHaveBeenCalledWith(
        "test-habit-1"
      );

      // Check completions were deleted
      expect(TypedDataService.prototype.delete).toHaveBeenCalledWith("comp-1");
      expect(TypedDataService.prototype.delete).toHaveBeenCalledWith("comp-2");

      // Check that we didn't delete completions for other habits
      expect(TypedDataService.prototype.delete).not.toHaveBeenCalledWith(
        "comp-3"
      );
    });
  });

  describe("archiveHabit", () => {
    it("should archive a habit", async () => {
      const result = await habitService.archiveHabit("test-habit-1");

      // Check update was called with right parameters
      expect(TypedDataService.prototype.update).toHaveBeenCalledWith(
        "test-habit-1",
        expect.objectContaining({
          archived: true,
          updatedAt: expect.any(String),
        })
      );

      // Check habit was archived
      expect(result.archived).toBe(true);

      // Check streak data was added
      expect(result.streak).toBeDefined();
    });
  });

  describe("restoreHabit", () => {
    it("should restore an archived habit", async () => {
      // Mock an archived habit
      (TypedDataService.prototype.getById as jest.Mock).mockResolvedValue({
        ...mockHabit,
        archived: true,
      });

      const result = await habitService.restoreHabit("test-habit-1");

      // Check update was called with right parameters
      expect(TypedDataService.prototype.update).toHaveBeenCalledWith(
        "test-habit-1",
        expect.objectContaining({
          archived: false,
          updatedAt: expect.any(String),
        })
      );

      // Check habit was restored
      expect(result.archived).toBe(false);
    });

    it("should throw error when trying to restore a non-archived habit", async () => {
      // Mock a regular non-archived habit
      (TypedDataService.prototype.getById as jest.Mock).mockResolvedValue(
        mockHabit
      );

      await expect(habitService.restoreHabit("test-habit-1")).rejects.toThrow(
        "Habit is not archived"
      );
    });
  });
});
