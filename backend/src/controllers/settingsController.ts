import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import { AppError } from "../middleware/errorHandler";
import { Settings } from "../types/models";
import { analyticsCache } from "../utils/cacheUtils";

/**
 * Get current settings
 * @route GET /api/settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await dataService.getSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * Update settings
 * @route PUT /api/settings
 */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const settingsData: Partial<Settings> = req.body;

    // Validate settings data
    if (
      settingsData.theme &&
      !["light", "dark", "system"].includes(settingsData.theme)
    ) {
      throw new AppError(
        "Invalid theme value. Must be 'light', 'dark', or 'system'",
        400
      );
    }

    if (
      settingsData.backupFrequency &&
      !["daily", "weekly", "monthly"].includes(settingsData.backupFrequency)
    ) {
      throw new AppError(
        "Invalid backup frequency. Must be 'daily', 'weekly', or 'monthly'",
        400
      );
    }

    if (
      settingsData.notifications?.reminderTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
        settingsData.notifications.reminderTime
      )
    ) {
      throw new AppError(
        "Invalid reminder time format. Must be in HH:MM format",
        400
      );
    }

    // Validate analytics settings
    if (settingsData.analytics) {
      if (
        typeof settingsData.analytics.cacheEnabled !== "undefined" &&
        typeof settingsData.analytics.cacheEnabled !== "boolean"
      ) {
        throw new AppError("analytics.cacheEnabled must be a boolean", 400);
      }

      if (
        typeof settingsData.analytics.cacheDuration !== "undefined" &&
        (typeof settingsData.analytics.cacheDuration !== "number" ||
          settingsData.analytics.cacheDuration < 1)
      ) {
        throw new AppError(
          "analytics.cacheDuration must be a positive number",
          400
        );
      }
    }

    const updatedSettings = await dataService.updateSettings(settingsData);

    // Update analytics cache settings
    await analyticsCache.updateSettings(updatedSettings);

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  }
);
