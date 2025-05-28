import { DailyNote } from "@shared/types/note";

const API_BASE_URL = "http://localhost:5002/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class NotesService {
  /**
   * Get all notes
   */
  static async getAllNotes(): Promise<DailyNote[]> {
    const response = await fetch(`${API_BASE_URL}/notes`);
    const result: ApiResponse<DailyNote[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch notes");
    }

    return result.data;
  }

  /**
   * Get note by date
   * @param date - Date in YYYY-MM-DD format
   */
  static async getNoteByDate(date: string): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes/${date}`);
    const result: ApiResponse<DailyNote> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch note");
    }

    return result.data;
  }

  /**
   * Create a new note
   */
  static async createNote(
    note: Omit<DailyNote, "id" | "createdAt" | "updatedAt">
  ): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    const result: ApiResponse<DailyNote> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to create note");
    }

    return result.data;
  }

  /**
   * Update an existing note
   */
  static async updateNote(
    id: string,
    note: Partial<Omit<DailyNote, "id" | "date" | "createdAt" | "updatedAt">>
  ): Promise<DailyNote> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    const result: ApiResponse<DailyNote> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to update note");
    }

    return result.data;
  }

  /**
   * Delete a note
   */
  static async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete note");
    }
  }
  /**
   * Get available moods
   */
  static async getMoods(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/options/moods?legacy=true`);
    const result: ApiResponse<string[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch moods");
    }

    return result.data;
  }

  /**
   * Add a new mood
   */
  static async addMood(mood: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/options/moods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mood }),
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to add mood");
    }
  }

  /**
   * Remove a mood
   */
  static async removeMood(mood: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/options/moods/${encodeURIComponent(mood)}`,
      {
        method: "DELETE",
      }
    );

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to remove mood");
    }
  }
  /**
   * Get available productivity levels
   */
  static async getProductivityLevels(): Promise<string[]> {
    const response = await fetch(
      `${API_BASE_URL}/options/productivity-levels?legacy=true`
    );
    const result: ApiResponse<string[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch productivity levels");
    }

    return result.data;
  }

  /**
   * Add a new productivity level
   */
  static async addProductivityLevel(level: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/options/productivity-levels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level }),
      }
    );

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to add productivity level");
    }
  }
  /**
   * Remove a productivity level
   */
  static async removeProductivityLevel(level: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/options/productivity-levels/${encodeURIComponent(
        level
      )}`,
      {
        method: "DELETE",
      }
    );

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to remove productivity level");
    }
  }

  /**
   * Get notes analytics overview
   */ static async getNotesAnalytics(): Promise<{
    totalNotes: number;
    notesWithMood: number;
    notesWithProductivity: number;
    moodDistribution: Record<string, number>;
    productivityDistribution: Record<string, number>;
    monthlyFrequency: Record<string, number>;
    avgContentLength: number;
    longestStreak: number;
    currentStreak: number;
    avgMoodValue: number | null;
    avgProductivityValue: number | null;
    moodValueMap: Record<string, number>;
    productivityValueMap: Record<string, number>;
    monthlyMoodScores: Record<
      string,
      { avg: number; count: number; sum: number }
    >;
    monthlyProductivityScores: Record<
      string,
      { avg: number; count: number; sum: number }
    >;
    completionRate: {
      mood: number;
      productivity: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/notes/analytics/overview`);
    const result: ApiResponse<{
      totalNotes: number;
      notesWithMood: number;
      notesWithProductivity: number;
      moodDistribution: Record<string, number>;
      productivityDistribution: Record<string, number>;
      monthlyFrequency: Record<string, number>;
      avgContentLength: number;
      longestStreak: number;
      currentStreak: number;
      avgMoodValue: number | null;
      avgProductivityValue: number | null;
      moodValueMap: Record<string, number>;
      productivityValueMap: Record<string, number>;
      monthlyMoodScores: Record<
        string,
        { avg: number; count: number; sum: number }
      >;
      monthlyProductivityScores: Record<
        string,
        { avg: number; count: number; sum: number }
      >;
      completionRate: {
        mood: number;
        productivity: number;
      };
    }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch notes analytics");
    }

    return result.data;
  }

  /**
   * Get mood trends over time
   */ static async getMoodTrends(
    startDate?: string,
    endDate?: string
  ): Promise<{
    trends: Array<{
      month: string;
      averageMood: number;
      count: number;
      distribution: Array<{
        label: string;
        value: number;
        count: number;
      }>;
    }>;
    moodValueMap: Record<string, number>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await fetch(
      `${API_BASE_URL}/notes/analytics/mood-trends?${params}`
    );
    const result: ApiResponse<{
      trends: Array<{
        month: string;
        averageMood: number;
        count: number;
        distribution: Array<{
          label: string;
          value: number;
          count: number;
        }>;
      }>;
      moodValueMap: Record<string, number>;
    }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch mood trends");
    }

    return result.data;
  }

  /**
   * Get productivity correlation with habits
   */ static async getProductivityCorrelation(): Promise<{
    correlations: Array<{
      habitId: string;
      habitName: string;
      datesCompletedCount: number;
      datesNotCompletedCount: number;
      avgProductivityWithCompletion: number | null;
      avgProductivityWithoutCompletion: number | null;
      productivityImpact: number | null;
    }>;
    productivityValueMap: Record<string, number>;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/notes/analytics/productivity-correlation`
    );
    const result: ApiResponse<{
      correlations: Array<{
        habitId: string;
        habitName: string;
        datesCompletedCount: number;
        datesNotCompletedCount: number;
        avgProductivityWithCompletion: number | null;
        avgProductivityWithoutCompletion: number | null;
        productivityImpact: number | null;
      }>;
      productivityValueMap: Record<string, number>;
    }> = await response.json();

    if (!result.success) {
      throw new Error(
        result.message || "Failed to fetch productivity correlation"
      );
    }

    return result.data;
  }

  /**
   * Get calendar data for notes
   */ static async getNotesCalendar(
    year: number,
    month: number
  ): Promise<{
    year: number;
    month: number;
    totalNotes: number;
    calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    >;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/notes/calendar/${year}/${month}`
    );
    const result: ApiResponse<{
      year: number;
      month: number;
      notes: Array<{
        date: string;
        id: string;
        hasContent: boolean;
        contentPreview: string;
        mood?: string;
        moodValue?: number;
        productivityLevel?: string;
        productivityValue?: number;
      }>;
    }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch calendar data");
    }

    // Transform the data to the format expected by the NotesCalendar component
    const calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    > = {};

    // Populate the calendar data with entries from the notes array
    if (result.data.notes && Array.isArray(result.data.notes)) {
      result.data.notes.forEach((note) => {
        if (note.date) {
          calendarData[note.date] = {
            hasNote: true,
            mood: note.mood,
            productivityLevel: note.productivityLevel,
            contentLength: note.hasContent
              ? note.contentPreview?.length || 0
              : 0,
          };
        }
      });
    }

    return {
      year: result.data.year,
      month: result.data.month,
      totalNotes: result.data.notes?.length || 0,
      calendarData: calendarData,
    };
  }
}
