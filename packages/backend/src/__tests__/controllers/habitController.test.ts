import { Request, Response, NextFunction } from "express";
import { HabitController } from "../../controllers/habitController";
import { TypedDataService } from "../../services/typedDataService";
import { HabitService } from "../../services/habitService";
import {
  Habit,
  HabitTag,
  RepetitionPattern,
  GoalType,
} from "../../../../shared/src/habits";
import { StreakData } from "../../utils/streakCalculator";

// Mock TypedDataService and HabitService
jest.mock("../../services/typedDataService");
jest.mock("../../services/habitService");

describe("HabitController", () => {
  let habitController: HabitController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  // Define default streak data for testing
  const defaultStreakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    isDueToday: true,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create controller instance
    habitController = new HabitController();

    // Mock request object
    mockReq = {
      params: {},
      body: {},
      query: {},
    };

    // Mock response object with success method
    mockRes = {
      success: jest.fn(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  describe("getAllHabits", () => {
    it("should return all habits without filters", async () => {
      // Mock data
      const mockHabits = [
        {
          id: "1",
          name: "Exercise",
          tag: HabitTag.Fitness,
          repetition: RepetitionPattern.Daily,
          goalType: GoalType.Streak,
          goalValue: 7,
          archived: false,
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          streak: defaultStreakData,
        },
        {
          id: "2",
          name: "Read",
          tag: HabitTag.Learning,
          repetition: RepetitionPattern.Daily,
          goalType: GoalType.Counter,
          goalValue: 30,
          archived: false,
          createdAt: "2023-01-02T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
          streak: defaultStreakData,
        },
      ];

      // Mock getAllHabits method on HabitService
      (HabitService.prototype.getAllHabits as jest.Mock).mockResolvedValue(
        mockHabits
      );

      // Call controller method
      await habitController.getAllHabits(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.getAllHabits).toHaveBeenCalledWith(
        undefined
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        {
          habits: mockHabits,
          filter: undefined,
        },
        "Habits retrieved successfully"
      );
    });

    it("should filter habits by tag", async () => {
      // Mock data
      const filteredHabits = [
        {
          id: "1",
          name: "Exercise",
          tag: HabitTag.Fitness,
          repetition: RepetitionPattern.Daily,
          goalType: GoalType.Streak,
          goalValue: 7,
          archived: false,
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          streak: defaultStreakData,
        },
      ];

      // Set query parameters
      mockReq.query = { tags: HabitTag.Fitness };

      // Mock getAllHabits method to return filtered results
      (HabitService.prototype.getAllHabits as jest.Mock).mockResolvedValue(
        filteredHabits
      );

      // Call controller method
      await habitController.getAllHabits(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.getAllHabits).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [HabitTag.Fitness],
        })
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        {
          habits: filteredHabits,
          filter: expect.objectContaining({
            tags: [HabitTag.Fitness],
          }),
        },
        "Habits retrieved successfully"
      );
    });
  });

  describe("getHabitById", () => {
    it("should return a habit by ID", async () => {
      // Mock data
      const mockHabit = {
        id: "1",
        name: "Exercise",
        tag: HabitTag.Fitness,
        repetition: RepetitionPattern.Daily,
        goalType: GoalType.Streak,
        goalValue: 7,
        archived: false,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        streak: defaultStreakData,
      };

      // Set params
      mockReq.params = { id: "1" };

      // Mock getHabitById method
      (HabitService.prototype.getHabitById as jest.Mock).mockResolvedValue(
        mockHabit
      );

      // Call controller method
      await habitController.getHabitById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.getHabitById).toHaveBeenCalledWith("1");

      expect(mockRes.success).toHaveBeenCalledWith(
        mockHabit,
        "Habit retrieved successfully"
      );
    });

    it("should call next with error when habit is not found", async () => {
      // Set params
      mockReq.params = { id: "nonexistent" };

      // Mock getHabitById method to throw an error
      const error = new Error("Habit not found");
      (HabitService.prototype.getHabitById as jest.Mock).mockRejectedValue(
        error
      );

      // Call controller method
      await habitController.getHabitById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.getHabitById).toHaveBeenCalledWith(
        "nonexistent"
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createHabit", () => {
    it("should create a new habit", async () => {
      // Mock request body
      mockReq.body = {
        name: "Exercise",
        tag: HabitTag.Fitness,
        repetition: RepetitionPattern.Daily,
        goalType: GoalType.Streak,
        goalValue: 7,
      };

      // Mock created habit with generated ID
      const mockCreatedHabit = {
        ...mockReq.body,
        id: "new-habit-id",
        archived: false,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        streak: defaultStreakData,
      };

      // Mock createHabit method
      (HabitService.prototype.createHabit as jest.Mock).mockResolvedValue(
        mockCreatedHabit
      );

      // Call controller method
      await habitController.createHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.createHabit).toHaveBeenCalledWith(
        mockReq.body
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockCreatedHabit,
        "Habit created successfully",
        201
      );
    });
  });

  describe("updateHabit", () => {
    it("should update an existing habit", async () => {
      // Set params and body
      mockReq.params = { id: "1" };
      mockReq.body = {
        name: "Updated Exercise",
        goalValue: 10,
      };

      // Mock updated habit
      const mockUpdatedHabit = {
        id: "1",
        name: "Updated Exercise",
        tag: HabitTag.Fitness,
        repetition: RepetitionPattern.Daily,
        goalType: GoalType.Streak,
        goalValue: 10,
        archived: false,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        streak: defaultStreakData,
      };

      // Mock updateHabit method
      (HabitService.prototype.updateHabit as jest.Mock).mockResolvedValue(
        mockUpdatedHabit
      );

      // Call controller method
      await habitController.updateHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.updateHabit).toHaveBeenCalledWith(
        "1",
        mockReq.body
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockUpdatedHabit,
        "Habit updated successfully"
      );
    });
  });

  describe("deleteHabit", () => {
    it("should delete a habit", async () => {
      // Set params
      mockReq.params = { id: "1" };
      mockReq.query = {};

      // Mock response methods
      mockRes.status = jest.fn().mockReturnThis();
      mockRes.send = jest.fn();

      // Mock deleteHabit method
      (HabitService.prototype.deleteHabit as jest.Mock).mockResolvedValue(
        undefined
      );

      // Call controller method
      await habitController.deleteHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(HabitService.prototype.deleteHabit).toHaveBeenCalledWith(
        "1",
        false
      );
      // Check for status 204 No Content
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
