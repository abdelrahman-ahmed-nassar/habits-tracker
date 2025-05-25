import React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showValue?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size = "md",
      variant = "default",
      showValue = false,
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizes = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    const variants = {
      default: "bg-blue-600 dark:bg-blue-500",
      success: "bg-green-600 dark:bg-green-500",
      warning: "bg-yellow-600 dark:bg-yellow-500",
      error: "bg-red-600 dark:bg-red-500",
    };

    return (
      <div className={cn("w-full", className)} {...props}>
        <div className="relative">
          <div
            ref={ref}
            className={cn(
              "w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
              sizes[size]
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-in-out",
                variants[variant],
                animated && "animate-pulse"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {showValue && (
            <div className="absolute right-0 top-0 -mt-6 text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export default Progress;
