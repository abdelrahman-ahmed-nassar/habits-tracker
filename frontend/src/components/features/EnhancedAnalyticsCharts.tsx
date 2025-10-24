import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Card from "../ui/Card";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";

interface EnhancedHabitAnalytics {
  habitId: string;
  habitName: string;
  period: {
    startDate: string;
    endDate: string;
    description: string;
  };
  basicStats: {
    totalDays: number;
    completedDays: number;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
  };
  counterStats: {
    totalValue: number;
    goalValue: number;
    progress: number;
    completions: Array<{
      date: string;
      value: number;
    }>;
  } | null;
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    totalDays: number;
    completedDays: number;
    successRate: number;
    dayName: string;
  }>;
  bestDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  worstDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  topStreaks: Array<{
    startDate: string;
    endDate: string;
    length: number;
  }>;
  monthlyTrends: Array<{
    month: number;
    successRate: number;
    completions: number;
    monthName: string;
  }>;
}

interface EnhancedAnalyticsChartsProps {
  analytics: EnhancedHabitAnalytics;
}

const EnhancedAnalyticsCharts: React.FC<EnhancedAnalyticsChartsProps> = ({
  analytics,
}) => {
  // Day of Week Performance Chart
  const dayOfWeekChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
        colors: {
          ranges: [
            {
              from: 0,
              to: 25,
              color: "#ef4444",
            },
            {
              from: 26,
              to: 50,
              color: "#f97316",
            },
            {
              from: 51,
              to: 75,
              color: "#eab308",
            },
            {
              from: 76,
              to: 100,
              color: "#22c55e",
            },
          ],
        },
      },
    },
    xaxis: {
      categories: analytics.dayOfWeekStats.map((day) => day.dayName),
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "معدل النجاح (%)",
      },
      max: 100,
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
    },
    colors: ["#3b82f6"],
  };

  const dayOfWeekSeries = [
    {
      name: "معدل النجاح",
      data: analytics.dayOfWeekStats.map((day) => day.successRate * 100),
    },
  ];

  // Monthly Trends Chart
  const monthlyTrendsOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: analytics.monthlyTrends.map((trend) => trend.monthName),
    },
    yaxis: [
      {
        title: {
          text: "معدل النجاح (%)",
          style: {
            color: "#3b82f6",
          },
        },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
          style: {
            colors: "#3b82f6",
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "الإنجازات",
          style: {
            color: "#10b981",
          },
        },
        labels: {
          style: {
            colors: "#10b981",
          },
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e5e7eb",
    },
    colors: ["#3b82f6", "#10b981"],
    legend: {
      position: "top",
    },
  };

  const monthlyTrendsSeries = [
    {
      name: "معدل النجاح (%)",
      type: "line" as const,
      data: analytics.monthlyTrends.map((trend) => trend.successRate * 100),
    },
    {
      name: "إجمالي الإنجازات",
      type: "column" as const,
      yAxisIndex: 1,
      data: analytics.monthlyTrends.map((trend) => trend.completions),
    },
  ];

  // Streak Performance Chart (Top Streaks)
  const streakChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 250,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        barHeight: "60%",
      },
    },
    xaxis: {
      title: {
        text: "طول السلسلة (أيام)",
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number, index?: number) => {
          const streak = analytics.topStreaks[index || 0];
          if (streak) {
            return `${new Date(
              streak.startDate
            ).toLocaleDateString()} - ${new Date(
              streak.endDate
            ).toLocaleDateString()}`;
          }
          return val.toString();
        },
      },
    },
    dataLabels: {
      enabled: true,
    },
    colors: ["#8b5cf6"],
    grid: {
      borderColor: "#e5e7eb",
    },
  };

  const streakSeries = [
    {
      name: "طول السلسلة",
      data: analytics.topStreaks.map((streak) => streak.length),
    },
  ];

  // Counter Progress Chart (if applicable)
  const counterProgressOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 300,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%",
        },
        dataLabels: {
          name: {
            fontSize: "16px",
          },
          value: {
            fontSize: "20px",
            formatter: (val: number) => {
              if (analytics.counterStats) {
                return `${analytics.counterStats.totalValue}/${analytics.counterStats.goalValue}`;
              }
              return `${val}%`;
            },
          },
        },
      },
    },
    colors: ["#06b6d4"],
    labels: ["تقدم الهدف"],
  };

  const counterSeries = analytics.counterStats
    ? [Math.round(analytics.counterStats.progress * 100)]
    : [];

  return (
    <div className="space-y-6">
      {/* Day of Week Performance */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">نمط الأداء الأسبوعي</h3>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            معدل نجاحك عبر أيام الأسبوع المختلفة
          </p>
          {analytics.bestDay && analytics.worstDay && (
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                الأفضل: {analytics.bestDay.dayName}
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-4 h-4" />
                الأسوأ: {analytics.worstDay.dayName}
              </div>
            </div>
          )}
        </div>
        <ReactApexChart
          options={dayOfWeekChartOptions}
          series={dayOfWeekSeries}
          type="bar"
          height={300}
        />
      </Card>

      {/* Monthly Trends */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">الاتجاهات الشهرية</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          تتبع ثبات عادتك وعدد الإنجازات على مدار الأشهر
        </p>
        <ReactApexChart
          options={monthlyTrendsOptions}
          series={monthlyTrendsSeries}
          type="line"
          height={350}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Streaks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">أفضل السلاسل</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            أطول فترات الإنجاز المتتالية
          </p>
          {analytics.topStreaks.length > 0 ? (
            <ReactApexChart
              options={streakChartOptions}
              series={streakSeries}
              type="bar"
              height={250}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              لم يتم تسجيل سلاسل بعد
            </div>
          )}
        </Card>

        {/* Counter Progress (if applicable) */}
        {analytics.counterStats && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تقدم الهدف</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              التقدم نحو هدف العداد الخاص بك
            </p>
            <ReactApexChart
              options={counterProgressOptions}
              series={counterSeries}
              type="radialBar"
              height={300}
            />
            <div className="text-center mt-4">
              <div className="text-2xl font-bold">
                {analytics.counterStats.totalValue} /{" "}
                {analytics.counterStats.goalValue}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {(analytics.counterStats.progress * 100).toFixed(1)}% مكتمل
              </div>
            </div>
          </Card>
        )}

        {/* Summary Stats (if no counter stats) */}
        {!analytics.counterStats && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">إحصائيات ملخصة</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  إجمالي الأيام المتعقبة:
                </span>
                <span className="font-semibold">
                  {analytics.basicStats.totalDays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  الأيام المكتملة:
                </span>
                <span className="font-semibold text-green-600">
                  {analytics.basicStats.completedDays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  معدل النجاح الإجمالي:
                </span>
                <span className="font-semibold text-blue-600">
                  {(analytics.basicStats.successRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  السلسلة الحالية:
                </span>
                <span className="font-semibold text-orange-600">
                  {analytics.basicStats.currentStreak} يوم
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  أفضل سلسلة:
                </span>
                <span className="font-semibold text-purple-600">
                  {analytics.basicStats.bestStreak} يوم
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedAnalyticsCharts;
