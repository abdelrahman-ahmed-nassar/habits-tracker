import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Today's Habits</h2>
          <p className="text-muted-foreground">Loading habits...</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Current Streaks</h2>
          <p className="text-muted-foreground">Loading streaks...</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
