import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  link?: {
    text: string;
    to: string;
  };
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  link,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transform transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
          {icon}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>

        {trend && (
          <div
            className={`flex items-center text-sm mt-1 ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <span
              className={`mr-1 ${trend.isPositive ? "rotate-0" : "rotate-180"}`}
            >
              ↑
            </span>
            <span>
              {trend.value}% {trend.isPositive ? "increase" : "decrease"}
            </span>
          </div>
        )}

        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>

      {link && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <Link
            to={link.to}
            className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {link.text}
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
