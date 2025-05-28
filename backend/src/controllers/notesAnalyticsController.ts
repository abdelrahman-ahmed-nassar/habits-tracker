import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import { isValidDateFormat } from "../utils/validation";

/**
 * Get notes analytics overview
 * @route GET /api/notes/analytics/overview
 */
export const getNotesAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const notes = await dataService.getNotes();

    // Calculate basic statistics
    const totalNotes = notes.length;
    const notesWithMood = notes.filter((n) => n.mood).length;
    const notesWithProductivity = notes.filter(
      (n) => n.productivityLevel
    ).length;

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    notes.forEach((note) => {
      if (note.mood) {
        moodCounts[note.mood] = (moodCounts[note.mood] || 0) + 1;
      }
    });

    // Calculate productivity distribution
    const productivityCounts: Record<string, number> = {};
    notes.forEach((note) => {
      if (note.productivityLevel) {
        productivityCounts[note.productivityLevel] =
          (productivityCounts[note.productivityLevel] || 0) + 1;
      }
    });

    // Calculate monthly note frequency
    const monthlyFrequency: Record<string, number> = {};
    notes.forEach((note) => {
      const monthKey = note.date.substring(0, 7); // YYYY-MM
      monthlyFrequency[monthKey] = (monthlyFrequency[monthKey] || 0) + 1;
    });

    // Calculate average content length
    const avgContentLength =
      notes.length > 0
        ? Math.round(
            notes.reduce((sum, note) => sum + note.content.length, 0) /
              notes.length
          )
        : 0;

    // Find longest streak of consecutive days with notes
    const sortedDates = notes.map((n) => n.date).sort();
    let longestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currentDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        notesWithMood,
        notesWithProductivity,
        moodDistribution: moodCounts,
        productivityDistribution: productivityCounts,
        monthlyFrequency,
        avgContentLength,
        longestStreak,
        completionRate: {
          mood:
            totalNotes > 0 ? Math.round((notesWithMood / totalNotes) * 100) : 0,
          productivity:
            totalNotes > 0
              ? Math.round((notesWithProductivity / totalNotes) * 100)
              : 0,
        },
      },
    });
  }
);

/**
 * Get mood trends over time
 * @route GET /api/notes/analytics/mood-trends
 */
export const getMoodTrends = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    let notes = await dataService.getNotes();

    // Filter by date range if provided
    if (
      startDate &&
      typeof startDate === "string" &&
      isValidDateFormat(startDate)
    ) {
      notes = notes.filter((n) => n.date >= startDate);
    }
    if (endDate && typeof endDate === "string" && isValidDateFormat(endDate)) {
      notes = notes.filter((n) => n.date <= endDate);
    }

    // Group notes by week
    const weeklyMoods: Record<string, Record<string, number>> = {};

    notes.forEach((note) => {
      if (note.mood) {
        const noteDate = new Date(note.date);
        const weekStart = new Date(noteDate);
        weekStart.setDate(noteDate.getDate() - noteDate.getDay());
        const weekKey = weekStart.toISOString().substring(0, 10);

        if (!weeklyMoods[weekKey]) {
          weeklyMoods[weekKey] = {};
        }
        weeklyMoods[weekKey][note.mood] =
          (weeklyMoods[weekKey][note.mood] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        weeklyMoods,
        totalNotesAnalyzed: notes.filter((n) => n.mood).length,
      },
    });
  }
);

/**
 * Get productivity correlation with habits
 * @route GET /api/notes/analytics/productivity-correlation
 */
export const getProductivityCorrelation = asyncHandler(
  async (req: Request, res: Response) => {
    const notes = await dataService.getNotes();
    const completions = await dataService.getCompletions();

    // Group data by date
    const dailyData: Record<
      string,
      {
        productivity?: string;
        completedHabits: number;
        totalHabits: number;
      }
    > = {};

    // Process notes
    notes.forEach((note) => {
      if (note.productivityLevel) {
        dailyData[note.date] = {
          ...dailyData[note.date],
          productivity: note.productivityLevel,
        };
      }
    });

    // Process completions
    completions.forEach((completion) => {
      if (!dailyData[completion.date]) {
        dailyData[completion.date] = { completedHabits: 0, totalHabits: 0 };
      }

      dailyData[completion.date].totalHabits++;
      if (completion.completed) {
        dailyData[completion.date].completedHabits++;
      }
    });

    // Calculate correlation data
    const correlationData = Object.entries(dailyData)
      .filter(([_, data]) => data.productivity && data.totalHabits > 0)
      .map(([date, data]) => ({
        date,
        productivity: data.productivity!,
        completionRate:
          data.totalHabits > 0
            ? (data.completedHabits / data.totalHabits) * 100
            : 0,
        completedHabits: data.completedHabits,
        totalHabits: data.totalHabits,
      }));

    // Group by productivity level
    const productivityGroups: Record<
      string,
      {
        avgCompletionRate: number;
        totalDays: number;
        totalCompletedHabits: number;
        totalHabits: number;
      }
    > = {};

    correlationData.forEach((data) => {
      if (!productivityGroups[data.productivity]) {
        productivityGroups[data.productivity] = {
          avgCompletionRate: 0,
          totalDays: 0,
          totalCompletedHabits: 0,
          totalHabits: 0,
        };
      }

      const group = productivityGroups[data.productivity];
      group.totalDays++;
      group.totalCompletedHabits += data.completedHabits;
      group.totalHabits += data.totalHabits;
    });

    // Calculate averages
    Object.keys(productivityGroups).forEach((productivity) => {
      const group = productivityGroups[productivity];
      group.avgCompletionRate =
        group.totalHabits > 0
          ? Math.round((group.totalCompletedHabits / group.totalHabits) * 100)
          : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        correlationData,
        productivityGroups,
        totalDaysAnalyzed: correlationData.length,
      },
    });
  }
);

/**
 * Get calendar data for notes
 * @route GET /api/notes/calendar/:year/:month
 */
export const getNotesCalendar = asyncHandler(
  async (req: Request, res: Response) => {
    const { year, month } = req.params;

    // Validate year and month
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError("Invalid year or month", 400);
    }

    // Get start and end dates for the month
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${year}-${month.padStart(2, "0")}-${lastDay
      .toString()
      .padStart(2, "0")}`;

    // Get all notes for the month
    const allNotes = await dataService.getNotes();
    const monthNotes = allNotes.filter(
      (note) => note.date >= startDate && note.date <= endDate
    );

    // Create calendar structure
    const calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    > = {};

    // Fill in the days of the month
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${month.padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const note = monthNotes.find((n) => n.date === dateStr);

      calendarData[dateStr] = {
        hasNote: !!note,
        mood: note?.mood,
        productivityLevel: note?.productivityLevel,
        contentLength: note?.content.length || 0,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        month: monthNum,
        totalNotes: monthNotes.length,
        calendarData,
      },
    });
  }
);
