import React from "react";
import { useParams } from "react-router-dom";

const AnalyticsPage: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const activeView = view || "overview";

  const analyticsViews = [
    { id: "overview", name: "Overview" },
    { id: "habits", name: "Habits" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center space-x-2">
          {analyticsViews.map((v) => (
            <button
              key={v.id}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeView === v.id
                  ? "bg-primary-500 text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Success Rate</h2>
          <p className="text-muted-foreground">Loading success rates...</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Best Day</h2>
          <p className="text-muted-foreground">Loading best days...</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Longest Streak</h2>
          <p className="text-muted-foreground">Loading streaks...</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
