import { v4 as uuidv4 } from "uuid";
import { readData, writeData, ensureFileExists } from "./fileStorageService";
import {
  Habit,
  CompletionRecord,
  DailyNote,
  HabitAnalytics,
} from "../../../shared/types";
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
  reminderEnabled: false,
  backupEnabled: true,
  backupFrequency: "weekly",
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
    "id" | "createdAt" | "currentStreak" | "bestStreak" | "isActive"
  >
): Promise<Habit> => {
  const habits = await getHabits();

  const newHabit: Habit = {
    id: uuidv4(),
    ...habitData,
    currentStreak: 0,
    bestStreak: 0,
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
 * Update a habit's current and best streak values
 * @param habitId The habit ID to update streaks for
 */
const updateHabitStreaks = async (habitId: string): Promise<void> => {
  const habit = await getHabitById(habitId);
  if (!habit) return;

  const completions = await getCompletionsByHabitId(habitId);
  completions.sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let bestStreak = habit.bestStreak;

  // Simple calculation for streaks - can be improved with repetition pattern logic
  for (let i = completions.length - 1; i >= 0; i--) {
    if (completions[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  await updateHabit(habitId, { currentStreak, bestStreak });
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
