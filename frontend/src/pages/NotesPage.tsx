import React from "react";
import { useParams } from "react-router-dom";

const NotesPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const displayDate = date || new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex items-center space-x-2">
          <span className="font-medium">{displayDate}</span>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Notes for {displayDate}</h2>
        <div className="min-h-[200px]">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
        <p className="text-muted-foreground">Loading recent notes...</p>
      </div>
    </div>
  );
};

export default NotesPage;
