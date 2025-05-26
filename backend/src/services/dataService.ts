import { v4 as uuidv4 } from "uuid";
import { readData, writeData, ensureFileExists } from "./fileStorageService";
import {
  Habit,
  CompletionRecord,
  DailyNote,
  HabitAnalytics,
} from "@shared/types";
import { Settings, BackupData } from "../types/models";
import { getTodayDateString, formatDateToString } from "../utils/dateUtils";

// File names
const HABITS_FILE = "habits.json";
const COMPLETIONS_FILE = "completions.json";
const NOTES_FILE = "notes.json";
const SETTINGS_FILE = "settings.json";
const BACKUP_FOLDER = "backups";

// Default settings
const DEFAULT_SETTINGS: Settings = {
  userId: uuidv4(),
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    reminderTime: "09:00",
  },
  analytics: {
    cacheEnabled: true,
    cacheDuration: 5, // 5 minutes default
  },
  reminderEnabled: true,
  reminderTime: "20:00",
  backupEnabled: true,
  backupFrequency: "weekly",
  lastBackupDate: new Date().toISOString(),
};

/**
 * Initialize the data files if they don't exist
 */
export const initializeData = async (): Promise<void> => {
  await ensureFileExists(HABITS_FILE, []);
  await ensureFileExists(COMPLETIONS_FILE, []);
  await ensureFileExists(NOTES_FILE, []);
  await ensureFileExists(SETTINGS_FILE, DEFAULT_SETTINGS);
  console.log("Data files initialized");
};

/**
 * Get all habits
 * @returns Promise with all habits
 */
export const getHabits = async (): Promise<Habit[]> => {
  return await readData<Habit[]>(HABITS_FILE);
};

/**
 * Get a habit by ID
 * @param id The habit ID to find
 * @returns The habit if found, null otherwise
 */
export const getHabitById = async (id: string): Promise<Habit | null> => {
  const habits = await getHabits();
  const habit = habits.find((h) => h.id === id);
  return habit || null;
};

/**
 * Create a new habit
 * @param habit The habit data to create (without ID)
 * @returns The created habit with ID
 */
