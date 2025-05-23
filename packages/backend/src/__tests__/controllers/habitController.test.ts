import { Request, Response, NextFunction } from "express";
import { HabitController } from "../../controllers/habitController";
import { TypedDataService } from "../../services/typedDataService";
import {
  Habit,
  HabitTag,
  RepetitionPattern,
  GoalType,
} from "../../../../shared/src/habits";

// Mock TypedDataService
jest.mock("../../services/typedDataService");

describe("HabitController", () => {
  let habitController: HabitController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

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
        },
      ] as Habit[];

      // Mock getAll method on TypedDataService
      (TypedDataService.prototype.getAll as jest.Mock).mockResolvedValue(
        mockHabits
      );

      // Call controller method
      await habitController.getAllHabits(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.getAll).toHaveBeenCalled();
      expect(mockRes.success).toHaveBeenCalledWith(
        {
          habits: expect.arrayContaining(mockHabits),
          filter: undefined,
        },
        "Habits retrieved successfully"
      );
    });

    it("should filter habits by tag", async () => {
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
        },
      ] as Habit[];

      // Set query parameters
      mockReq.query = { tags: HabitTag.Fitness };

      // Mock getAll method on TypedDataService
      (TypedDataService.prototype.getAll as jest.Mock).mockResolvedValue(
        mockHabits
      );

      // Call controller method
      await habitController.getAllHabits(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.getAll).toHaveBeenCalled();
      expect(mockRes.success).toHaveBeenCalledWith(
        {
          habits: expect.arrayContaining([mockHabits[0]]), // Only fitness habits
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
      } as Habit;

      // Set params
      mockReq.params = { id: "1" };

      // Mock getById method
      (TypedDataService.prototype.getById as jest.Mock).mockResolvedValue(
        mockHabit
      );

      // Call controller method
      await habitController.getHabitById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.getById).toHaveBeenCalledWith("1");
      expect(mockRes.success).toHaveBeenCalledWith(
        mockHabit,
        "Habit retrieved successfully"
      );
    });

    it("should call next with error when habit is not found", async () => {
      // Set params
      mockReq.params = { id: "nonexistent" };

      // Mock getById method to throw an error
      const error = new Error("Habit not found");
      (TypedDataService.prototype.getById as jest.Mock).mockRejectedValue(
        error
      );

      // Call controller method
      await habitController.getHabitById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.getById).toHaveBeenCalledWith(
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
        id: expect.any(String),
        archived: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      // Mock create method
      (TypedDataService.prototype.create as jest.Mock).mockResolvedValue(
        mockCreatedHabit
      );

      // Call controller method
      await habitController.createHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Exercise",
          tag: HabitTag.Fitness,
          repetition: RepetitionPattern.Daily,
          goalType: GoalType.Streak,
          goalValue: 7,
          archived: false,
        })
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
        updatedAt: expect.any(String), // Updated timestamp
      };

      // Mock update method
      (TypedDataService.prototype.update as jest.Mock).mockResolvedValue(
        mockUpdatedHabit
      );

      // Call controller method
      await habitController.updateHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "Updated Exercise",
          goalValue: 10,
          updatedAt: expect.any(String),
        })
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

      // Mock delete method
      (TypedDataService.prototype.delete as jest.Mock).mockResolvedValue(
        undefined
      );

      // Call controller method
      await habitController.deleteHabit(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Expectations
      expect(TypedDataService.prototype.delete).toHaveBeenCalledWith("1");
      expect(mockRes.success).toHaveBeenCalledWith(
        null,
        "Habit deleted successfully"
      );
    });
  });
});
