import React from "react";
import { useParams } from "react-router-dom";

const HabitsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {id ? "Edit Habit" : "All Habits"}
        </h1>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors">
          {id ? "Update Habit" : "Create Habit"}
        </button>
      </div>

      {id ? (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Habit Details</h2>
          <p className="text-muted-foreground">Loading habit {id}...</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">All Habits</h2>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
