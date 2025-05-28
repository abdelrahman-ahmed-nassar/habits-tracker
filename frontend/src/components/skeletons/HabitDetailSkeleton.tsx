import React from "react";

const HabitDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Navigation and title */}
      <div className="flex items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mr-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion history chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
        <div className="overflow-x-auto">
          <div className="flex space-x-1">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mr-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitDetailSkeleton;
