// filepath: s:/projects/habits-tracker/frontend/src/pages/Weekly.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  addDays,
  isValid,
  parseISO,
  addWeeks,
  subWeeks,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowUp,
  ArrowDown,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import { RecordsService } from "../services/records";
import { completionsService } from "../services/completions";
import { analyticsService } from "../services/analytics";
import { habitsService } from "../services/habits";
import type { Habit } from "@shared/types/habit";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import CounterInput from "../components/ui/CounterInput";
import WeeklyAnalytics from "../components/features/WeeklyAnalytics";
import ErrorBoundary from "../components/ui/ErrorBoundary";

interface WeeklyAnalyticsData {
  startDate: string;
  endDate: string;
  dailyStats: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
  weeklyStats: {
    overallSuccessRate: number;
    totalCompletions: number;
    mostProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    leastProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    mostProductiveHabit: {
      habitId: string;
      habitName: string;
      activeDaysCount: number;
      completedDaysCount: number;
      successRate: number;
      completedDates: string[];
    };
  };
  habitStats: Array<{
    habitId: string;
    habitName: string;
    activeDaysCount: number;
    completedDaysCount: number;
    successRate: number;
    completedDates: string[];
  }>;
}

const transformAnalyticsData = (
  apiResponse: any
): WeeklyAnalyticsData | null => {
  if (!apiResponse?.dailyStats?.length) return null;
  return {
    startDate: apiResponse.startDate,
    endDate: apiResponse.endDate,
    dailyStats: apiResponse.dailyStats,
    weeklyStats: {
      overallSuccessRate: apiResponse.weeklyStats?.overallSuccessRate || 0,
      totalCompletions: apiResponse.weeklyStats?.totalCompletions || 0,
      mostProductiveDay: apiResponse.weeklyStats?.mostProductiveDay || null,
      leastProductiveDay: apiResponse.weeklyStats?.leastProductiveDay || null,
      mostProductiveHabit: apiResponse.weeklyStats?.mostProductiveHabit || null,
    },
    habitStats: apiResponse.habitStats || [],
  };
};

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
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
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

interface WeeklyRecords {
  startDate: string;
  endDate: string;
  records: DailyRecords[];
}

// API response interfaces
interface WeeklyRecordsApiResponse {
  startDate: string;
  endDate: string;
  dailyStats: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
  weeklyStats: {
    overallSuccessRate: number;
    totalCompletions: number;
    mostProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    leastProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    mostProductiveHabit: {
      habitId: string;
      habitName: string;
      activeDaysCount: number;
      completedDaysCount: number;
      successRate: number;
      completedDates: string[];
    };
  };
  habitStats: Array<{
    habitId: string;
    habitName: string;
    activeDaysCount: number;
    completedDaysCount: number;
    successRate: number;
    completedDates: string[];
  }>;
}

interface HabitCardProps {
  record: Record;
  onToggleCompletion: (habitId: string, date: string) => void;
  onUpdateCounter?: (habitId: string, date: string, value: number) => void;
  isUpdating: boolean;
}

interface DayColumnProps {
  date: string;
  dayRecords: Record[];
  onToggleCompletion: (habitId: string, date: string) => void;
  onUpdateCounter: (habitId: string, date: string, value: number) => void;
  updatingRecords: Set<string>;
}

interface WeekStats {
  totalHabits: number;
  completionRate: number;
  bestDay: {
    date: string;
    completionRate: number;
  } | null;
  worstDay: {
    date: string;
    completionRate: number;
  } | null;
  completionTrend: "up" | "down" | "same" | null;
  bestHabits: { habitName: string; completionRate: number }[];
}

