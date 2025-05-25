import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from "lucide-react";
import { RecordsService } from "../services/records";
import { NotesService } from "../services/notes";
import { habitsService } from "../services/habits";
import { completionsService } from "../services/completions";
import { useToast } from "../contexts/ToastContext";
import HabitCard from "../components/features/HabitCard";
import DailyNotes from "../components/features/DailyNotes";
import Button from "../components/ui/Button";
import Progress from "../components/ui/Progress";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { DailyNote } from "@shared/types/note";

interface Record {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
  habitName: string;
  habitTag: string;
  goalType: string;
  goalValue: number;
  value: number;
}

interface DailyStats {
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}

interface DailyRecords {
  date: string;
  records: Record[];
  stats: DailyStats;
}

interface TabData {
  tag: string;
  records: Record[];
  completed: number;
  total: number;
  completionRate: number;
}

const Daily: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyRecords, setDailyRecords] = useState<DailyRecords | null>(null);
  const [dailyNote, setDailyNote] = useState<DailyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("habits");
  const [activeHabitTab, setActiveHabitTab] = useState<string>("All");
  const { addToast } = useToast();

  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "EEEE, MMMM d, yyyy");
  const fetchDailyData = useCallback(async () => {
    setLoading(true);
    try {
      // First, get all active habits
      const allHabits = await habitsService.getAllHabits();
      const activeHabits = allHabits.filter((habit) => habit.isActive);

      // Get existing completions for this date
      const existingCompletions = await completionsService.getDailyCompletions(
        formattedDate
      );

      // Create a map of existing completions for quick lookup
      const completionMap = new Map(
        existingCompletions.map((c) => [c.habitId, c])
      );

      // Create records for all active habits, using existing completions or defaults
      const records = activeHabits.map((habit) => {
        const completion = completionMap.get(habit.id);
        return {
          id: completion?.id || `temp-${habit.id}`,
          habitId: habit.id,
          date: formattedDate,
          completed: completion?.completed || false,
          completedAt: completion?.completedAt || "",
          habitName: habit.name,
          habitTag: habit.tag,
          goalType: habit.goalType,
          goalValue: habit.goalValue,
          value: completion?.completed ? 1 : 0,
        };
      });

      // Calculate stats
      const completedHabits = records.filter((r) => r.completed).length;
      const totalHabits = records.length;
      const completionRate =
        totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      // Set the daily records
      setDailyRecords({
        date: formattedDate,
        records,
        stats: {
          totalHabits,
          completedHabits,
          completionRate,
        },
      });

      // Fetch daily note (might not exist)
      try {
        const note = await NotesService.getNoteByDate(formattedDate);
        setDailyNote(note);
      } catch {
        // Note doesn't exist for this date, which is fine
        setDailyNote(null);
      }
    } catch (error) {
      console.error("Error fetching daily data:", error);
      addToast("Failed to load daily data", "error");
    } finally {
      setLoading(false);
    }
  }, [formattedDate, addToast]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleHabitCompletion = async (habitId: string) => {
    try {
      await RecordsService.toggleCompletion(habitId, formattedDate);
      // Refresh data after toggle
      await fetchDailyData();
      addToast("Habit completion updated", "success");
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      addToast("Failed to update habit completion", "error");
    }
  };

  const markAllComplete = async (tag: string) => {
    if (!dailyRecords) return;

    try {
      const habitsToComplete = dailyRecords.records.filter(
        (record) => record.habitTag === tag && !record.completed
      );

      for (const habit of habitsToComplete) {
        await RecordsService.markHabitComplete(habit.habitId, formattedDate);
      }

      await fetchDailyData();
      addToast(`All ${tag} habits marked as complete`, "success");
    } catch (error) {
      console.error("Error marking all habits complete:", error);
      addToast("Failed to mark all habits complete", "error");
    }
  };

  const getTabsData = (): TabData[] => {
    if (!dailyRecords) return [];

    const tagGroups = new Map<string, Record[]>();

    // Group records by tag
    dailyRecords.records.forEach((record) => {
      const tag = record.habitTag || "Uncategorized";
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, []);
      }
      tagGroups.get(tag)!.push(record);
    });

    // Create tab data
    const tabs: TabData[] = [];

    // Add "All" tab
    tabs.push({
      tag: "All",
      records: dailyRecords.records,
      completed: dailyRecords.stats.completedHabits,
      total: dailyRecords.stats.totalHabits,
      completionRate: dailyRecords.stats.completionRate,
    });

    // Add individual tag tabs
    tagGroups.forEach((records, tag) => {
      const completed = records.filter((r) => r.completed).length;
      const total = records.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      tabs.push({
        tag,
        records,
        completed,
        total,
        completionRate,
      });
    });

    return tabs;
  };

  const getCurrentTabData = (): TabData | null => {
    const tabs = getTabsData();
    return tabs.find((tab) => tab.tag === activeHabitTab) || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabsData = getTabsData();
  const currentTabData = getCurrentTabData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Daily Tracker
          </h1>
          <Button
            onClick={goToToday}
            variant="secondary"
            size="sm"
            className="text-sm"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={goToPreviousDay}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {displayDate}
            </p>
          </div>

          <Button
            onClick={goToNextDay}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      {dailyRecords && (
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daily Progress</h2>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(dailyRecords.stats.completionRate)}%
              </div>
            </div>
            <Progress
              value={dailyRecords.stats.completionRate}
              className="h-3 mb-2"
              variant="default"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dailyRecords.stats.completedHabits} of{" "}
              {dailyRecords.stats.totalHabits} habits completed
            </p>
          </div>
        </Card>
      )}

      {/* Main Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("habits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "habits"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Habits</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "notes"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Notes</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "habits" && (
        <>
          {/* Habit Tags Navigation */}
          {tabsData.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {tabsData.map((tab) => (
                <button
                  key={tab.tag}
                  onClick={() => setActiveHabitTab(tab.tag)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    activeHabitTab === tab.tag
                      ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="font-medium">{tab.tag}</span>
                  <Badge
                    variant={tab.completionRate === 100 ? "success" : "default"}
                    size="sm"
                  >
                    {tab.completed}/{tab.total}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Mark All Complete Button */}
          {currentTabData &&
            activeHabitTab !== "All" &&
            currentTabData.completed < currentTabData.total && (
              <div className="mb-4">
                <Button
                  onClick={() => markAllComplete(activeHabitTab)}
                  variant="primary"
                  size="sm"
                >
                  Mark All {activeHabitTab} Complete
                </Button>
              </div>
            )}

          {/* Habits List */}
          {currentTabData && currentTabData.records.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabData.records.map((record) => (
                <HabitCard
                  key={record.habitId}
                  record={record}
                  onToggleCompletion={toggleHabitCompletion}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No habits found for this date.
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      {activeTab === "notes" && (
        <DailyNotes
          date={formattedDate}
          initialNote={dailyNote}
          onNoteUpdate={() => fetchDailyData()}
        />
      )}
    </div>
  );
};

export default Daily;
