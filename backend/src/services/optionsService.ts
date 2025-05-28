import { readData, writeData } from "./fileStorageService";
import { AppError } from "../middleware/errorHandler";

const MOODS_FILE = "moods.json";
const PRODUCTIVITY_LEVELS_FILE = "productivity_levels.json";

export interface MoodOption {
  label: string;
  value: number;
}

export interface ProductivityOption {
  label: string;
  value: number;
}

export const getMoods = async (): Promise<MoodOption[]> => {
  return await readData<MoodOption[]>(MOODS_FILE);
};

export const getMoodLabels = async (): Promise<string[]> => {
  const moods = await getMoods();
  return moods.map((mood) => mood.label);
};

export const addMood = async (
  mood: string | MoodOption
): Promise<MoodOption[]> => {
  const moods = await getMoods();
  const moodObj =
    typeof mood === "string"
      ? {
          label: mood,
          value:
            moods.length > 0 ? Math.max(...moods.map((m) => m.value)) + 1 : 5,
        }
      : mood;

  if (moods.some((m) => m.label === moodObj.label)) {
    throw new AppError("Mood already exists", 400);
  }

  moods.push(moodObj);
  await writeData(MOODS_FILE, moods);
  return moods;
};

export const removeMood = async (moodLabel: string): Promise<MoodOption[]> => {
  const moods = await getMoods();
  const filteredMoods = moods.filter((m) => m.label !== moodLabel);

  if (filteredMoods.length === moods.length) {
    throw new AppError("Mood not found", 404);
  }

  await writeData(MOODS_FILE, filteredMoods);
  return filteredMoods;
};

export const getProductivityLevels = async (): Promise<
  ProductivityOption[]
> => {
  return await readData<ProductivityOption[]>(PRODUCTIVITY_LEVELS_FILE);
};

export const getProductivityLabels = async (): Promise<string[]> => {
  const levels = await getProductivityLevels();
  return levels.map((level) => level.label);
};

export const addProductivityLevel = async (
  level: string | ProductivityOption
): Promise<ProductivityOption[]> => {
  const levels = await getProductivityLevels();
  const levelObj =
    typeof level === "string"
      ? {
          label: level,
          value:
            levels.length > 0 ? Math.max(...levels.map((l) => l.value)) + 1 : 5,
        }
      : level;

  if (levels.some((l) => l.label === levelObj.label)) {
    throw new AppError("Productivity level already exists", 400);
  }

  levels.push(levelObj);
  await writeData(PRODUCTIVITY_LEVELS_FILE, levels);
  return levels;
};

export const removeProductivityLevel = async (
  levelLabel: string
): Promise<ProductivityOption[]> => {
  const levels = await getProductivityLevels();
  const filteredLevels = levels.filter((l) => l.label !== levelLabel);

  if (filteredLevels.length === levels.length) {
    throw new AppError("Productivity level not found", 404);
  }

  await writeData(PRODUCTIVITY_LEVELS_FILE, filteredLevels);
  return filteredLevels;
};
