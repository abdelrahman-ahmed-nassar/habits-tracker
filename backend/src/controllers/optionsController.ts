import { Request, Response } from "express";
import * as optionsService from "../services/optionsService";
import { asyncHandler } from "../middleware/errorHandler";

export const getMoods = asyncHandler(async (req: Request, res: Response) => {
  const moods = await optionsService.getMoods();

  // If the legacy flag is set, only return the labels for backward compatibility
  if (req.query.legacy === "true") {
    const moodLabels = moods.map((mood) => mood.label);
    res.status(200).json({
      success: true,
      data: moodLabels,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: moods,
  });
});

export const addMood = asyncHandler(async (req: Request, res: Response) => {
  const { mood } = req.body;
  if (!mood || typeof mood !== "string") {
    throw new Error("Invalid mood value");
  }
  const moods = await optionsService.addMood(mood);
  res.status(201).json({
    success: true,
    data: moods,
  });
});

export const removeMood = asyncHandler(async (req: Request, res: Response) => {
  const { mood } = req.params;
  const moods = await optionsService.removeMood(mood);
  res.status(200).json({
    success: true,
    data: moods,
  });
});

export const getProductivityLevels = asyncHandler(
  async (req: Request, res: Response) => {
    const levels = await optionsService.getProductivityLevels();

    // If the legacy flag is set, only return the labels for backward compatibility
    if (req.query.legacy === "true") {
      const levelLabels = levels.map((level) => level.label);
      res.status(200).json({
        success: true,
        data: levelLabels,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: levels,
    });
  }
);

export const addProductivityLevel = asyncHandler(
  async (req: Request, res: Response) => {
    const { level } = req.body;
    if (!level || typeof level !== "string") {
      throw new Error("Invalid productivity level value");
    }
    const levels = await optionsService.addProductivityLevel(level);
    res.status(201).json({
      success: true,
      data: levels,
    });
  }
);

export const removeProductivityLevel = asyncHandler(
  async (req: Request, res: Response) => {
    const { level } = req.params;
    const levels = await optionsService.removeProductivityLevel(level);
    res.status(200).json({
      success: true,
      data: levels,
    });
  }
);