export const createHabit = async (
  habitData: Omit<
    Habit,
    "id" | "createdAt" | "currentStreak" | "bestStreak" | "currentCounter" | "isActive"
  >
): Promise<Habit> => {
  const habits = await getHabits();

  const newHabit: Habit = {
    id: uuidv4(),
    ...habitData,
    currentStreak: 0,
    bestStreak: 0,
    currentCounter: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  habits.push(newHabit);
  await writeData(HABITS_FILE, habits);

  return newHabit;
};

/**
 * Update a habit
 * @param id The habit ID to update
 * @param habitData The habit data to update
 * @returns The updated habit if successful, null if not found
 */
export const updateHabit = async (
  id: string,
  habitData: Partial<Habit>
): Promise<Habit | null> => {
  const habits = await getHabits();
  const index = habits.findIndex((h) => h.id === id);

  if (index === -1) {
    return null;
  }

  // Prevent overriding certain fields
  const { id: _, createdAt, ...updateData } = habitData;

  const updatedHabit = {
    ...habits[index],
    ...updateData,
  };

  habits[index] = updatedHabit;
  await writeData(HABITS_FILE, habits);

  return updatedHabit;
};

/**
 * Delete a habit
 * @param id The habit ID to delete
 * @returns Whether the deletion was successful
 */
export const deleteHabit = async (id: string): Promise<boolean> => {
  const habits = await getHabits();
  const initialLength = habits.length;

  const filteredHabits = habits.filter((h) => h.id !== id);

  if (filteredHabits.length === initialLength) {
    return false;
  }

  await writeData(HABITS_FILE, filteredHabits);
  return true;
};

/**
 * Get all completion records
 * @returns Promise with all completion records
 */
export const getCompletions = async (): Promise<CompletionRecord[]> => {
  return await readData<CompletionRecord[]>(COMPLETIONS_FILE);
};

/**
 * Get completion records for a specific habit
 * @param habitId The habit ID to filter by
 * @returns Array of completion records for the habit
 */
export const getCompletionsByHabitId = async (
  habitId: string
): Promise<CompletionRecord[]> => {
  const completions = await getCompletions();
  return completions.filter((c) => c.habitId === habitId);
};

/**
 * Get completion records for a specific date
 * @param date The date to filter by in YYYY-MM-DD format
 * @returns Array of completion records for the date
 */
export const getCompletionsByDate = async (
  date: string
): Promise<CompletionRecord[]> => {
  const completions = await getCompletions();
  return completions.filter((c) => c.date === date);
};

/**
 * Create a completion record
 * @param completionData The completion data to create
 * @returns The created completion record
 */
export const createCompletion = async (
  completionData: Omit<CompletionRecord, "id" | "completedAt">
): Promise<CompletionRecord> => {
  const completions = await getCompletions();

  // Check if a record already exists for this habit and date
  const existingIndex = completions.findIndex(
    (c) =>
      c.habitId === completionData.habitId && c.date === completionData.date
  );

  const newCompletion: CompletionRecord = {
    id: uuidv4(),
    ...completionData,
    completedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing record
    completions[existingIndex] = newCompletion;
  } else {
    // Add new record
    completions.push(newCompletion);
  }

  await writeData(COMPLETIONS_FILE, completions);

  // Update habit streak
  await updateHabitStreaks(completionData.habitId);

  return newCompletion;
};

/**
 * Create multiple completion records in a single batch operation
 * This prevents race conditions when creating multiple completions simultaneously
 * @param completionsData Array of completion data to create
 * @returns Array of created completion records
 */
export const createCompletionsBatch = async (
  completionsData: Array<Omit<CompletionRecord, "id" | "completedAt">>
): Promise<CompletionRecord[]> => {
  const completions = await getCompletions();
  const newCompletions: CompletionRecord[] = [];
  const habitIds = new Set<string>();

  // Process all completions in the batch
  for (const completionData of completionsData) {
    // Check if a record already exists for this habit and date
    const existingIndex = completions.findIndex(
      (c) =>
        c.habitId === completionData.habitId && c.date === completionData.date
    );

    const newCompletion: CompletionRecord = {
      id: uuidv4(),
      ...completionData,
      completedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing record
      completions[existingIndex] = newCompletion;
    } else {
      // Add new record
      completions.push(newCompletion);
    }

    newCompletions.push(newCompletion);
    habitIds.add(completionData.habitId);
  }

  // Write all changes in a single operation to prevent race conditions
  await writeData(COMPLETIONS_FILE, completions);

  // Update streaks for all affected habits
  for (const habitId of habitIds) {
    await updateHabitStreaks(habitId);
  }

  return newCompletions;
};

/**
 * Delete a completion record
 * @param id The ID of the completion record to delete
 * @returns Whether the deletion was successful
 */
export const deleteCompletion = async (id: string): Promise<boolean> => {
  const completions = await getCompletions();
  const initialLength = completions.length;

  const filteredCompletions = completions.filter((c) => c.id !== id);

  if (filteredCompletions.length === initialLength) {
    return false;
  }

  await writeData(COMPLETIONS_FILE, filteredCompletions);
  return true;
};

/**
 * Update a completion record
 * @param completion The completion record to update
 * @returns Whether the update was successful
 */
export const updateCompletion = async (
  completion: CompletionRecord
): Promise<boolean> => {
  const completions = await getCompletions();
  const index = completions.findIndex((c) => c.id === completion.id);

  if (index === -1) {
    return false;
  }

  completions[index] = completion;
  await writeData(COMPLETIONS_FILE, completions);
  return true;
};

/**
 * Update a habit's current and best streak values, and current counter
 * Public version of the internal updateHabitStreaks function
 * @param habitId The habit ID to update streaks for
 */
export const updateHabitStreaks = async (habitId: string): Promise<void> => {
  const habit = await getHabitById(habitId);
  if (!habit) return;

  let currentStreak = 0;
  let bestStreak = habit.bestStreak;
  let currentCounter = 0;

  // Get all completions for this habit
  const completions = await getCompletionsByHabitId(habitId);
  
  // Sort by date (oldest first for streak calculations)
  completions.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate currentCounter from today's completion (if exists)
  const today = new Date().toISOString().split('T')[0];
  const todayCompletion = completions.find(c => c.date === today);
  
  if (habit.goalType === "counter") {
    // For counter-type habits, currentCounter is today's value
    currentCounter = todayCompletion?.value || 0;
    
    // Calculate current streak (consecutive days where value >= goalValue)
    currentStreak = calculateCounterStreak(completions, habit.goalValue);

    // Update best streak if current is greater
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  } else {
    // For streak-type habits, currentCounter is always 0
    currentCounter = 0;
    
    const dailyCompletions = getDailyCompletionStatus(habit, completions);

    // Calculate current streak - counting back from today or the last record
    currentStreak = calculateCurrentStreak(
      dailyCompletions,
      habit.repetition,
      habit.specificDays
    );

    // Calculate best streak
    const allStreaks = calculateAllStreaks(
      dailyCompletions,
      habit.repetition,
      habit.specificDays
    );
    bestStreak = Math.max(...allStreaks, 0, habit.bestStreak); // Include existing bestStreak
  }

  // Update the habit with new streak values and currentCounter
  await updateHabit(habitId, { currentStreak, bestStreak, currentCounter });
};

/**
 * Convert completion records to a daily status map
 * @param habit The habit
 * @param completions Completion records for the habit
 * @returns Map of dates to completion status
 */
const getDailyCompletionStatus = (
  habit: Habit,
  completions: CompletionRecord[]
): Map<string, boolean> => {
  const statusMap = new Map<string, boolean>();

  completions.forEach((completion) => {
    // For counter-type habits, check if the value meets the goal
    if (habit.goalType === "counter") {
      statusMap.set(
        completion.date,
        completion.completed &&
          (completion.value !== undefined
            ? completion.value >= habit.goalValue
            : false)
      );
    } else {
      statusMap.set(completion.date, completion.completed);
    }
  });

  return statusMap;
};

/**
 * Calculate current streak based on daily completion status
 * @param dailyCompletions Map of dates to completion status
 * @param repetition Habit repetition type
 * @param specificDays Specific days for weekly/monthly habits
 * @returns Current streak count
 */
const calculateCurrentStreak = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number => {
  // Convert map to array of [date, completed] pairs and sort by date (most recent first)
  const sortedCompletions = Array.from(dailyCompletions.entries()).sort(
    (a, b) => b[0].localeCompare(a[0])
  );

  if (sortedCompletions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(sortedCompletions[0][0]);

  // Go backwards from the most recent date
  for (let i = 0; i < sortedCompletions.length; i++) {
    const [dateStr, completed] = sortedCompletions[i];
    const date = new Date(dateStr);

    // If there's a gap in consecutive dates, or the habit wasn't completed, break
    if (i > 0) {
      const prevDate = new Date(sortedCompletions[i - 1][0]);
      const dayDiff = Math.floor(
        (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      // For non-daily habits, need to handle differently
      if (repetition === "weekly" && dayDiff > 7) break;
      if (repetition === "monthly" && dayDiff > 31) break;
      if (repetition === "daily" && dayDiff > 1) break;
    }

    // If completed, increment streak
    if (completed) {
      streak++;
    } else {
      break; // Break on first non-completion
    }
  }

  return streak;
};

/**
 * Calculate all streaks in the history
 * @param dailyCompletions Map of dates to completion status
 * @param repetition Habit repetition type
 * @param specificDays Specific days for weekly/monthly habits
 * @returns Array of streak lengths
 */
const calculateAllStreaks = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number[] => {
  // Convert map to array of [date, completed] pairs and sort by date (oldest first)
  const sortedCompletions = Array.from(dailyCompletions.entries()).sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  const streaks: number[] = [];
  let currentStreak = 0;

  for (let i = 0; i < sortedCompletions.length; i++) {
    const [dateStr, completed] = sortedCompletions[i];

    if (completed) {
      currentStreak++;
    } else {
      if (currentStreak > 0) {
        streaks.push(currentStreak);
        currentStreak = 0;
      }
    }

    // Check if there's a gap to the next date
    if (i < sortedCompletions.length - 1) {
      const currentDate = new Date(dateStr);
      const nextDate = new Date(sortedCompletions[i + 1][0]);
      const dayDiff = Math.floor(
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // For non-daily habits, need to handle differently
      if (
        (repetition === "daily" && dayDiff > 1) ||
        (repetition === "weekly" && dayDiff > 7) ||
        (repetition === "monthly" && dayDiff > 31)
      ) {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
      }
    }
  }

  // Add the last streak if there is one
  if (currentStreak > 0) {
    streaks.push(currentStreak);
  }

  return streaks;
};

/**
 * Calculate streak for counter-type habits
 * @param completions Completion records
 * @param goalValue The goal value to meet or exceed
 * @returns Current streak count
 */
const calculateCounterStreak = (
  completions: CompletionRecord[],
  goalValue: number
): number => {
  // Sort by date (most recent first)
  const sortedCompletions = [...completions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  if (sortedCompletions.length === 0) return 0;

  let streak = 0;

  // Go backwards from the most recent date
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completion = sortedCompletions[i];

    // If there's a gap in consecutive dates, break
    if (i > 0) {
      const currentDate = new Date(completion.date);
      const prevDate = new Date(sortedCompletions[i - 1].date);
      const dayDiff = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff > 1) break;
    }

    // Check if the goal was met
    if (
      completion.completed &&
      (completion.value !== undefined ? completion.value >= goalValue : false)
    ) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get all daily notes
 * @returns Promise with all daily notes
 */
export const getNotes = async (): Promise<DailyNote[]> => {
  return await readData<DailyNote[]>(NOTES_FILE);
};

/**
 * Get a note by date
 * @param date The date to find in YYYY-MM-DD format
 * @returns The note if found, null otherwise
 */
export const getNoteByDate = async (
  date: string
): Promise<DailyNote | null> => {
  const notes = await getNotes();
  const note = notes.find((n) => n.date === date);
  return note || null;
};

/**
 * Create or update a daily note
 * @param noteData The note data
 * @returns The created or updated note
 */
export const saveNote = async (
  noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt">
): Promise<DailyNote> => {
  const notes = await getNotes();
  const now = new Date().toISOString();

  const existingIndex = notes.findIndex((n) => n.date === noteData.date);

  if (existingIndex >= 0) {
    // Update existing note
    notes[existingIndex] = {
      ...notes[existingIndex],
      content: noteData.content,
      updatedAt: now,
    };

    await writeData(NOTES_FILE, notes);
    return notes[existingIndex];
  } else {
    // Create new note
    const newNote: DailyNote = {
      id: uuidv4(),
      ...noteData,
      createdAt: now,
      updatedAt: now,
    };

    notes.push(newNote);
    await writeData(NOTES_FILE, notes);
    return newNote;
  }
};

/**
 * Delete a note
 * @param id The note ID to delete
 * @returns Whether the deletion was successful
 */
export const deleteNote = async (id: string): Promise<boolean> => {
  const notes = await getNotes();
  const initialLength = notes.length;

  const filteredNotes = notes.filter((n) => n.id !== id);

  if (filteredNotes.length === initialLength) {
    return false;
  }

  await writeData(NOTES_FILE, filteredNotes);
  return true;
};

/**
 * Get the app settings
 * @returns The app settings
 */
export const getSettings = async (): Promise<Settings> => {
  return await readData<Settings>(SETTINGS_FILE);
};

/**
 * Update app settings
 * @param settingsData The settings data to update
 * @returns The updated settings
 */
export const updateSettings = async (
  settingsData: Partial<Settings>
): Promise<Settings> => {
  const settings = await getSettings();

  const updatedSettings: Settings = {
    ...settings,
    ...settingsData,
  };

  await writeData(SETTINGS_FILE, updatedSettings);
  return updatedSettings;
};

/**
 * Create a backup of all data
 * @returns The backup data
 */
export const createBackup = async (): Promise<BackupData> => {
  const habits = await getHabits();
  const completions = await getCompletions();
  const notes = await getNotes();
  const settings = await getSettings();

  const backupData: BackupData = {
    habits,
    completions,
    notes,
    settings,
    timestamp: new Date().toISOString(),
  };

  const backupFileName = `backup-${formatDateToString(new Date())}.json`;
  await ensureFileExists(`${BACKUP_FOLDER}/${backupFileName}`, backupData);

  await updateSettings({ lastBackupDate: getTodayDateString() });

  return backupData;
};

/**
 * Restore data from a backup
 * @param backupData The backup data to restore
 */
export const restoreFromBackup = async (
  backupData: BackupData
): Promise<void> => {
  await writeData(HABITS_FILE, backupData.habits);
  await writeData(COMPLETIONS_FILE, backupData.completions);
  await writeData(NOTES_FILE, backupData.notes);
  await writeData(SETTINGS_FILE, backupData.settings);
};

/**
 * Calculate analytics for a habit
 * @param habitId The habit ID to calculate analytics for
 * @returns Analytics for the habit
 */
export const calculateHabitAnalytics = async (
  habitId: string
): Promise<HabitAnalytics | null> => {
  const habit = await getHabitById(habitId);
  if (!habit) return null;

  const completions = await getCompletionsByHabitId(habitId);
  if (completions.length === 0) {
    return {
      habitId,
      successRate: 0,
      bestDayOfWeek: 0,
      worstDayOfWeek: 0,
      longestStreak: 0,
      totalCompletions: 0,
      averageCompletionsPerWeek: 0,
    };
  }

  // Total completions
  const totalCompletions = completions.filter((c) => c.completed).length;

  // Success rate
  const successRate = totalCompletions / completions.length;

  // Longest streak (just use the habit's bestStreak)
  const longestStreak = habit.bestStreak;

  // Completions by day of week
  const dayCompletions = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayAttempts = [0, 0, 0, 0, 0, 0, 0];

  completions.forEach((completion) => {
    const date = new Date(completion.date);
    const dayOfWeek = date.getDay();

    dayAttempts[dayOfWeek]++;
    if (completion.completed) {
      dayCompletions[dayOfWeek]++;
    }
  });

  // Best and worst days (with at least one attempt)
  let bestDay = 0;
  let worstDay = 0;
  let bestRate = 0;
  let worstRate = 1;

  for (let i = 0; i < 7; i++) {
    if (dayAttempts[i] > 0) {
      const rate = dayCompletions[i] / dayAttempts[i];
      if (rate > bestRate) {
        bestRate = rate;
        bestDay = i;
      }
      if (rate < worstRate) {
        worstRate = rate;
        worstDay = i;
      }
    }
  }

  // Average completions per week
  const firstCompletion = new Date(completions[0].date);
  const lastCompletion = new Date(completions[completions.length - 1].date);
  const totalDays =
    Math.ceil(
      (lastCompletion.getTime() - firstCompletion.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
  const totalWeeks = Math.max(1, totalDays / 7);
  const averageCompletionsPerWeek = totalCompletions / totalWeeks;

  return {
    habitId,
    successRate,
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
    longestStreak,
    totalCompletions,
    averageCompletionsPerWeek,
  };
};

/**
 * Replace all completion records with a new set
 * @param completions New set of completion records
 */
export const replaceAllCompletions = async (
  completions: CompletionRecord[]
): Promise<void> => {
  await writeData(COMPLETIONS_FILE, completions);
};

// Initialize data on module load
initializeData()
  .then(() => console.log("Data service initialized"))
  .catch((err) => console.error("Data service initialization failed:", err));
