import React, { useEffect, useState } from "react";
import { analyticsService } from "../services/analytics";
import ReactApexChart from "react-apexcharts";
import { format, startOfWeek } from "date-fns";
import { ApexOptions } from "apexcharts";
import QuarterAnalytics from "../components/QuarterAnalytics";
import WeeklyAnalytics from "../components/features/WeeklyAnalytics";
import NotesAnalytics from "../components/features/NotesAnalytics";
import { DailyNote } from "@shared/types/note";
import { NotesService } from "../services/notes";

interface DashboardData {
  totalHabits: number;
  completedToday: number;
  activeHabitsCount: number;
  last30DaysSuccessRate: number;
  longestStreakHabit: {
    habitName: string;
    bestStreak: number;
  };
  dayOfWeekStats: {
    dayName: string;
    successRate: number;
  }[];
  mostConsistentHabits: {
    habitName: string;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
    currentCounter: number;
  }[];
}

interface WeeklyAnalytics {
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

interface MonthlyAnalytics {
  year: number;
  month: number;
  monthName: string;
  dailyCompletionCounts: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    count: number;
    totalHabits: number;
    completionRate: number;
  }>;
  monthlyStats: {
    totalHabits: number;
    totalCompletions: number;
    overallCompletionRate: number;
  };
}

