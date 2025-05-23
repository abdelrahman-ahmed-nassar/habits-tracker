/**
 * Settings Controller
 * Handles API endpoints for user settings
 */
import { Request, Response } from "express";
import { SettingsService } from "../services/settingsService";

const settingsService = new SettingsService();

/**
 * Get user settings
 * @route GET /api/settings
 */
export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

/**
 * Update user settings
 * @route PUT /api/settings
 */
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updates = req.body;
    const updatedSettings = await settingsService.updateSettings(updates);
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