// Compact Habit Card for the board view
const HabitCard: React.FC<HabitCardProps> = ({
  record,
  onToggleCompletion,
  onUpdateCounter,
  isUpdating,
}) => {
  const getBgColor = () => {
    if (
      record.completed ||
      (record.goalType === "counter" && record.value >= record.goalValue)
    ) {
      return "bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800";
    }
    return "bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
  };

  const getProgressValue = () => {
    if (record.goalType === "counter") {
      return Math.min((record.value / record.goalValue) * 100, 100);
    }
    return record.completed ? 100 : 0;
  };

  const getProgressDisplay = () => {
    if (record.goalType === "counter") {
      return `${record.value}/${record.goalValue}`;
    }
    return record.completed ? "Completed" : "Not completed";
  };

  const progressValue = getProgressValue();

  return (
    <div
      className={`rounded-xl border ${getBgColor()} p-3 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] relative w-full snap-start  ${
        record.goalType === "counter" ? "min-h-[160px]" : "min-h-[120px]"
      }`}
      onClick={() =>
        record.goalType !== "counter" &&
        onToggleCompletion(record.habitId, record.date)
      }
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header with name and badge */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`font-medium truncate transition-colors duration-200 ${
              record.completed ||
              (record.goalType === "counter" &&
                record.value >= record.goalValue)
                ? "text-green-700 dark:text-green-400"
                : ""
            }`}
            title={record.habitName}
          >
            {record.habitName}
          </div>
          <Badge
            variant={
              record.goalType === "counter"
                ? record.value >= record.goalValue
                  ? "success"
                  : record.value > 0
                  ? "warning"
                  : "default"
                : record.completed
                ? "success"
                : "default"
            }
            size="sm"
            className="bg-opacity-70 dark:bg-opacity-50"
          >
            {record.habitTag}
          </Badge>
        </div>

        {/* Progress section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{getProgressDisplay()}</span>
          </div>
          <Progress
            value={progressValue}
            variant={
              record.completed ||
              (record.goalType === "counter" &&
                record.value >= record.goalValue)
                ? "success"
                : "default"
            }
            className="h-2"
          />
        </div>

        {/* Counter or Checkbox */}
        {record.goalType === "counter" ? (
          <div className="mt-auto">
            <div className="text-center">
              <CounterInput
                value={record.value}
                goalValue={record.goalValue}
                onValueChange={(value: number) =>
                  onUpdateCounter?.(record.habitId, record.date, value)
                }
                disabled={isUpdating}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center mt-auto">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-lg mr-3 flex items-center justify-center transition-all duration-300
                ${
                  record.completed
                    ? "bg-green-500"
                    : "border-2 border-gray-300 dark:border-gray-600"
                }`}
            >
              {record.completed && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {record.completed ? "Completed" : "Mark as done"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Day Column Component - Each column represents a day of the week with vertically stacked habits
const DayColumn: React.FC<DayColumnProps> = ({
  date,
  dayRecords,
  onToggleCompletion,
  onUpdateCounter,
  updatingRecords,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate completion stats
  const totalHabits = dayRecords.length;
  const completedHabits = dayRecords.filter(
    (record: Record) =>
      record.completed ||
      (record.goalType === "counter" && record.value >= record.goalValue)
  ).length;
  const completionRate =
    totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  // Format date info
  const dayName = format(parseISO(date), "EEEE");
  const dayNumber = format(parseISO(date), "d");
  const monthName = format(parseISO(date), "MMM");
  const isToday = format(new Date(), "yyyy-MM-dd") === date;

  return (
    <div className="flex-1 min-w-[250px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      {/* Day header */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
          isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        id="top-scroll"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${
                isToday
                  ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <span className="text-lg font-bold">{dayNumber}</span>
            </div>
            <div>
              <div
                className={`font-medium ${
                  isToday ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {dayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {monthName}
              </div>
            </div>
          </div>
          <Link
            to={`/daily/${date}`}
            className="text-blue-500 hover:underline text-xs"
          >
            View
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round(completionRate)}%
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completedHabits}/{totalHabits}
          </span>
        </div>
      </div>

      {/* Scrollable habits container */}
      <div className="relative h-[calc(100%-80px)] group">
        <div
          className="h-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 space-y-2"
          ref={scrollContainerRef}
          style={{ scrollBehavior: "smooth" }}
        >
          {dayRecords.length > 0 ? (
            dayRecords.map((record: Record) => {
              const key = `${record.habitId}-${date}`;
              const isUpdating = updatingRecords.has(key);

              return (
                <HabitCard
                  key={key}
                  record={record}
                  onToggleCompletion={onToggleCompletion}
                  onUpdateCounter={onUpdateCounter}
                  isUpdating={isUpdating}
                />
              );
            })
          ) : (
            <div className="flex items-center justify-center text-gray-500 italic h-24 text-sm">
              No habits for current week
            </div>
          )}
        </div>

        {/* Scroll controls - only visible when needed and hovered */}
        {dayRecords.length > 5 && (
          <>
            <a
              href="#bottom-scroll"
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 opacity-0 group-hover:opacity-80 transition-opacity z-99"
              aria-label="Scroll down"
            >
              <ChevronRight className="rotate-90" size={20} />
            </a>
            <a
              id="bottom-scroll"
              href="#top-scroll"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 opacity-0 group-hover:opacity-80 transition-opacity z-99"
              aria-label="Scroll up"
            >
              <ChevronLeft className="rotate-90" size={20} />
            </a>
          </>
        )}
      </div>
    </div>
  );
};

const Weekly: React.FC = () => {
  // Get URL parameters and navigation
  const { date: urlDate } = useParams<{ date?: string }>();
  const navigate = useNavigate();

  // State for the current week's start date
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Use URL date if valid, otherwise default to start of current week
    if (urlDate && isValid(parseISO(urlDate))) {
      return startOfWeek(parseISO(urlDate), { weekStartsOn: 6 });
    }
    return startOfWeek(new Date(), { weekStartsOn: 6 });
  });

  // State for weekly records
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecords | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updatingRecords, setUpdatingRecords] = useState<Set<string>>(
    new Set()
  );
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [lastWeekStats, setLastWeekStats] = useState<WeekStats | null>(null);
  const [weeklyAnalyticsData, setWeeklyAnalyticsData] =
    useState<WeeklyAnalyticsData | null>(null);

  // Format date range for display
  const weekDateRangeDisplay = `${format(currentWeekStart, "MMM d")} - ${format(
    addDays(currentWeekStart, 6),
    "MMM d, yyyy"
  )}`;

  // Fetch weekly records
  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDate = format(currentWeekStart, "yyyy-MM-dd");

      try {
        // Try to get records from the API
        const recordsResponse = await RecordsService.getWeeklyRecords(
          formattedDate
        );

        // Check if we have records in the expected format
        if (
          recordsResponse &&
          "records" in recordsResponse &&
          Array.isArray(recordsResponse.records)
        ) {
          // This is the standard records format - use it directly
          const enhancedRecords: WeeklyRecords = {
            ...recordsResponse,
            records: recordsResponse.records.map((dayRecord) => ({
              ...dayRecord,
              records: Array.isArray(dayRecord.records)
                ? dayRecord.records.map((record) => ({
                    ...record,
                    // Add missing properties with default values if they don't exist
                    currentStreak:
                      "currentStreak" in record
                        ? Number(record.currentStreak)
                        : 0,
                    bestStreak:
                      "bestStreak" in record ? Number(record.bestStreak) : 0,
                    currentCounter:
                      "currentCounter" in record
                        ? Number(record.currentCounter)
                        : 0,
                  }))
                : [],
            })),
          };

          setWeeklyRecords(enhancedRecords);
        } else if (
          recordsResponse &&
          "dailyStats" in recordsResponse &&
          Array.isArray(recordsResponse.dailyStats)
        ) {
          // We received a different format (analytics-like) - convert it to the expected format
          const recordsApiResponse =
            recordsResponse as unknown as WeeklyRecordsApiResponse;

          // Construct records for each day based on the analytics data
          const constructedRecords: DailyRecords[] = [];

          // Get habits details first
          const habits = await habitsService.getAllHabits();
          const habitsMap = new Map<string, Habit>(
            habits.map((h) => [h.id, h])
          );

          // Get an array of all habits from habitStats and combine with full habit details
          const allHabits =
            recordsApiResponse.habitStats?.map(
              (stat: {
                habitId: string;
                habitName: string;
                activeDaysCount?: number;
                completedDaysCount?: number;
                successRate: number;
                completedDates: string[];
              }) => {
                const habit = habitsMap.get(stat.habitId);
                const habitDetails = habit as Habit | undefined;
                return {
                  id: stat.habitId + "-record",
                  habitId: stat.habitId,
                  habitName: stat.habitName,
                  habitTag: habitDetails?.tag || "General",
                  goalType: habitDetails?.goalType || "streak",
                  goalValue: habitDetails?.goalValue || 1,
                  value: 0,
                  completed: false,
                  completedAt: "",
                  currentStreak: 0,
                  bestStreak: 0,
                  currentCounter: 0,
                };
              }
            ) || [];

          // For each day in the week, create a DailyRecords object
          for (let i = 0; i < 7; i++) {
            const currentDate = format(
              addDays(parseISO(recordsApiResponse.startDate), i),
              "yyyy-MM-dd"
            );
            const dailyStat = recordsApiResponse.dailyStats?.find(
              (stat: {
                date: string;
                dayOfWeek?: number;
                dayName?: string;
                totalHabits: number;
                completedHabits: number;
                completionRate: number;
              }) => stat.date === currentDate
            );

            if (dailyStat) {
              // Use completed dates from habitStats to determine which habits are completed
              const completedHabitIds = new Set<string>();
              recordsApiResponse.habitStats?.forEach(
                (habit: { habitId: string; completedDates?: string[] }) => {
                  if (habit.completedDates?.includes(currentDate)) {
                    completedHabitIds.add(habit.habitId);
                  }
                }
              );

              // Create record for each habit on this day
              const dayRecords = allHabits.map((habit) => ({
                ...habit,
                date: currentDate,
                completed: completedHabitIds.has(habit.habitId),
                completedAt: completedHabitIds.has(habit.habitId)
                  ? currentDate + "T12:00:00Z"
                  : "",
              }));

              constructedRecords.push({
                date: currentDate,
                records: dayRecords,
                stats: {
                  totalHabits: dailyStat.totalHabits,
                  completedHabits: dailyStat.completedHabits,
                  completionRate: dailyStat.completionRate,
                },
              });
            }
          }

          // Create WeeklyRecords object
          const constructedWeeklyRecords: WeeklyRecords = {
            startDate: recordsApiResponse.startDate,
            endDate: recordsApiResponse.endDate,
            records: constructedRecords,
          };

          setWeeklyRecords(constructedWeeklyRecords);
        } else {
          console.error("Invalid records data structure:", recordsResponse);
          toast.error("Received invalid data format from the server");
          setWeeklyRecords(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error fetching weekly records:", err);
        toast.error("Failed to load weekly data. Check network connection.");
        setWeeklyRecords(null);
        setLoading(false);
        return;
      }

      // Also fetch analytics for additional stats
      try {
        const analytics = await analyticsService.getWeeklyAnalytics(
          formattedDate
        );
        const transformedData = transformAnalyticsData(analytics);

        if (!transformedData) {
          console.error("Invalid analytics data structure:", analytics);
          toast.error("Received invalid analytics data format");
          setWeeklyAnalyticsData(null);
          setLoading(false);
          return;
        }

        try {
          // Save the transformed analytics data for use with the WeeklyAnalytics component
          setWeeklyAnalyticsData(transformedData);
        } catch (error) {
          console.error("Error processing analytics data:", error);
          toast.error("Could not process analytics data");
          setWeeklyAnalyticsData(null);
        }

        // Use the analytics data directly from the API structure
        let bestDay = null;
        let worstDay = null;

        // Use most/least productive days from weeklyStats if available
        if (analytics.weeklyStats && analytics.weeklyStats.mostProductiveDay) {
          bestDay = {
            date: analytics.weeklyStats.mostProductiveDay.date,
            completionRate:
              analytics.weeklyStats.mostProductiveDay.completionRate,
          };

          if (analytics.weeklyStats.leastProductiveDay) {
            worstDay = {
              date: analytics.weeklyStats.leastProductiveDay.date,
              completionRate:
                analytics.weeklyStats.leastProductiveDay.completionRate,
            };
          }
        }
        // Fallback to calculating from dailyStats if not available
        else if (analytics.dailyStats && analytics.dailyStats.length > 0) {
          const sortedStats = [...analytics.dailyStats].sort(
            (a, b) => b.completionRate - a.completionRate
          );

          bestDay = {
            date: sortedStats[0].date,
            completionRate: sortedStats[0].completionRate,
          };

          worstDay = {
            date: sortedStats[sortedStats.length - 1].date,
            completionRate: sortedStats[sortedStats.length - 1].completionRate,
          };
        }

        // Get the total habits count from the first day's stats (should be consistent across the week)
        const totalHabits =
          analytics.dailyStats && analytics.dailyStats.length > 0
            ? analytics.dailyStats[0].totalHabits
            : 0;

        // Use overallSuccessRate if available, otherwise calculate average completion rate
        const completionRate =
          analytics.weeklyStats?.overallSuccessRate ??
          analytics.dailyStats?.reduce(
            (sum, day) => sum + day.completionRate,
            0
          ) / (analytics.dailyStats?.length || 1);

        // Calculate stats for the current week
        const currWeekStats: WeekStats = {
          totalHabits,
          completionRate,
          bestDay,
          worstDay,
          completionTrend: null, // Will be set after fetching last week's data
          bestHabits: [], // To be populated if we add this feature
        };

        setWeekStats(currWeekStats);

        // Fetch last week's stats for comparison
        const lastWeekStart = format(
          subWeeks(currentWeekStart, 1),
          "yyyy-MM-dd"
        );
        try {
          const lastWeekAnalytics = await analyticsService.getWeeklyAnalytics(
            lastWeekStart
          );

          // Get total habits from first day stats or default to 0
          const lastWeekTotalHabits =
            lastWeekAnalytics.dailyStats?.length > 0
              ? lastWeekAnalytics.dailyStats[0].totalHabits
              : 0;

          // Use the weeklyStats.overallSuccessRate or calculate from dailyStats
          const lastWeekCompletionRate =
            lastWeekAnalytics.weeklyStats?.overallSuccessRate ??
            lastWeekAnalytics.dailyStats?.reduce(
              (sum, day) => sum + day.completionRate,
              0
            ) / (lastWeekAnalytics.dailyStats?.length || 1);

          const lastWeekStatsData: WeekStats = {
            totalHabits: lastWeekTotalHabits,
            completionRate: lastWeekCompletionRate,
            bestDay: null,
            worstDay: null,
            completionTrend: null,
            bestHabits: [],
          };

          setLastWeekStats(lastWeekStatsData);

          // Set the completion trend
          if (currWeekStats.completionRate > lastWeekStatsData.completionRate) {
            currWeekStats.completionTrend = "up";
          } else if (
            currWeekStats.completionRate < lastWeekStatsData.completionRate
          ) {
            currWeekStats.completionTrend = "down";
          } else {
            currWeekStats.completionTrend = "same";
          }

          setWeekStats({ ...currWeekStats });
        } catch (error) {
          console.error("Error fetching last week's analytics:", error);
          // Not critical, so just continuing
        }
      } catch (err) {
        console.error("Error fetching weekly analytics:", err);
        toast.error("Failed to load weekly analytics");
        setWeeklyAnalyticsData(null);
        // Continue without analytics data
      }
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      toast.error("Failed to load weekly data");
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  // Fetch data when the week changes
  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  // Navigation functions
  const goToPreviousWeek = () => {
    const prevWeek = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(prevWeek);
    navigate(`/weekly/${format(prevWeek, "yyyy-MM-dd")}`);
  };

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(nextWeek);
    navigate(`/weekly/${format(nextWeek, "yyyy-MM-dd")}`);
  };

  const goToCurrentWeek = () => {
    const today = startOfWeek(new Date());
    setCurrentWeekStart(today);
    navigate(`/weekly`);
  };

  // Toggle completion handler
  const handleToggleCompletion = async (habitId: string, date: string) => {
    if (!weeklyRecords) return;

    // Find the record for this habit and date
    const dayIndex = weeklyRecords.records.findIndex(
      (day) => day.date === date
    );
    if (dayIndex === -1) return;

    const recordIndex = weeklyRecords.records[dayIndex].records.findIndex(
      (r) => r.habitId === habitId
    );

    if (recordIndex === -1) return;

    // Create key for tracking updates
    const key = `${habitId}-${date}`;

    // Show loading indicator
    setUpdatingRecords((prev) => new Set(prev).add(key));

    // Optimistic update
    const updatedRecords = { ...weeklyRecords };
    const currentRecord = updatedRecords.records[dayIndex].records[recordIndex];
    const newCompleted = !currentRecord.completed;
    let newValue = 0;

    // For counter-type habits, toggle between 0 and goal value
    if (currentRecord.goalType === "counter") {
      newValue = newCompleted ? currentRecord.goalValue : 0;
    } else {
      newValue = newCompleted ? 1 : 0;
    }

    // Update the record
    updatedRecords.records[dayIndex].records[recordIndex] = {
      ...currentRecord,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : "",
      value: newValue,
    };

    // Recalculate stats for this day
    const dayRecords = updatedRecords.records[dayIndex].records;
    const completedHabits = dayRecords.filter((r) => r.completed).length;
    const totalHabits = dayRecords.length;
    const completionRate =
      totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    updatedRecords.records[dayIndex].stats = {
      totalHabits,
      completedHabits,
      completionRate,
    };

    // Update state immediately
    setWeeklyRecords(updatedRecords);

    try {
      // Make API call in background
      await completionsService.toggleCompletion(habitId, date);
      toast.success("Habit completion updated");
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      toast.error("Failed to update habit completion");

      // Revert optimistic update on error
      await fetchWeeklyData();
    } finally {
      // Remove item from updating set
      setUpdatingRecords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // Handle updating counter values
  const handleUpdateCounter = async (
    habitId: string,
    date: string,
    value: number
  ) => {
    if (!weeklyRecords) return;

    const key = `${habitId}-${date}`;

    // Find the record for this habit and date
    const dayIndex = weeklyRecords.records.findIndex(
      (day) => day.date === date
    );
    if (dayIndex === -1) return;

    const recordIndex = weeklyRecords.records[dayIndex].records.findIndex(
      (r) => r.habitId === habitId
    );

    if (recordIndex === -1) return;

    // Show loading indicator
    setUpdatingRecords((prev) => new Set(prev).add(key));

    // Optimistic update
    const updatedRecords = { ...weeklyRecords };
    const currentRecord = updatedRecords.records[dayIndex].records[recordIndex];
    const completed = value >= currentRecord.goalValue;

    // Update the record
    updatedRecords.records[dayIndex].records[recordIndex] = {
      ...currentRecord,
      completed,
      completedAt: completed ? new Date().toISOString() : "",
      value,
    };

    // Recalculate stats for this day
    const dayRecords = updatedRecords.records[dayIndex].records;
    const completedHabits = dayRecords.filter((r) => r.completed).length;
    const totalHabits = dayRecords.length;
    const completionRate =
      totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    updatedRecords.records[dayIndex].stats = {
      totalHabits,
      completedHabits,
      completionRate,
    };

    // Update state immediately
    setWeeklyRecords(updatedRecords);

    try {
      // Make API call in background
      await completionsService.updateCompletionValue(habitId, date, value);
      toast.success("Counter updated successfully");
    } catch (error) {
      console.error("Error updating counter:", error);
      toast.error("Failed to update counter");

      // Revert optimistic update on error
      await fetchWeeklyData();
    } finally {
      setUpdatingRecords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // Process daily records to be displayed by date
  const getDailyRecords = () => {
    if (
      !weeklyRecords ||
      !weeklyRecords.records ||
      !Array.isArray(weeklyRecords.records)
    )
      return [];

    // Sort days by date to ensure chronological order
    return [...weeklyRecords.records].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/4"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get daily records organized by day
  const dailyRecords = weeklyRecords ? getDailyRecords() : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Weekly Tracker
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                {weekDateRangeDisplay}
              </span>
              {weeklyRecords && (
                <span className="ml-3 text-sm">
                  {weeklyRecords.records.reduce(
                    (sum, day) => sum + (day.records ? day.records.length : 0),
                    0
                  )}{" "}
                  habits
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
          <Button
            onClick={goToPreviousWeek}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            onClick={goToCurrentWeek}
            variant="secondary"
            size="sm"
            className="px-3 py-1"
          >
            Current Week
          </Button>

          <Button
            onClick={goToNextWeek}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Weekly Stats Overview */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-36 w-full max-w-3xl bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      ) : weeklyAnalyticsData ? (
        <div className="mb-8">
          <ErrorBoundary
            fallback={
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Weekly Analytics Unavailable
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      There was a problem displaying the weekly analytics. Basic
                      stats are still available below.
                    </p>
                  </div>
                </div>
              </Card>
            }
          >
            <WeeklyAnalytics analytics={weeklyAnalyticsData} />
          </ErrorBoundary>
        </div>
      ) : (
        weekStats && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            {/* Completion Rate Card */}
            <Card className="md:col-span-4 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Weekly Progress</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <ArrowUp
                      className={`w-5 h-5 ${
                        weekStats.completionTrend === "up"
                          ? "text-green-500"
                          : weekStats.completionTrend === "down"
                          ? "text-red-500 rotate-180"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="relative mb-6 pt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Completion Rate</span>
                    <span className="font-semibold">
                      {Math.round(weekStats.completionRate)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{ width: `${weekStats.completionRate}%` }}
                    ></div>
                  </div>

                  {lastWeekStats && (
                    <>
                      <div className="flex justify-between mt-3 mb-1 text-sm">
                        <span>Last Week</span>
                        <span className="font-semibold">
                          {Math.round(lastWeekStats.completionRate)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden opacity-70">
                        <div
                          className="h-full bg-gray-400 dark:bg-gray-600 rounded-full"
                          style={{ width: `${lastWeekStats.completionRate}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center text-sm">
                  <div
                    className={`flex items-center ${
                      weekStats.completionTrend === "up"
                        ? "text-green-500"
                        : weekStats.completionTrend === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {weekStats.completionTrend === "up" && (
                      <ArrowUp className="w-4 h-4 mr-1" />
                    )}
                    {weekStats.completionTrend === "down" && (
                      <ArrowDown className="w-4 h-4 mr-1" />
                    )}
                    {weekStats.completionTrend === "same" && (
                      <span className="w-4 h-4 mr-1">—</span>
                    )}
                    {lastWeekStats && weekStats.completionTrend && (
                      <span>
                        {Math.abs(
                          Math.round(
                            weekStats.completionRate -
                              lastWeekStats.completionRate
                          )
                        )}
                        %
                        {weekStats.completionTrend === "up"
                          ? " increase"
                          : weekStats.completionTrend === "down"
                          ? " decrease"
                          : " change"}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Day Card */}
            {weekStats.bestDay && (
              <Card className="md:col-span-4 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Most Productive</h3>
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {format(parseISO(weekStats.bestDay.date), "dd")}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {format(parseISO(weekStats.bestDay.date), "EEEE")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(parseISO(weekStats.bestDay.date), "MMMM d")}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Completion Rate</span>
                      <span className="font-semibold">
                        {Math.round(weekStats.bestDay.completionRate)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{
                          width: `${weekStats.bestDay.completionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    to={`/daily/${weekStats.bestDay.date}`}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center mt-3"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            {weekStats.worstDay && (
              <Card className="md:col-span-4 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Needs Attention</h3>
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {format(parseISO(weekStats.worstDay.date), "dd")}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {format(parseISO(weekStats.worstDay.date), "EEEE")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(parseISO(weekStats.worstDay.date), "MMMM d")}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Completion Rate</span>
                      <span className="font-semibold">
                        {Math.round(weekStats.worstDay.completionRate)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                        style={{
                          width: `${weekStats.worstDay.completionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    to={`/daily/${weekStats.worstDay.date}`}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center mt-3"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )
      )}

      {/* Daily Habits Board - Vertical columns for each day */}
      <Card className="shadow-sm hover:shadow-md transition-all mb-6">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Weekly Habit Board</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {weeklyRecords
                ? `${weeklyRecords.records.reduce(
                    (sum, day) =>
                      sum +
                      (day.records
                        ? day.records.filter((r) => r.completed).length
                        : 0),
                    0
                  )} habits completed`
                : ""}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dailyRecords.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {dailyRecords.map((dayRecord) => (
                <DayColumn
                  key={dayRecord.date}
                  date={dayRecord.date}
                  dayRecords={dayRecord.records}
                  onToggleCompletion={handleToggleCompletion}
                  onUpdateCounter={handleUpdateCounter}
                  updatingRecords={updatingRecords}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No habits found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                You don't have any habits scheduled for this week. Start by
                creating some new habits to track your progress.
              </p>
              <Button className="mt-4" onClick={() => navigate("/habits/new")}>
                Create New Habit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Insights */}
      {dailyRecords.length > 0 && weekStats && (
        <Card className="shadow-sm hover:shadow-md transition-all mb-6">
          <CardHeader
            title="Weekly Insights"
            className="border-b border-gray-200 dark:border-gray-700"
          />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-5 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-2">
                      Consistency Patterns
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Based on your habits this week, you tend to be most
                      consistent on
                      {weekStats.bestDay
                        ? ` ${format(
                            parseISO(weekStats.bestDay.date),
                            "EEEE"
                          )}s`
                        : " certain days"}
                      .
                      {weekStats.bestDay && weekStats.worstDay && (
                        <>
                          {" "}
                          The difference between your best and worst day is{" "}
                          {Math.round(
                            Math.abs(
                              weekStats.bestDay.completionRate -
                                weekStats.worstDay.completionRate
                            )
                          )}
                          %.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 p-5 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm">
                    <svg
                      className="w-5 h-5 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-2">
                      Productivity Tip
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Consider scheduling more important habits on
                      {weekStats.bestDay
                        ? ` ${format(parseISO(weekStats.bestDay.date), "EEEE")}`
                        : " your best days"}
                      {weekStats.worstDay
                        ? ` and fewer on ${format(
                            parseISO(weekStats.worstDay.date),
                            "EEEE"
                          )}`
                        : ""}
                      .
                    </p>
                  </div>
                </div>
              </div>

              {weekStats.completionTrend && lastWeekStats && (
                <div
                  className={`md:col-span-2 ${
                    weekStats.completionTrend === "up"
                      ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30"
                      : weekStats.completionTrend === "down"
                      ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
                  } p-5 rounded-xl`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm">
                      {weekStats.completionTrend === "up" && (
                        <ArrowUp className="w-5 h-5 text-green-500" />
                      )}
                      {weekStats.completionTrend === "down" && (
                        <ArrowDown className="w-5 h-5 text-red-500" />
                      )}
                      {weekStats.completionTrend === "same" && (
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-md font-medium mb-2">
                        Weekly Growth
                      </h4>
                      <div className="flex space-x-4 mb-3">
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            This Week
                          </div>
                          <div className="text-2xl font-bold">
                            {Math.round(weekStats.completionRate)}%
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Last Week
                          </div>
                          <div className="text-2xl font-bold">
                            {Math.round(lastWeekStats.completionRate)}%
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Growth
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              weekStats.completionTrend === "up"
                                ? "text-green-500"
                                : weekStats.completionTrend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {weekStats.completionTrend === "same"
                              ? "0%"
                              : `${
                                  weekStats.completionTrend === "up" ? "+" : "-"
                                }${Math.abs(
                                  Math.round(
                                    weekStats.completionRate -
                                      lastWeekStats.completionRate
                                  )
                                )}%`}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {weekStats.completionTrend === "up"
                          ? "You're making great progress! Your habit completion rate has improved since last week."
                          : weekStats.completionTrend === "down"
                          ? "Your completion rate has dropped compared to last week. Consider focusing on consistency."
                          : "You're maintaining a consistent performance compared to last week."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Weekly;
