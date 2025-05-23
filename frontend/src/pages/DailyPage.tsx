import React from 'react';
import { useParams } from 'react-router-dom';

const DailyPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const displayDate = date || new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Habits</h1>
        <div className="flex items-center space-x-2">
          <span className="font-medium">{displayDate}</span>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Habits for {displayDate}</h2>
        <p className="text-muted-foreground">Loading habits...</p>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Daily Notes</h2>
        <p className="text-muted-foreground">No notes for today.</p>
      </div>
    </div>
  );
};

export default DailyPage; 