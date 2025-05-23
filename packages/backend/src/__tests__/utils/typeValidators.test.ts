import * as validators from "../../utils/typeValidators";
import {
  IHabit,
  ICompletion,
  INote,
  IAnalytics,
  ISettings,
} from "../../types/shared";

describe("Type Validators", () => {
  describe("isObject", () => {
    it("should identify objects correctly", () => {
      expect(validators.isObject({})).toBe(true);
      expect(validators.isObject({ a: 1 })).toBe(true);
      expect(validators.isObject(new Date())).toBe(true);

      expect(validators.isObject(null)).toBe(false);
      expect(validators.isObject(undefined)).toBe(false);
      expect(validators.isObject([])).toBe(false);
      expect(validators.isObject(123)).toBe(false);
      expect(validators.isObject("string")).toBe(false);
      expect(validators.isObject(true)).toBe(false);
    });
  });

  describe("createArrayValidator", () => {
    it("should create a validator function for arrays", () => {
      const isNumberArray = validators.createArrayValidator(
        (item) => typeof item === "number"
      );

      expect(isNumberArray([1, 2, 3])).toBe(true);
      expect(isNumberArray(["not", "numbers"])).toBe(false);
      expect(isNumberArray({})).toBe(false);
      expect(isNumberArray(123)).toBe(false);
      expect(isNumberArray([1, "mixed", 3])).toBe(false);
      expect(isNumberArray([])).toBe(true); // Empty array is valid
    });
  });

  describe("isHabit", () => {
    it("should validate valid habit objects", () => {
      const validHabit: IHabit = {
        id: "habit1",
        name: "Exercise",
        tag: "health",
        repetition: "daily",
        goalType: "completion",
        goalValue: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isHabit(validHabit)).toBe(true);
    });

    it("should validate habits with optional properties", () => {
      const habitWithOptionals: IHabit = {
        id: "habit1",
        name: "Exercise",
        tag: "health",
        repetition: "weekly",
        specificDays: [1, 3, 5], // Monday, Wednesday, Friday
        goalType: "count",
        goalValue: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#FF5733",
        icon: "dumbbell",
        archived: false,
      };

      expect(validators.isHabit(habitWithOptionals)).toBe(true);
    });

    it("should reject invalid habit objects", () => {
      // Missing required property
      const missingRequired = {
        id: "habit1",
        name: "Exercise",
        // tag is missing
        repetition: "daily",
        goalType: "completion",
        goalValue: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Wrong type for property
      const wrongType = {
        id: "habit1",
        name: "Exercise",
        tag: "health",
        repetition: "daily",
        goalType: "completion",
        goalValue: "1", // Should be a number
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Invalid specificDays format
      const invalidArray = {
        id: "habit1",
        name: "Exercise",
        tag: "health",
        repetition: "weekly",
        specificDays: "1,3,5", // Should be an array
        goalType: "completion",
        goalValue: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isHabit(null)).toBe(false);
      expect(validators.isHabit({})).toBe(false);
      expect(validators.isHabit(missingRequired)).toBe(false);
      expect(validators.isHabit(wrongType)).toBe(false);
      expect(validators.isHabit(invalidArray)).toBe(false);
    });
  });

  describe("isCompletion", () => {
    it("should validate valid completion objects", () => {
      const validCompletion: ICompletion = {
        id: "completion1",
        habitId: "habit1",
        date: "2023-01-01",
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isCompletion(validCompletion)).toBe(true);
    });

    it("should validate completions with optional properties", () => {
      const completionWithOptionals: ICompletion = {
        id: "completion1",
        habitId: "habit1",
        date: "2023-01-01",
        completed: true,
        value: 5,
        notes: "Did great today!",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isCompletion(completionWithOptionals)).toBe(true);
    });

    it("should reject invalid completion objects", () => {
      // Missing required property
      const missingRequired = {
        id: "completion1",
        // habitId is missing
        date: "2023-01-01",
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Wrong type for property
      const wrongType = {
        id: "completion1",
        habitId: "habit1",
        date: "2023-01-01",
        completed: "yes", // Should be boolean
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isCompletion(null)).toBe(false);
      expect(validators.isCompletion({})).toBe(false);
      expect(validators.isCompletion(missingRequired)).toBe(false);
      expect(validators.isCompletion(wrongType)).toBe(false);
    });
  });

  describe("isNote", () => {
    it("should validate valid note objects", () => {
      const validNote: INote = {
        id: "note1",
        habitId: "habit1",
        content: "This is a note about the habit.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isNote(validNote)).toBe(true);
    });

    it("should reject invalid note objects", () => {
      // Missing required property
      const missingRequired = {
        id: "note1",
        habitId: "habit1",
        // content is missing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Wrong type for property
      const wrongType = {
        id: "note1",
        habitId: "habit1",
        content: 12345, // Should be string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isNote(null)).toBe(false);
      expect(validators.isNote({})).toBe(false);
      expect(validators.isNote(missingRequired)).toBe(false);
      expect(validators.isNote(wrongType)).toBe(false);
    });
  });

  describe("isAnalytics", () => {
    it("should validate valid analytics objects", () => {
      const validAnalytics: IAnalytics = {
        id: "analytics1",
        habitId: "habit1",
        period: "weekly",
        startDate: "2023-01-01",
        endDate: "2023-01-07",
        totalCompletions: 5,
        streakCurrent: 3,
        streakLongest: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isAnalytics(validAnalytics)).toBe(true);
    });

    it("should reject invalid analytics objects", () => {
      // Missing required property
      const missingRequired = {
        id: "analytics1",
        habitId: "habit1",
        period: "weekly",
        startDate: "2023-01-01",
        // endDate is missing
        totalCompletions: 5,
        streakCurrent: 3,
        streakLongest: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Wrong type for property
      const wrongType = {
        id: "analytics1",
        habitId: "habit1",
        period: "weekly",
        startDate: "2023-01-01",
        endDate: "2023-01-07",
        totalCompletions: "5", // Should be number
        streakCurrent: 3,
        streakLongest: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isAnalytics(null)).toBe(false);
      expect(validators.isAnalytics({})).toBe(false);
      expect(validators.isAnalytics(missingRequired)).toBe(false);
      expect(validators.isAnalytics(wrongType)).toBe(false);
    });
  });

  describe("isSettings", () => {
    it("should validate valid settings objects", () => {
      const validSettings: ISettings = {
        id: "settings1",
        userId: "user1",
        theme: "dark",
        firstDayOfWeek: 0, // Sunday
        backupEnabled: true,
        backupFrequency: "daily",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isSettings(validSettings)).toBe(true);
    });

    it("should reject invalid settings objects", () => {
      // Missing required property
      const missingRequired = {
        id: "settings1",
        userId: "user1",
        theme: "dark",
        // firstDayOfWeek is missing
        backupEnabled: true,
        backupFrequency: "daily",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Wrong type for property
      const wrongType = {
        id: "settings1",
        userId: "user1",
        theme: "dark",
        firstDayOfWeek: 0,
        backupEnabled: "yes", // Should be boolean
        backupFrequency: "daily",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validators.isSettings(null)).toBe(false);
      expect(validators.isSettings({})).toBe(false);
      expect(validators.isSettings(missingRequired)).toBe(false);
      expect(validators.isSettings(wrongType)).toBe(false);
    });
  });

  describe("Array validators", () => {
    it("should validate arrays of valid items", () => {
      const habits: IHabit[] = [
        {
          id: "habit1",
          name: "Exercise",
          tag: "health",
          repetition: "daily",
          goalType: "completion",
          goalValue: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "habit2",
          name: "Read",
          tag: "learning",
          repetition: "daily",
          goalType: "duration",
          goalValue: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(validators.isHabitsArray(habits)).toBe(true);
      expect(validators.isHabitsArray([])).toBe(true); // Empty array is valid
    });

    it("should reject arrays with invalid items", () => {
      const invalidHabits = [
        {
          id: "habit1",
          name: "Exercise",
          tag: "health",
          repetition: "daily",
          goalType: "completion",
          goalValue: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "habit2",
          // name is missing
          tag: "learning",
          repetition: "daily",
          goalType: "duration",
          goalValue: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(validators.isHabitsArray(invalidHabits)).toBe(false);
      expect(validators.isHabitsArray("not an array")).toBe(false);
      expect(validators.isHabitsArray(null)).toBe(false);
      expect(validators.isHabitsArray(undefined)).toBe(false);
    });

    it("should validate other array types correctly", () => {
      const validCompletions: ICompletion[] = [
        {
          id: "completion1",
          habitId: "habit1",
          date: "2023-01-01",
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const validNotes: INote[] = [
        {
          id: "note1",
          habitId: "habit1",
          content: "Test note",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const validAnalytics: IAnalytics[] = [
        {
          id: "analytics1",
          habitId: "habit1",
          period: "weekly",
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          totalCompletions: 5,
          streakCurrent: 3,
          streakLongest: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(validators.isCompletionsArray(validCompletions)).toBe(true);
      expect(validators.isNotesArray(validNotes)).toBe(true);
      expect(validators.isAnalyticsArray(validAnalytics)).toBe(true);
    });
  });
});
