import {
  calculateAverage,
  calculateMedian,
  calculateStandardDeviation,
  calculateConsistencyScore,
  calculateRelativePerformance,
  calculateGoalAchievement,
  calculateTrendAnalysis,
} from "../../utils/statisticsUtils";

describe("Statistics Utility Functions", () => {
  describe("calculateAverage", () => {
    it("should calculate the average of an array of numbers", () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([0, 10])).toBe(5);
      expect(calculateAverage([-5, 5])).toBe(0);
    });

    it("should return 0 for an empty array", () => {
      expect(calculateAverage([])).toBe(0);
    });
  });

  describe("calculateMedian", () => {
    it("should calculate the median of an odd-length array", () => {
      expect(calculateMedian([1, 3, 5, 7, 9])).toBe(5);
      expect(calculateMedian([5, 1, 9, 3, 7])).toBe(5); // Unsorted array
    });

    it("should calculate the median of an even-length array", () => {
      expect(calculateMedian([1, 3, 5, 7])).toBe(4);
      expect(calculateMedian([7, 1, 5, 3])).toBe(4); // Unsorted array
    });

    it("should return 0 for an empty array", () => {
      expect(calculateMedian([])).toBe(0);
    });

    it("should return the value for a single-element array", () => {
      expect(calculateMedian([42])).toBe(42);
    });
  });

  describe("calculateStandardDeviation", () => {
    it("should calculate the standard deviation of an array", () => {
      // Standard deviation of [2, 4, 4, 4, 5, 5, 7, 9] is 2
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(calculateStandardDeviation(values)).toBeCloseTo(2, 1);
    });

    it("should return 0 for identical values", () => {
      expect(calculateStandardDeviation([5, 5, 5])).toBe(0);
    });

    it("should return 0 for arrays with 0 or 1 element", () => {
      expect(calculateStandardDeviation([])).toBe(0);
      expect(calculateStandardDeviation([42])).toBe(0);
    });
  });

  describe("calculateConsistencyScore", () => {
    it("should calculate a high consistency score for good completion and low deviation", () => {
      const completionRate = 0.9; // 90% completion
      const dailyRates = [1, 1, 0.8, 1, 0.8, 1, 0.9]; // Low deviation
      const score = calculateConsistencyScore(completionRate, dailyRates);

      expect(score).toBeGreaterThan(80); // High score for good consistency
    });

    it("should calculate a lower consistency score for good completion but high deviation", () => {
      const completionRate = 0.7; // 70% completion
      const dailyRates = [1, 0, 1, 0, 1, 0, 1]; // High deviation
      const score = calculateConsistencyScore(completionRate, dailyRates);

      expect(score).toBeLessThan(80); // Lower score due to inconsistency
    });

    it("should calculate a low score for low completion rate", () => {
      const completionRate = 0.3; // 30% completion
      const dailyRates = [0.3, 0.3, 0.3]; // Low deviation but poor completion
      const score = calculateConsistencyScore(completionRate, dailyRates);

      expect(score).toBeLessThan(50); // Low score due to poor completion
    });

    it("should return 0 for empty daily rates", () => {
      expect(calculateConsistencyScore(0.8, [])).toBe(0);
    });
  });

  describe("calculateRelativePerformance", () => {
    it("should calculate improvement correctly", () => {
      const result = calculateRelativePerformance(0.8, 0.6);

      expect(result.change).toBeCloseTo(0.2);
      expect(result.changePercent).toBeCloseTo(33.33, 1); // 33.33% improvement
      expect(result.improved).toBe(true);
    });

    it("should calculate decline correctly", () => {
      const result = calculateRelativePerformance(0.6, 0.8);

      expect(result.change).toBeCloseTo(-0.2);
      expect(result.changePercent).toBeCloseTo(-25, 1); // 25% decline
      expect(result.improved).toBe(false);
    });

    it("should handle zero previous value", () => {
      const result = calculateRelativePerformance(0.5, 0);

      expect(result.change).toBeCloseTo(0.5);
      expect(result.changePercent).toBe(100); // 100% improvement from zero
      expect(result.improved).toBe(true);
    });

    it("should handle zero current value", () => {
      const result = calculateRelativePerformance(0, 0.5);

      expect(result.change).toBeCloseTo(-0.5);
      expect(result.changePercent).toBeCloseTo(-100);
      expect(result.improved).toBe(false);
    });
  });

  describe("calculateGoalAchievement", () => {
    it("should calculate percentage achievement correctly", () => {
      expect(calculateGoalAchievement(80, 100)).toBe(80); // 80%
      expect(calculateGoalAchievement(120, 100)).toBe(100); // Max 100%
      expect(calculateGoalAchievement(0, 100)).toBe(0); // 0%
    });

    it("should return 0 for invalid goals", () => {
      expect(calculateGoalAchievement(50, 0)).toBe(0);
      expect(calculateGoalAchievement(50, -10)).toBe(0);
    });
  });

  describe("calculateTrendAnalysis", () => {
    it("should detect increasing trend", () => {
      const values = [0.5, 0.6, 0.7, 0.75, 0.8];
      const result = calculateTrendAnalysis(values);

      expect(result.direction).toBe("increasing");
      expect(result.strength).toBeGreaterThan(0);
    });

    it("should detect decreasing trend", () => {
      const values = [0.8, 0.7, 0.6, 0.5, 0.4];
      const result = calculateTrendAnalysis(values);

      expect(result.direction).toBe("decreasing");
      expect(result.strength).toBeGreaterThan(0);
    });

    it("should detect stable trend with small variations", () => {
      const values = [0.5, 0.51, 0.49, 0.5, 0.51];
      const result = calculateTrendAnalysis(values);

      expect(result.direction).toBe("stable");
      expect(result.strength).toBeLessThan(0.2); // Low strength for stability
    });

    it("should handle empty or single value arrays", () => {
      expect(calculateTrendAnalysis([]).direction).toBe("stable");
      expect(calculateTrendAnalysis([0.5]).direction).toBe("stable");
    });
  });
});
