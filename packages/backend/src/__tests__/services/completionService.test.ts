import { CompletionService } from "../../services/completionService";
import { TypedDataService } from "../../services/typedDataService";
import { HabitService, HabitWithStreak } from "../../services/habitService";
import { Completion } from "../../../../shared/src/completions";
import {
  Habit,
  GoalType,
  RepetitionPattern,
  HabitTag,
} from "../../../../shared/src/habits";
import { AppError } from "../../middlewares/errorMiddleware";
import { StreakData } from "../../utils/streakCalculator";

// Mock dependencies
jest.mock("../../services/typedDataService");
jest.mock("../../services/habitService");

describe("CompletionService", () => {
  let completionService: CompletionService;
  let mockHabitService: jest.Mocked<HabitService>;
  let mockCompletionDataService: jest.Mocked<TypedDataService<Completion>>;

  // Mock streak data
  const mockStreakData: StreakData = {
    currentStreak: 2,
    longestStreak: 5,
    totalCompletions: 10,
    isDueToday: true,
  };

  // Test data
  const testHabit: HabitWithStreak = {
    id: "habit-1",
    name: "Daily Exercise",
    tag: HabitTag.Health,
    repetition: RepetitionPattern.Daily,
    goalType: GoalType.Streak,
    goalValue: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    archived: false,
    streak: mockStreakData,
  };

  const testWeeklyHabit: HabitWithStreak = {
    id: "habit-2",
    name: "Weekly Jogging",
    tag: HabitTag.Fitness,
    repetition: RepetitionPattern.Weekly,
    specificDays: [1, 3, 5], // Monday, Wednesday, Friday
    goalType: GoalType.Streak,
    goalValue: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    archived: false,
    streak: mockStreakData,
  };

  const testCounterHabit: HabitWithStreak = {
    id: "habit-3",
    name: "Water Glasses",
    tag: HabitTag.Health,
    repetition: RepetitionPattern.Daily,
    goalType: GoalType.Counter,
    goalValue: 8,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    archived: false,
    streak: mockStreakData,
  };

  // Test completions
  const testCompletions: Completion[] = [
    {
      id: "completion-1",
      habitId: "habit-1",
      date: "2023-06-01",
      completed: true,
      timestamp: "2023-06-01T10:00:00.000Z",
    },
    {
      id: "completion-2",
      habitId: "habit-1",
      date: "2023-06-02",
      completed: true,
      timestamp: "2023-06-02T10:00:00.000Z",
    },
    {
      id: "completion-3",
      habitId: "habit-3",
      date: "2023-06-01",
      completed: true,
      value: 8,
      timestamp: "2023-06-01T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize the mock services
    mockHabitService = new HabitService() as jest.Mocked<HabitService>;
    mockCompletionDataService = new TypedDataService<Completion>(
      "completions"
    ) as jest.Mocked<TypedDataService<Completion>>;

    // Create the service under test
    completionService = new CompletionService();

    // Set up default mock implementations
    (completionService as any).completionDataService =
      mockCompletionDataService;
    (completionService as any).habitService = mockHabitService;

    // Mock getHabitById to return test habits
    mockHabitService.getHabitById.mockImplementation((id: string) => {
      if (id === "habit-1") return Promise.resolve(testHabit);
      if (id === "habit-2") return Promise.resolve(testWeeklyHabit);
      if (id === "habit-3") return Promise.resolve(testCounterHabit);
      return Promise.reject(new AppError(`Habit with ID ${id} not found`, 404));
    });

    // Mock getAllHabits to return all test habits
    mockHabitService.getAllHabits.mockResolvedValue([
      testHabit,
      testWeeklyHabit,
      testCounterHabit,
    ]);

    // Mock getAll to return test completions
    mockCompletionDataService.getAll.mockResolvedValue(testCompletions);

    // Mock create to return the input
    mockCompletionDataService.create.mockImplementation((data) =>
      Promise.resolve(data)
    );

    // Mock update to return the updated object
    mockCompletionDataService.update.mockImplementation((id, data) => {
      const existingCompletion = testCompletions.find((c) => c.id === id);
      if (!existingCompletion) {
        return Promise.reject(
          new AppError(`Completion with ID ${id} not found`, 404)
        );
      }
      return Promise.resolve({ ...existingCompletion, ...data });
    });
  });

  describe("completeHabit", () => {
    it("should create a new completion record for a streak habit", async () => {
      const date = "2023-06-03";
      await completionService.completeHabit("habit-1", date);

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-1",
          date,
          completed: true,
          value: undefined, // Streak habits don't have values
        })
      );
    });

    it("should create a new completion record with value for a counter habit", async () => {
      const date = "2023-06-03";
      const value = 5;
      await completionService.completeHabit("habit-3", date, value);

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-3",
          date,
          completed: true,
          value,
        })
      );
    });

    it("should update an existing completion record", async () => {
      const existingCompletion = testCompletions[0];
      const notes = "Updated notes";

      // Mock implementation to find existing completion
      mockCompletionDataService.getAll.mockResolvedValue(testCompletions);

      await completionService.completeHabit(
        existingCompletion.habitId,
        existingCompletion.date,
        undefined,
        notes
      );

      expect(mockCompletionDataService.update).toHaveBeenCalledWith(
        existingCompletion.id,
        expect.objectContaining({
          completed: true,
          notes,
        })
      );
      expect(mockCompletionDataService.create).not.toHaveBeenCalled();
    });

    it("should throw an error for invalid completion dates for weekly habits", async () => {
      // Test with a date that doesn't match specificDays (Sunday = 0, so we use 0)
      const date = "2023-06-04"; // Sunday, June 4th 2023

      // Mock the Date to ensure we have a consistent day of week
      const mockDate = new Date(2023, 5, 4); // Month is 0-based, so 5 = June
      jest
        .spyOn(global, "Date")
        .mockImplementation(() => mockDate as unknown as Date);

      await expect(
        completionService.completeHabit("habit-2", date)
      ).rejects.toThrow("Invalid completion date");
    });

    it("should set default value=1 for counter habits when no value is provided", async () => {
      const date = "2023-06-03";

      await completionService.completeHabit("habit-3", date);

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-3",
          date,
          completed: true,
          value: 1, // Default value should be 1
        })
      );
    });

    it("should reject negative values for counter habits", async () => {
      const date = "2023-06-03";
      const value = -5;

      await expect(
        completionService.completeHabit("habit-3", date, value)
      ).rejects.toThrow("Value must be a non-negative number");
    });
  });

  describe("uncompleteHabit", () => {
    it("should delete a completion record", async () => {
      const existingCompletion = testCompletions[0];

      // Mock to find the completion
      mockCompletionDataService.getAll.mockResolvedValue(testCompletions);

      // Mock the delete method
      mockCompletionDataService.delete = jest.fn().mockResolvedValue(undefined);

      await completionService.uncompleteHabit(
        existingCompletion.habitId,
        existingCompletion.date
      );

      expect(mockCompletionDataService.delete).toHaveBeenCalledWith(
        existingCompletion.id
      );
    });

    it("should throw a 404 error when completion not found", async () => {
      // Mock to return empty array (no completions)
      mockCompletionDataService.getAll.mockResolvedValue([]);

      await expect(
        completionService.uncompleteHabit("habit-1", "2023-06-10")
      ).rejects.toThrow(
        "No completion record found for habit habit-1 on date 2023-06-10"
      );
    });
  });

  describe("getHabitCompletionHistory", () => {
    it("should return completions for a specific habit", async () => {
      const result = await completionService.getHabitCompletionHistory(
        "habit-1"
      );

      expect(result.completions).toHaveLength(2);
      expect(result.completions.every((c) => c.habitId === "habit-1")).toBe(
        true
      );
    });

    it("should filter completions by date range", async () => {
      // Mock implementation for date filtering
      mockCompletionDataService.getAll.mockResolvedValue([
        {
          id: "c1",
          habitId: "habit-1",
          date: "2023-05-01",
          completed: true,
          timestamp: "",
        },
        {
          id: "c2",
          habitId: "habit-1",
          date: "2023-06-01",
          completed: true,
          timestamp: "",
        },
        {
          id: "c3",
          habitId: "habit-1",
          date: "2023-07-01",
          completed: true,
          timestamp: "",
        },
      ]);

      const result = await completionService.getHabitCompletionHistory(
        "habit-1",
        "2023-06-01",
        "2023-06-30"
      );

      expect(result.completions).toHaveLength(1);
      expect(result.completions[0].date).toBe("2023-06-01");
    });
  });

  describe("getDailyCompletions", () => {
    it("should return all completions for a specific date", async () => {
      const date = "2023-06-01";

      // Add some test data that matches this date
      mockCompletionDataService.getAll.mockResolvedValue([
        { id: "c1", habitId: "habit-1", date, completed: true, timestamp: "" },
        { id: "c2", habitId: "habit-2", date, completed: true, timestamp: "" },
        {
          id: "c3",
          habitId: "habit-1",
          date: "2023-06-02",
          completed: true,
          timestamp: "",
        },
      ]);

      const result = await completionService.getDailyCompletions(date);

      expect(result.completions).toHaveLength(2);
      expect(result.completions.every((c) => c.date === date)).toBe(true);
    });
  });

  describe("bulkCompleteHabits", () => {
    it("should process multiple completions in a single request", async () => {
      // Set up spies on the methods that will be called
      const completeHabitSpy = jest.spyOn(completionService, "completeHabit");
      const uncompleteHabitSpy = jest.spyOn(
        completionService,
        "uncompleteHabit"
      );

      // Mock implementations to prevent actual calls
      completeHabitSpy.mockResolvedValue({
        id: "new-completion",
        habitId: "habit-1",
        date: "2023-06-10",
        completed: true,
        timestamp: "",
      });
      uncompleteHabitSpy.mockResolvedValue();

      const bulkData = [
        { habitId: "habit-1", date: "2023-06-10", completed: true },
        { habitId: "habit-2", date: "2023-06-10", completed: false },
        { habitId: "habit-3", date: "2023-06-10", value: 5, completed: true },
      ];

      await completionService.bulkCompleteHabits(bulkData);

      // Verify all items were processed
      expect(completeHabitSpy).toHaveBeenCalledTimes(2);
      expect(uncompleteHabitSpy).toHaveBeenCalledTimes(1);
    });
  });
});
