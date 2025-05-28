import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  TrendingUp,
  Calendar,
  BookOpen,
  Heart,
  Zap,
  Target,
  Award,
  Activity,
  Clock,
  Filter,
  Download,
  LineChart as LineChartIcon,
} from "lucide-react";
import { DailyNote } from "@shared/types/note";
import { NotesService } from "../../services/notes";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";

interface NotesAnalyticsProps {
  notes: DailyNote[];
}

interface AnalyticsData {
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
  monthlyMoodScores?: Record<
    string,
    { avg: number; count: number; sum?: number }
  >;
  monthlyProductivityScores?: Record<
    string,
    { avg: number; count: number; sum?: number }
  >;
  completionRate: {
    mood: number;
    productivity: number;
  };
}

interface MoodTrendsData {
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
}

interface ProductivityCorrelationData {
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
}

const NotesAnalytics: React.FC<NotesAnalyticsProps> = ({ notes }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [moodTrends, setMoodTrends] = useState<MoodTrendsData | null>(null);
  const [productivityCorrelation, setProductivityCorrelation] =
    useState<ProductivityCorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch analytics data function - moved before useEffect to fix initialization order
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [analytics, trends, correlation] = await Promise.all([
        NotesService.getNotesAnalytics(),
        NotesService.getMoodTrends(
          dateRange.start || undefined,
          dateRange.end || undefined
        ),
        NotesService.getProductivityCorrelation(),
      ]);

      setAnalyticsData(analytics);
      setMoodTrends(trends);
      setProductivityCorrelation(correlation);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Create mood trends chart data
  const moodTrendChartData = useMemo(() => {
    if (!moodTrends?.trends) return null;

    const sortedTrends = [...moodTrends.trends].sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return {
      options: {
        chart: {
          id: "mood-trends-chart",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
          },
        },
        xaxis: {
          categories: sortedTrends.map((trend) =>
            format(parseISO(trend.month + "-01"), "MMM yyyy")
          ),
        },
        yaxis: {
          title: {
            text: "Average Mood Score",
          },
          min: 0,
          max: 10,
        },
        colors: ["#10B981"], // Green color
        stroke: {
          width: 3,
          curve: "smooth" as const,
        },
        markers: {
          size: 5,
        },
        tooltip: {
          y: {
            formatter: (value: number) => `${value.toFixed(1)} / 10`,
          },
        },
      },
      series: [
        {
          name: "Average Mood",
          data: sortedTrends.map((trend) => trend.averageMood),
        },
      ],
    };
  }, [moodTrends]);
  // Create productivity trends chart data using monthly productivity data
  const productivityTrendChartData = useMemo(() => {
    if (!analyticsData?.monthlyProductivityScores) return null;

    const months = Object.keys(analyticsData.monthlyProductivityScores).sort(
      (a, b) => a.localeCompare(b)
    );

    const productivityValues = months.map((month) => {
      const monthData = analyticsData.monthlyProductivityScores?.[month];
      return monthData ? monthData.avg : 0;
    });

    return {
      options: {
        chart: {
          id: "productivity-trends-chart",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
          },
        },
        xaxis: {
          categories: months.map((month) =>
            format(parseISO(month + "-01"), "MMM yyyy")
          ),
        },
        yaxis: {
          title: {
            text: "Average Productivity Score",
          },
          min: 0,
          max: 10,
        },
        colors: ["#6366F1"], // Indigo color
        stroke: {
          width: 3,
          curve: "smooth" as const,
        },
        markers: {
          size: 5,
        },
        tooltip: {
          y: {
            formatter: (value: number) => `${value.toFixed(1)} / 10`,
          },
        },
      },
      series: [
        {
          name: "Average Productivity",
          data: productivityValues,
        },
      ],
    };
  }, [analyticsData?.monthlyProductivityScores]);

  // Create productivity correlation chart data for habits impact
  const productivityCorrelationChartData = useMemo(() => {
    if (
      !productivityCorrelation?.correlations ||
      productivityCorrelation.correlations.length === 0
    )
      return null;

    const sortedCorrelations = [...productivityCorrelation.correlations]
      .filter((c) => c.productivityImpact !== null)
      .sort((a, b) => (b.productivityImpact || 0) - (a.productivityImpact || 0))
      .slice(0, 10); // Take top 10 habits by impact

    return {
      options: {
        chart: {
          id: "productivity-correlation-chart",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
          },
        },
        xaxis: {
          categories: sortedCorrelations.map((c) => c.habitName),
          labels: {
            rotate: -45,
            trim: true,
            maxHeight: 120,
          },
        },
        yaxis: {
          title: {
            text: "Productivity Impact",
          },
        },
        colors: ["#6366F1"], // Indigo color
        dataLabels: {
          enabled: true,
          formatter: (value: number) => value.toFixed(1),
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          },
        },
      },
      series: [
        {
          name: "Productivity Impact",
          data: sortedCorrelations.map((c) => c.productivityImpact || 0),
        },
      ],
    };
  }, [productivityCorrelation]);

  const handleDateRangeChange = async () => {
    if (dateRange.start && dateRange.end) {
      try {
        const trends = await NotesService.getMoodTrends(
          dateRange.start,
          dateRange.end
        );
        setMoodTrends(trends);
      } catch (error) {
        console.error("Error fetching filtered mood trends:", error);
        toast.error("Failed to filter mood trends");
      }
    }
  };

  // Calculate local analytics from notes prop
  const localAnalytics = useMemo(() => {
    if (notes.length === 0) return null;

    const totalNotes = notes.length;
    const notesWithMood = notes.filter((n) => n.mood).length;
    const notesWithProductivity = notes.filter(
      (n) => n.productivityLevel
    ).length;

    const avgContentLength = Math.round(
      notes.reduce((sum, note) => sum + note.content.length, 0) / totalNotes
    );

    // Calculate writing frequency by month
    const monthlyFrequency: Record<string, number> = {};
    notes.forEach((note) => {
      const monthKey = note.date.substring(0, 7); // YYYY-MM
      monthlyFrequency[monthKey] = (monthlyFrequency[monthKey] || 0) + 1;
    });

    // Calculate current streak
    const sortedDates = notes
      .map((n) => n.date)
      .sort()
      .reverse();
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalNotes,
      notesWithMood,
      notesWithProductivity,
      avgContentLength,
      monthlyFrequency,
      currentStreak,
      completionRate: {
        mood:
          totalNotes > 0 ? Math.round((notesWithMood / totalNotes) * 100) : 0,
        productivity:
          totalNotes > 0
            ? Math.round((notesWithProductivity / totalNotes) * 100)
            : 0,
      },
    };
  }, [notes]);

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      "😊": "😊",
      "😢": "😢",
      "😡": "😡",
      "😰": "😰",
      "😴": "😴",
      "🤗": "🤗",
      "😎": "😎",
      "🤔": "🤔",
      "😔": "😔",
      "😌": "😌",
      Happy: "😊",
      Sad: "😢",
      Angry: "😡",
      Anxious: "😰",
      Tired: "😴",
      Excited: "🤗",
      Confident: "😎",
      Thoughtful: "🤔",
      Melancholy: "😔",
      Peaceful: "😌",
    };
    return moodEmojis[mood] || mood;
  };

  const getProductivityColor = (level: string) => {
    const colors: Record<string, string> = {
      High: "text-green-600 dark:text-green-400",
      Medium: "text-yellow-600 dark:text-yellow-400",
      Low: "text-red-600 dark:text-red-400",
    };
    return colors[level] || "text-gray-600 dark:text-gray-400";
  };

  const exportAnalytics = () => {
    const data = {
      analytics: analyticsData,
      moodTrends,
      productivityCorrelation,
      localAnalytics,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Analytics data exported successfully");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics & Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover patterns in your writing habits and emotional journey
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportAnalytics}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </Button>
      </div>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {localAnalytics?.totalNotes || analyticsData?.totalNotes || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Notes
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {localAnalytics?.currentStreak ||
                analyticsData?.longestStreak ||
                0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {localAnalytics ? "Current" : "Longest"} Streak
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {localAnalytics?.avgContentLength ||
                analyticsData?.avgContentLength ||
                0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg. Length
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {localAnalytics?.completionRate.mood ||
                analyticsData?.completionRate.mood ||
                0}
              %
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              With Mood
            </div>
          </div>
        </Card>
      </div>
      {/* Mood Distribution */}
      {analyticsData?.moodDistribution &&
        Object.keys(analyticsData.moodDistribution).length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Mood Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(analyticsData.moodDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className="text-center">
                      <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {mood}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}
      {/* Productivity Distribution */}
      {analyticsData?.productivityDistribution &&
        Object.keys(analyticsData.productivityDistribution).length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Productivity Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analyticsData.productivityDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([level, count]) => (
                    <div
                      key={level}
                      className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <Zap
                        className={`w-6 h-6 mx-auto mb-2 ${getProductivityColor(
                          level
                        )}`}
                      />
                      <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {level} Productivity
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}
      {/* Monthly Writing Frequency */}
      {analyticsData?.monthlyFrequency &&
        Object.keys(analyticsData.monthlyFrequency).length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Monthly Writing Frequency
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(analyticsData.monthlyFrequency)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 12)
                  .map(([month, count]) => (
                    <div key={month} className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format(parseISO(`${month}-01`), "MMM yyyy")}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}{" "}
      {/* Mood Trends */}
      {moodTrends && moodTrends.trends && moodTrends.trends.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Mood Trends Over Time
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  to
                </span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                />
                <Button size="sm" onClick={handleDateRangeChange}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Line Chart for Mood Trends */}
            {moodTrendChartData && (
              <div className="mt-4">
                <Chart
                  options={moodTrendChartData.options}
                  series={moodTrendChartData.series}
                  type="line"
                  height={300}
                />
              </div>
            )}

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              Based on{" "}
              {moodTrends.trends.reduce((sum, trend) => sum + trend.count, 0)}{" "}
              notes with mood data
            </div>
          </div>
        </Card>
      )}{" "}
      {/* Productivity Trends */}
      {analyticsData?.monthlyProductivityScores &&
        Object.keys(analyticsData.monthlyProductivityScores).length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <LineChartIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Productivity Trends Over Time
              </h3>

              {/* Line Chart for Productivity Trends */}
              {productivityTrendChartData && (
                <div className="mt-4">
                  <Chart
                    options={productivityTrendChartData.options}
                    series={productivityTrendChartData.series}
                    type="line"
                    height={300}
                  />
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Based on{" "}
                {Object.values(analyticsData.monthlyProductivityScores).reduce(
                  (sum, data) => sum + data.count,
                  0
                )}{" "}
                notes with productivity data
              </div>
            </div>
          </Card>
        )}{" "}
      {/* Productivity Correlation */}
      {productivityCorrelation &&
        productivityCorrelation.correlations &&
        productivityCorrelation.correlations.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                Productivity & Habit Correlation
              </h3>

              {/* Bar Chart for Productivity Correlation */}
              {productivityCorrelationChartData && (
                <div className="mt-4">
                  <Chart
                    options={productivityCorrelationChartData.options}
                    series={productivityCorrelationChartData.series}
                    type="bar"
                    height={350}
                  />
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Shows how habit completion affects your productivity levels
              </div>
            </div>
          </Card>
        )}
      {/* Insights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-500" />
            Key Insights
          </h3>
          <div className="space-y-3">
            {analyticsData && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You've written <strong>{analyticsData.totalNotes}</strong>{" "}
                    notes with an average length of{" "}
                    <strong>{analyticsData.avgContentLength}</strong>{" "}
                    characters.
                  </p>
                </div>
                {analyticsData.longestStreak > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your longest writing streak was{" "}
                      <strong>{analyticsData.longestStreak}</strong> consecutive
                      days.
                    </p>
                  </div>
                )}
                {analyticsData.completionRate.mood > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      You track your mood in{" "}
                      <strong>{analyticsData.completionRate.mood}%</strong> of
                      your notes.
                    </p>
                  </div>
                )}{" "}
                {analyticsData.completionRate.productivity > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      You track productivity in{" "}
                      <strong>
                        {analyticsData.completionRate.productivity}%
                      </strong>{" "}
                      of your notes.
                    </p>
                  </div>
                )}
                {analyticsData.avgMoodValue !== null && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your average mood score is{" "}
                      <strong>
                        {analyticsData.avgMoodValue.toFixed(1)}/10
                      </strong>
                      .
                    </p>
                  </div>
                )}
                {analyticsData.avgProductivityValue !== null && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your average productivity score is{" "}
                      <strong>
                        {analyticsData.avgProductivityValue.toFixed(1)}
                      </strong>
                      .
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotesAnalytics;
