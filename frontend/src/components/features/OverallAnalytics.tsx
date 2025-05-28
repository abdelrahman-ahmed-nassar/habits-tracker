import React, { useState, useEffect } from "react";
import { Award, Flame, ArrowUp, Calendar, Activity } from "lucide-react";
import { analyticsService } from "../../services/analytics";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { OverallAnalytics as OverallAnalyticsType } from "@shared/types/analytics";
import { toast } from "react-toastify";

const OverallAnalytics: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<OverallAnalyticsType | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getOverallAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p>No analytics data available.</p>
        <Button onClick={onBack} className="mt-4">
          Back to Habits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button onClick={onBack} variant="ghost" size="sm">
          Back
        </Button>
        <h2 className="text-2xl font-bold ml-2">Overall Analytics</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Active Habits</h3>
            <div className="mt-2 flex items-center">
              <Activity className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">
                {analytics.activeHabitsCount}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Completed Today
            </h3>
            <div className="mt-2 flex items-center">
              <Calendar className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {analytics.completedToday}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">
              30-Day Success Rate
            </h3>
            <div className="mt-2 flex items-center">
              <ArrowUp className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">
                {analytics.last30DaysSuccessRate}%
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Longest Streak
            </h3>
            <div className="mt-2 flex items-center">
              <Flame className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">
                {analytics.longestStreakHabit.bestStreak} (
                {analytics.longestStreakHabit.habitName})
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Most Consistent Habits</h3>
          {analytics.mostConsistentHabits.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostConsistentHabits.map((habit) => (
                <div
                  key={habit.habitId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{habit.habitName}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Flame className="w-4 h-4 mr-1 text-orange-500" />
                      <span>Current: {habit.currentStreak}</span>
                      <Award className="w-4 h-4 ml-2 mr-1 text-yellow-500" />
                      <span>Best: {habit.bestStreak}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-green-600">
                      {habit.successRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Daily Performance</h3>
          {analytics.dayOfWeekStats.length > 0 ? (
            <div className="space-y-2">
              {analytics.dayOfWeekStats
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((day) => (
                  <div key={day.dayOfWeek} className="flex items-center">
                    <span className="w-24 font-medium">{day.dayName}</span>
                    <div className="flex-1">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${day.successRate}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span className="w-16 text-right font-medium">
                      {day.successRate}%
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Performance Insights</h3>
        </div>
        <div className="space-y-4">
          {analytics.bestDayOfWeek && (
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">
                  Best Day: {analytics.bestDayOfWeek.dayName}
                </p>
                <p className="text-sm text-gray-600">
                  You complete {analytics.bestDayOfWeek.successRate}% of your
                  habits on this day.
                </p>
              </div>
            </div>
          )}

          {/* Add a button to refresh analytics cache */}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await analyticsService.clearAnalyticsCache();
                  toast.success("Analytics cache cleared successfully");
                  // Refresh data
                  setLoading(true);
                  const data = await analyticsService.getOverallAnalytics();
                  setAnalytics(data);
                  setLoading(false);
                } catch (error) {
                  toast.error("Failed to clear analytics cache");
                  console.error("Error clearing analytics cache:", error);
                }
              }}
            >
              Refresh Analytics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverallAnalytics;