interface NotesAnalyticsOverview {
  totalNotes: number;
  dateRange: {
    start: string;
    end: string;
  };
  moodDistribution: Record<string, number>;
  productivityDistribution: Record<string, number>;
  trendsOverTime: Array<{
    date: string;
    noteCount: number;
    avgMoodScore: number;
    avgProductivityScore: number;
  }>;
  insights: string[];
}

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [notesAnalytics, setNotesAnalytics] =
    useState<NotesAnalyticsOverview | null>(null);
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const analytics = await analyticsService.getOverallAnalytics();
        setDashboardData(analytics);

        // Fetch weekly data
        const startDate = startOfWeek(new Date());
        // Format date as YYYY-MM-DD
        const formattedDate = format(startDate, "yyyy-MM-dd");
        const weeklyAnalytics = await analyticsService.getWeeklyAnalytics(
          formattedDate
        );

        const currentDate = new Date();
        const monthlyAnalytics = await analyticsService.getMonthlyAnalytics(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );

        // Fetch notes and notes analytics
        const allNotes = await NotesService.getAllNotes();
        const notesOverview =
          await analyticsService.getNotesAnalyticsOverview();

        setMonthlyData(monthlyAnalytics);
        setWeeklyData(weeklyAnalytics);
        setNotes(allNotes);
        setNotesAnalytics(notesOverview);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getMotivationalMessage = () => {
    if (!dashboardData) return "";
    const completionRate =
      (dashboardData.completedToday / dashboardData.totalHabits) * 100;

    if (completionRate === 100)
      return "Perfect day! Keep up the amazing work! 🎉";
    if (completionRate >= 75)
      return "Great progress! You're doing fantastic! 💪";
    if (completionRate >= 50) return "Good job! Keep pushing forward! 🌟";
    return "Every small step counts! You've got this! 💫";
  };

  const getCompletionPercentage = () => {
    if (!dashboardData) return 0;
    return Math.round(
      (dashboardData.completedToday / dashboardData.totalHabits) * 100
    );
  };

  const getQuarterStartDates = () => {
    const currentYear = new Date().getFullYear();
    return [
      { startDate: `${currentYear}-01-01`, title: "Q1 Analytics" },
      { startDate: `${currentYear}-04-01`, title: "Q2 Analytics" },
      { startDate: `${currentYear}-07-01`, title: "Q3 Analytics" },
      { startDate: `${currentYear}-10-01`, title: "Q4 Analytics" },
    ];
  };

  const renderWeeklyDailyBreakdown = () => {
    if (!weeklyData) return null;

    const options: ApexOptions = {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      colors: ["#3B82F6"],
      xaxis: {
        categories: weeklyData.dailyStats.map((day) => day.dayName),
        labels: {
          style: {
            fontSize: "12px",
            colors: "#6B7280",
          },
        },
      },
      yaxis: {
        title: {
          text: "Completion Rate (%)",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        min: 0,
        max: 100,
        labels: {
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number, { dataPointIndex }) {
            const dayData = weeklyData.dailyStats[dataPointIndex];
            return `${Math.round(val)}% (${dayData.completedHabits}/${
              dayData.totalHabits
            } habits)`;
          },
        },
        x: {
          formatter: function (_val: number, { dataPointIndex }) {
            const dayData = weeklyData.dailyStats[dataPointIndex];
            return `${dayData.dayName} - ${format(
              new Date(dayData.date),
              "MMM dd"
            )}`;
          },
        },
      },
      markers: {
        size: 5,
        colors: ["#3B82F6"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
    };

    const series = [
      {
        name: "Daily Completion Rate",
        data: weeklyData.dailyStats.map((day) =>
          Math.round(day.completionRate)
        ),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          This Week's Daily Performance
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your daily completion rates for the current week (Overall:{" "}
            {Math.round(weeklyData.weeklyStats.overallSuccessRate)}%)
          </p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
    );
  };

  const renderDailyCompletionChart = () => {
    if (!dashboardData) return null;

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: dashboardData.dayOfWeekStats.map((stat) => stat.dayName),
      },
      yaxis: {
        title: {
          text: "Success Rate (%)",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
        },
      },
    };

    const series = [
      {
        name: "Success Rate",
        data: dashboardData.dayOfWeekStats.map((stat) =>
          Math.round(stat.successRate * 100)
        ),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Success Rate by Day
        </h3>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    );
  };

  const renderHabitProgressChart = () => {
    if (!dashboardData) return null;

    const options: ApexOptions = {
      chart: {
        type: "radialBar",
        height: 350,
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: "16px",
              formatter: function (val: number) {
                return Math.round(val) + "%";
              },
            },
            total: {
              show: true,
              label: "Total",
              formatter: function (w: { globals: { seriesTotals: number[] } }) {
                const avg =
                  w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0
                  ) / w.globals.seriesTotals.length;
                return Math.round(avg) + "%";
              },
            },
          },
        },
      },
      labels: dashboardData.mostConsistentHabits.map(
        (habit) => habit.habitName
      ),
    };

    const series = dashboardData.mostConsistentHabits.map((habit) =>
      Math.round(habit.successRate * 100)
    );

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Habit Success Rates</h3>
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={350}
        />
      </div>
    );
  };

  const renderMonthlyTrendChart = () => {
    if (!monthlyData) return null;

    const options: ApexOptions = {
      chart: {
        type: "line",
        height: 350,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      colors: ["#10B981"],
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 3,
      },
      xaxis: {
        categories: monthlyData.dailyCompletionCounts.map((day) =>
          format(new Date(day.date), "MMM dd")
        ),
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: "12px",
            colors: "#6B7280",
          },
        },
      },
      yaxis: {
        title: {
          text: "Completion Rate (%)",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        min: 0,
        max: 100,
        labels: {
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
          style: {
            colors: "#6B7280",
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
        },
        x: {
          formatter: function (_val: number, { dataPointIndex }) {
            const dayData = monthlyData.dailyCompletionCounts[dataPointIndex];
            return `${format(new Date(dayData.date), "EEEE, MMM dd")} - ${
              dayData.count
            }/${dayData.totalHabits} habits completed`;
          },
        },
      },
      markers: {
        size: 4,
        colors: ["#10B981"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: ["#34D399"],
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 100],
        },
      },
    };

    const series = [
      {
        name: "Current Month Completion",
        data: monthlyData.dailyCompletionCounts.map((day) =>
          Math.round((day.completionRate || 0) * 100)
        ),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Current Month Completion Trend ({monthlyData.monthName}{" "}
            {monthlyData.year})
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg:{" "}
            {Math.round(monthlyData.monthlyStats.overallCompletionRate * 100)}%
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your daily habit completion rates throughout the current month
            to identify patterns and maintain consistency.
          </p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={350}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">
              {monthlyData.monthlyStats.totalCompletions}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Total Completions
            </span>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="block text-lg font-bold text-green-600 dark:text-green-400">
              {monthlyData.dailyCompletionCounts.length}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Days Tracked
            </span>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="block text-lg font-bold text-purple-600 dark:text-purple-400">
              {Math.round(monthlyData.monthlyStats.overallCompletionRate * 100)}
              %
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Monthly Average
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyHabitsPerformance = () => {
    if (!weeklyData || !weeklyData.habitStats) return null;

    // Get top 8 habits by success rate for display
    const topHabits = weeklyData.habitStats
      .filter((habit) => habit.activeDaysCount > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 8);

    if (topHabits.length === 0) return null;

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 400,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          dataLabels: {
            position: "center",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return Math.round(val) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
      colors: ["#10B981"],
      xaxis: {
        min: 0,
        max: 100,
        labels: {
          formatter: function (val: string) {
            return val + "%";
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number, { dataPointIndex }) {
            const habit = topHabits[dataPointIndex];
            return `${Math.round(val)}% (${habit.completedDaysCount}/${
              habit.activeDaysCount
            } days)`;
          },
        },
        x: {
          formatter: function (_val: number, { dataPointIndex }) {
            const habit = topHabits[dataPointIndex];
            return habit.habitName;
          },
        },
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 3,
      },
    };

    const series = [
      {
        name: "Success Rate",
        data: topHabits.map((habit) => ({
          x:
            habit.habitName.length > 25
              ? habit.habitName.substring(0, 25) + "..."
              : habit.habitName,
          y: Math.round(habit.successRate * 100),
        })),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Weekly Habits Performance
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Top performing habits this week by success rate
          </p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={400}
        />
      </div>
    );
  };

  const renderMostConsistentHabits = () => {
    if (!dashboardData || !dashboardData.mostConsistentHabits.length)
      return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Most Consistent Habits</h3>
        <div className="space-y-4">
          {dashboardData.mostConsistentHabits
            .slice(0, 5)
            .map((habit, index) => (
              <div
                key={habit.habitName}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {habit.habitName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(habit.successRate * 100)}% success rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <span className="block text-orange-500 font-medium">
                        {habit.currentStreak}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Current
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-blue-500 font-medium">
                        {habit.bestStreak}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Best
                      </span>
                    </div>
                    {habit.currentCounter > 0 && (
                      <div className="text-center">
                        <span className="block text-green-500 font-medium">
                          {habit.currentCounter}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Counter
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderNotesAnalyticsOverview = () => {
    if (!notesAnalytics) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📝 Notes Analytics Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {notesAnalytics.totalNotes || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Total Notes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {notesAnalytics.moodDistribution
                ? Object.keys(notesAnalytics.moodDistribution).length
                : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Mood Types
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {notesAnalytics.productivityDistribution
                ? Object.keys(notesAnalytics.productivityDistribution).length
                : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Productivity Levels
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round((notesAnalytics.totalNotes || 0) / 30)}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Notes/Month Avg
            </div>
          </div>
        </div>

        {notesAnalytics.insights && notesAnalytics.insights.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
              📊 Key Insights
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {notesAnalytics.insights.slice(0, 3).map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
        Dashboard{" "}
        <span role="img" aria-label="chart">
          📊
        </span>
      </h1>
      <div className="mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg px-4 py-3 flex items-center gap-3 shadow">
          <span role="img" aria-label="motivation" className="text-2xl">
            🚀
          </span>
          <span className="font-medium">{getMotivationalMessage()}</span>
        </div>
      </div>

      {/* Quick Analytics Overview */}
      {weeklyData && monthlyData && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            📈 Analytics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(weeklyData.weeklyStats.overallSuccessRate)}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Weekly Success
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {weeklyData.weeklyStats.totalCompletions} completions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(
                  monthlyData.monthlyStats.overallCompletionRate * 100
                )}
                %
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Monthly Average
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {monthlyData.monthlyStats.totalCompletions} total
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((dashboardData?.last30DaysSuccessRate || 0) * 100)}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                30-Day Trend
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Overall performance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {dashboardData?.longestStreakHabit.bestStreak || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Best Streak
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dashboardData?.longestStreakHabit.habitName || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center">
          <span className="text-3xl mb-2" role="img" aria-label="habits">
            📋
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Habits
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData?.totalHabits}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center">
          <span className="text-3xl mb-2" role="img" aria-label="check">
            ✅
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completed Today
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData?.completedToday}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getCompletionPercentage()}%
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center">
          <span className="text-3xl mb-2" role="img" aria-label="star">
            ⭐
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Success Rate (30 Days)
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round((dashboardData?.last30DaysSuccessRate || 0) * 100)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center">
          <span className="text-3xl mb-2" role="img" aria-label="fire">
            🔥
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Best Streak
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData?.longestStreakHabit.bestStreak} days
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            {dashboardData?.longestStreakHabit.habitName}
          </p>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      {weeklyData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">This Week</h3>
                <p className="text-2xl font-bold">
                  {Math.round(weeklyData.weeklyStats.overallSuccessRate)}%
                </p>
                <p className="text-xs opacity-80">Overall Success</p>
              </div>
              <span className="text-3xl opacity-80">📊</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Completions</h3>
                <p className="text-2xl font-bold">
                  {weeklyData.weeklyStats.totalCompletions}
                </p>
                <p className="text-xs opacity-80">This Week</p>
              </div>
              <span className="text-3xl opacity-80">✅</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Best Day</h3>
                <p className="text-xl font-bold">
                  {weeklyData.weeklyStats.mostProductiveDay?.dayName || "N/A"}
                </p>
                <p className="text-xs opacity-80">
                  {weeklyData.weeklyStats.mostProductiveDay?.completionRate ||
                    0}
                  % completion
                </p>
              </div>
              <span className="text-3xl opacity-80">🌟</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Top Habit</h3>
                <p className="text-sm font-bold">
                  {weeklyData.weeklyStats.mostProductiveHabit?.habitName?.substring(
                    0,
                    12
                  ) +
                    (weeklyData.weeklyStats.mostProductiveHabit?.habitName
                      ?.length > 12
                      ? "..."
                      : "") || "N/A"}
                </p>
                <p className="text-xs opacity-80">
                  {Math.round(
                    (weeklyData.weeklyStats.mostProductiveHabit?.successRate ||
                      0) * 100
                  )}
                  % success
                </p>
              </div>
              <span className="text-3xl opacity-80">🏆</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Analytics Section */}
      {weeklyData && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Current Week Analytics
          </h2>
          <WeeklyAnalytics analytics={weeklyData} />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {renderWeeklyDailyBreakdown()}
        {renderWeeklyHabitsPerformance()}
        {renderDailyCompletionChart()}
        {renderHabitProgressChart()}
        {renderMonthlyTrendChart()}
        {renderMostConsistentHabits()}
      </div>

      {/* Notes Analytics Section */}
      {(notesAnalytics || notes.length > 0) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            📝 Notes & Mood Analytics
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {notesAnalytics && renderNotesAnalyticsOverview()}
            {notes.length > 0 && (
              <div>
                <NotesAnalytics notes={notes} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {getQuarterStartDates().map((quarter, index) => (
          <QuarterAnalytics
            key={index}
            startDate={quarter.startDate}
            title={quarter.title}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
