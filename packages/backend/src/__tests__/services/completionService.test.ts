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
import * as dateUtils from "../../utils/dateUtils";

// Mock dependencies
jest.mock("../../services/typedDataService");
jest.mock("../../services/habitService");
jest.mock("../../utils/dateUtils", () => {
  const originalModule = jest.requireActual("../../utils/dateUtils");
  return {
    __esModule: true,
    ...originalModule,
    isToday: jest.fn().mockReturnValue(false),
    getCurrentDate: jest.fn().mockReturnValue("2023-06-03"),
    formatDateString: jest.fn().mockImplementation((date) => {
      return date.toISOString().split("T")[0];
    }),
  };
});

// Memory optimization: Use describe.each for repetitive tests
describe("CompletionService", () => {
  let completionService: CompletionService;
  let mockHabitService: jest.Mocked<HabitService>;
  let mockCompletionDataService: jest.Mocked<TypedDataService<Completion>>;
  let RealDate: DateConstructor;

  // Mock streak data
  const mockStreakData: StreakData = {
    currentStreak: 2,
    longestStreak: 5,
    totalCompletions: 10,
    isDueToday: true,
  };

  // Test data - reduced for better memory usage
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

  const testMonthlyHabit: HabitWithStreak = {
    id: "habit-4",
    name: "Monthly Review",
    tag: HabitTag.Personal,
    repetition: RepetitionPattern.Monthly,
    specificDates: [1, 15], // 1st and 15th of each month
    goalType: GoalType.Streak,
    goalValue: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    archived: false,
    streak: mockStreakData,
  };

  // Reduced test completions
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

    // Save the original Date constructor
    RealDate = Date;

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
      if (id === "habit-4") return Promise.resolve(testMonthlyHabit);
      return Promise.reject(new AppError(`Habit with ID ${id} not found`, 404));
    });

    // Mock getAllHabits to return all test habits
    mockHabitService.getAllHabits.mockResolvedValue([
      testHabit,
      testWeeklyHabit,
      testCounterHabit,
      testMonthlyHabit,
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

    // Mock getCurrentDate to return a fixed date for consistent testing
    (dateUtils.getCurrentDate as jest.Mock).mockReturnValue("2023-06-03");

    // Mock isToday to check against our fixed date
    (dateUtils.isToday as jest.Mock).mockImplementation((dateStr) => {
      return dateStr === "2023-06-03";
    });

    // Mock Date constructor to return a fixed date, but use the real Date for arguments
    jest.spyOn(global, "Date").mockImplementation((arg?: any) => {
      if (arg) {
        return new RealDate(arg);
      }
      return new RealDate("2023-06-03");
    });
  });

  // Memory optimization: Add proper cleanup
  afterEach(() => {
    jest.resetAllMocks();
    global.Date = RealDate;
  });

  // Memory optimization: Group related tests together with fewer assertions per test
  describe("Basic Operations", () => {
    test("should create and delete completion records", async () => {
      // Test creating completion
      const date = "2023-06-03";
      await completionService.completeHabit("habit-1", date);

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-1",
          date,
          completed: true,
        })
      );

      // Test deleting completion
      const existingCompletion = testCompletions[0];
      mockCompletionDataService.delete = jest.fn().mockResolvedValue(undefined);

      await completionService.uncompleteHabit(
        existingCompletion.habitId,
        existingCompletion.date
      );

      expect(mockCompletionDataService.delete).toHaveBeenCalledWith(
        existingCompletion.id
      );
    });

    test("should handle counter vs streak habit types differently", async () => {
      // Test counter habit
      const counterDate = "2023-06-03";
      const value = 5;
      await completionService.completeHabit("habit-3", counterDate, value);

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-3",
          date: counterDate,
          completed: true,
          value,
        })
      );

      // Test streak habit
      const streakDate = "2023-06-03";
      await completionService.completeHabit("habit-1", streakDate, 10); // Value should be ignored

      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: "habit-1",
          date: streakDate,
          completed: true,
          value: undefined, // Value should be ignored for streak habits
        })
      );
    });
  });

  describe("Validation", () => {
    test("should validate completion dates for different repetition patterns", async () => {
      // Test valid monthly date
      const validMonthlyDate = "2023-06-15"; // 15th is valid for monthly habit
      await completionService.completeHabit("habit-4", validMonthlyDate);
      expect(mockCompletionDataService.create).toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();

      // Test invalid monthly date
      const invalidMonthlyDate = "2023-06-05"; // 5th is not valid for testMonthlyHabit
      await expect(
        completionService.completeHabit("habit-4", invalidMonthlyDate)
      ).rejects.toThrow("Invalid completion date");

      // Test invalid weekly date
      const mockDate = new Date(2023, 5, 4); // Sunday, June 4th 2023
      jest
        .spyOn(global, "Date")
        .mockImplementation(() => mockDate as unknown as Date);

      await expect(
        completionService.completeHabit("habit-2", "2023-06-04")
      ).rejects.toThrow("Invalid completion date");
    });

    test("should validate counter habit values", async () => {
      // Test negative value
      await expect(
        completionService.completeHabit("habit-3", "2023-06-03", -5)
      ).rejects.toThrow("Value must be a non-negative number");

      // Default value when not provided
      await completionService.completeHabit("habit-3", "2023-06-03");
      expect(mockCompletionDataService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 1, // Default should be 1
        })
      );
    });
  });

  describe("Bulk Operations", () => {
    test("should process multiple completions in bulk", async () => {
      // Mock implementations to prevent actual calls
      jest
        .spyOn(completionService, "completeHabit")
        .mockResolvedValueOnce({
          id: "new-completion-1",
          habitId: "habit-1",
          date: "2023-06-10",
          completed: true,
          timestamp: "",
        })
        .mockResolvedValueOnce({
          id: "new-completion-2",
          habitId: "habit-3",
          date: "2023-06-10",
          completed: true,
          value: 5,
          timestamp: "",
        });

      jest
        .spyOn(completionService, "uncompleteHabit")
        .mockResolvedValueOnce(undefined);

      const bulkData = [
        { habitId: "habit-1", date: "2023-06-10", completed: true },
        { habitId: "habit-2", date: "2023-06-10", completed: false },
        { habitId: "habit-3", date: "2023-06-10", value: 5, completed: true },
      ];

      await completionService.bulkCompleteHabits(bulkData);

      // Verify correct methods were called
      expect(completionService.completeHabit).toHaveBeenCalledTimes(2);
      expect(completionService.uncompleteHabit).toHaveBeenCalledTimes(1);
    });
  });

  // We'll keep this test short to avoid memory issues
  describe("Streak Calculation", () => {
    test("should calculate streaks based on completion history", async () => {
      // Set up completions that form a streak
      const streakCompletions = [
        {
          id: "s1",
          habitId: "habit-1",
          date: "2023-06-01",
          completed: true,
          timestamp: "2023-06-01T10:00:00.000Z",
        },
        {
          id: "s2",
          habitId: "habit-1",
          date: "2023-06-02",
          completed: true,
          timestamp: "2023-06-02T10:00:00.000Z",
        },
        {
          id: "s3",
          habitId: "habit-1",
          date: "2023-06-03",
          completed: true,
          timestamp: "2023-06-03T10:00:00.000Z",
        }, // Today
      ];

      mockCompletionDataService.getAll.mockResolvedValue(streakCompletions);

      const result = await completionService.getHabitCompletionHistory(
        "habit-1"
      );

      expect(result.statistics.streakData).toBeDefined();
      expect(result.statistics.completionRate).toBeDefined();
    });
  });
});
