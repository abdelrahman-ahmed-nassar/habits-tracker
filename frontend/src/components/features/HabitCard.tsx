import React from "react";
import { Check, Target, Flame, TrendingUp } from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Progress from "../ui/Progress";
import CounterInput from "../ui/CounterInput";

interface Record {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
  habitName: string;
  habitTag: string;
  goalType: string;
  goalValue: number;
  value: number;
}

interface HabitCardProps {
  record: Record;
  onToggleCompletion: (habitId: string) => void;
  onValueUpdate?: (habitId: string, value: number) => void;
  isUpdating?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  record,
  onToggleCompletion,
  onValueUpdate,
  isUpdating = false,
}) => {
  const getSuccessRate = () => {
    // This would ideally come from the habit analytics
    // For now, we'll show a mock success rate
    return Math.floor(Math.random() * 41) + 60; // 60-100%
  };

  const getCurrentStreak = () => {
    // This would ideally come from the habit data
    // For now, we'll show a mock streak
    return Math.floor(Math.random() * 20) + 1; // 1-20 days
  };

  const getBestStreak = () => {
    // This would ideally come from the habit data
    // For now, we'll show a mock best streak
    return Math.floor(Math.random() * 50) + 10; // 10-60 days
  };

  const getProgressValue = () => {
    if (record.goalType === "counter") {
      return Math.min((record.value / record.goalValue) * 100, 100);
    }
    return record.completed ? 100 : 0;
  };

  const getProgressDisplay = () => {
    if (record.goalType === "counter") {
      return `${record.value}/${record.goalValue}`;
    }
    return record.completed ? "Completed" : "Not completed";
  };

  const successRate = getSuccessRate();
  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();
  const progressValue = getProgressValue();

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        record.completed ? "ring-2 ring-green-200 dark:ring-green-800" : ""
      }`}
    >
      <CardHeader
        title={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate pr-2">
              {record.habitName}
            </h3>
            <Badge variant={record.completed ? "success" : "default"} size="sm">
              {record.habitTag}
            </Badge>
          </div>
        }
      />

      <CardContent className="space-y-4">
        {/* Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{getProgressDisplay()}</span>
          </div>
          <Progress
            value={progressValue}
            variant={record.completed ? "success" : "default"}
            className="h-2"
          />
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-sm font-medium">{currentStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-medium">{bestStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-sm font-medium">{successRate}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Success
            </div>
          </div>
        </div>
        {/* Goal Type Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="info" size="sm">
            {record.goalType === "streak" ? "Streak Goal" : "Counter Goal"}
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Target: {record.goalValue}{" "}
            {record.goalType === "streak" ? "days" : "times"}
          </span>{" "}
        </div>{" "}
        {/* Completion Controls */}
        {record.goalType === "counter" ? (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Update Count
              </span>
              <CounterInput
                value={record.value}
                goalValue={record.goalValue}
                onValueChange={(value) =>
                  onValueUpdate?.(record.habitId, value)
                }
                disabled={isUpdating}
              />
            </div>
            {record.value >= record.goalValue && (
              <div className="text-center">
                <Badge variant="success" size="sm">
                  Goal Completed! 🎉
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onToggleCompletion(record.habitId)}
            variant={record.completed ? "success" : "primary"}
            className="w-full"
            size="sm"
            disabled={isUpdating}
          >
            <div className="flex items-center justify-center space-x-2">
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : record.completed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 border-2 border-current rounded"></div>
                  <span>Mark Complete</span>
                </>
              )}
            </div>
          </Button>
        )}
        {/* Completion Time */}
        {record.completed && record.completedAt && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Completed at {new Date(record.completedAt).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(HabitCard);
