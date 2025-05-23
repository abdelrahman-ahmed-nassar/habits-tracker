import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analyticsService";
import { AppError } from "../middlewares/errorMiddleware";
import { isValidDate } from "../utils/dateUtils";
import { TimeFrame } from "../../../shared/src/analytics";

// Create analytics service instance
const analyticsService = new AnalyticsService();

/**
 * Get overall analytics for all habits
 */
export const getOverallAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, includeArchived } = req.query;

    const result = await analyticsService.getOverallAnalytics(
      startDate as string,
      endDate as string,
      includeArchived === "true"
    );

    res.success(result, "Overall analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics for a specific habit
 */
export const getHabitAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const result = await analyticsService.getHabitAnalytics(
      id,
      startDate as string,
      endDate as string
    );

    res.success(result, "Habit analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get completion trends over time
 */
export const getCompletionTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, granularity, includeArchived } = req.query;

    // Validate granularity
    const validGranularities = ["daily", "weekly", "monthly"];
    if (granularity && !validGranularities.includes(granularity as string)) {
      throw new AppError(
        `Invalid granularity: ${granularity}. Use one of: ${validGranularities.join(
          ", "
        )}`,
        400
      );
    }

    const result = await analyticsService.getCompletionTrends(
      startDate as string,
      endDate as string,
      granularity as "daily" | "weekly" | "monthly" | undefined,
      includeArchived === "true"
    );

    res.success(result, "Completion trends retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics for a specific day
 */
export const getDailyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!isValidDate(date)) {
      throw new AppError(
        `Invalid date format: ${date}. Use YYYY-MM-DD format.`,
        400
      );
    }

    const result = await analyticsService.getTimeBasedAnalytics(
      TimeFrame.Day,
      date
    );

    res.success(result, "Daily analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics for a week
 */
export const getWeeklyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate } = req.params;

    // Validate date format
    if (!isValidDate(startDate)) {
      throw new AppError(
        `Invalid date format: ${startDate}. Use YYYY-MM-DD format.`,
        400
      );
    }

    const result = await analyticsService.getTimeBasedAnalytics(
      TimeFrame.Week,
      startDate
    );

    res.success(result, "Weekly analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics for a specific month
 */
export const getMonthlyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { year, month } = req.params;

    // Validate year and month
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || yearNum < 1970 || yearNum > 9999) {
      throw new AppError(
        `Invalid year: ${year}. Must be between 1970 and 9999.`,
        400
      );
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError(
        `Invalid month: ${month}. Must be between 1 and 12.`,
        400
      );
    }

    // Create date string for the first day of the month
    const dateString = `${year}-${String(monthNum).padStart(2, "0")}-01`;

    const result = await analyticsService.getTimeBasedAnalytics(
      TimeFrame.Month,
      dateString
    );

    res.success(result, "Monthly analytics retrieved successfully");
  } catch (error) {
    next(error);
  }
};
