import { readData, writeData } from "./fileStorageService";
import { AppError } from "../middleware/errorHandler";

const MOODS_FILE = "moods.json";
const PRODUCTIVITY_LEVELS_FILE = "productivity_levels.json";

export const getMoods = async (): Promise<string[]> => {
  return await readData<string[]>(MOODS_FILE);
};

export const addMood = async (mood: string): Promise<string[]> => {
  const moods = await getMoods();
  if (moods.includes(mood)) {
    throw new AppError("Mood already exists", 400);
  }
  moods.push(mood);
  await writeData(MOODS_FILE, moods);
  return moods;
};

export const removeMood = async (mood: string): Promise<string[]> => {
  const moods = await getMoods();
  const filteredMoods = moods.filter((m) => m !== mood);
  if (filteredMoods.length === moods.length) {
    throw new AppError("Mood not found", 404);
  }
  await writeData(MOODS_FILE, filteredMoods);
  return filteredMoods;
};

export const getProductivityLevels = async (): Promise<string[]> => {
  return await readData<string[]>(PRODUCTIVITY_LEVELS_FILE);
};

export const addProductivityLevel = async (
  level: string
): Promise<string[]> => {
  const levels = await getProductivityLevels();
  if (levels.includes(level)) {
    throw new AppError("Productivity level already exists", 400);
  }
  levels.push(level);
  await writeData(PRODUCTIVITY_LEVELS_FILE, levels);
  return levels;
};

export const removeProductivityLevel = async (
  level: string
): Promise<string[]> => {
  const levels = await getProductivityLevels();
  const filteredLevels = levels.filter((l) => l !== level);
  if (filteredLevels.length === levels.length) {
    throw new AppError("Productivity level not found", 404);
  }
  await writeData(PRODUCTIVITY_LEVELS_FILE, filteredLevels);
  return filteredLevels;
};
