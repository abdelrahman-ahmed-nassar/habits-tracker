import React, { useEffect, useState } from "react";
import { analyticsService } from "../services/analytics";
import ReactApexChart from "react-apexcharts";
import { format, startOfWeek } from "date-fns";
import { ApexOptions } from "apexcharts";
import QuarterAnalytics from "../components/QuarterAnalytics";

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
  }[];
}

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const analytics = await analyticsService.getOverallAnalytics();
        setDashboardData(analytics);
        console.log(analytics);

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

        console.log(monthlyAnalytics);
        console.log(weeklyAnalytics);
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
              formatter: function (w: any) {
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
    if (!dashboardData) return null;

    const options: ApexOptions = {
      chart: {
        type: "line",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      xaxis: {
        categories: dashboardData.dayOfWeekStats.map((stat) => stat.dayName),
      },
      yaxis: {
        title: {
          text: "Completion Rate",
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return Math.round(val) + "%";
          },
        },
      },
      colors: ["#10B981"],
    };

    const series = [
      {
        name: "Monthly Trend",
        data: dashboardData.dayOfWeekStats.map((stat) =>
          Math.round(stat.successRate * 100)
        ),
      },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={350}
        />
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
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderDailyCompletionChart()}
        {renderHabitProgressChart()}
        {renderMonthlyTrendChart()}
      </div>

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
