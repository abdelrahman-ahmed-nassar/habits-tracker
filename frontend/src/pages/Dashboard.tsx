import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  ArrowRightIcon,
  PlusIcon,
  TrendingUpIcon,
  AwardIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { useHabits } from "@/hooks/useHabits";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { Habit, HabitCompletion } from "@/types";

const Dashboard = () => {
  const [date] = useState<string>(getTodayString());
  const [greeting, setGreeting] = useState<string>("");
  const { habits, isLoading: habitsLoading } = useHabits();
  const { completions, isLoading: completionsLoading } =
    useHabitCompletions(date);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    completionRate: 0,
    streak: 0,
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Calculate stats when habits or completions change
  useEffect(() => {
    // Skip if data is still loading or no habits data
    if (habitsLoading || completionsLoading || !habits || !habits.length)
      return;

    // Skip unnecessary recalculations
    if (
      habits.length === stats.totalHabits &&
      stats.completionRate > 0 &&
      completions &&
      completions.filter((c: HabitCompletion) => c.completed).length ===
        stats.completedToday
    ) {
      return;
    }

    const totalHabits = habits.length;
    const dailyHabits = habits.filter((habit: Habit) => {
      const today = new Date().getDay() || 7; // Convert Sunday from 0 to 7
      return (
        habit.frequency &&
        Array.isArray(habit.frequency) &&
        habit.frequency.includes(today)
      );
    });

    const completedToday =
      completions?.filter((c: HabitCompletion) => c.completed).length || 0;
    const completionRate =
      dailyHabits.length > 0
        ? Math.round((completedToday / dailyHabits.length) * 100)
        : 0;

    // For now, we'll just use a placeholder value for streak
    const streak = 3;

    setStats({
      totalHabits,
      completedToday,
      completionRate,
      streak,
    });
  }, [
    habits,
    completions,
    habitsLoading,
    completionsLoading,
    stats.totalHabits,
    stats.completionRate,
    stats.completedToday,
  ]);

  // Today's habits that should be displayed on dashboard
  const todaysHabits =
    habits
      ?.filter((habit: Habit) => {
        if (!habit || !habit.frequency || !Array.isArray(habit.frequency)) {
          return false;
        }
        const today = new Date().getDay() || 7; // Convert Sunday from 0 to 7
        return habit.frequency.includes(today);
      })
      .slice(0, 5) || [];

  const isLoading = habitsLoading || completionsLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{greeting}!</h1>
        <div className="flex items-center text-muted-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <time dateTime={date}>{formatDateForDisplay(date)}</time>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Habits"
          value={stats.totalHabits}
          description="Total habits tracked"
          icon={<CheckCircleIcon className="h-5 w-5 text-blue-500" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          description="Habits completed today"
          icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Today's progress"
          icon={<TrendingUpIcon className="h-5 w-5 text-yellow-500" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Current Streak"
          value={stats.streak}
          description="Days in a row"
          icon={<AwardIcon className="h-5 w-5 text-purple-500" />}
          isLoading={isLoading}
        />
      </section>

      {/* Today's Habits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Habits</CardTitle>
            <CardDescription>Your scheduled habits for today</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/daily">
              View All <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center justify-between"
                  >
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
            </div>
          ) : todaysHabits.length > 0 ? (
            <div className="space-y-4">
              {todaysHabits.map((habit: Habit) => {
                const isCompleted =
                  completions?.some(
                    (c: HabitCompletion) =>
                      c.habitId === habit.id && c.completed
                  ) || false;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-3 w-3 rounded-full mr-3 ${
                          habit.color ? habit.color : "bg-primary"
                        }`}
                      />
                      <span
                        className={
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {habit.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm ${isCompleted ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No habits scheduled for today</p>
              <Button asChild className="mt-4" variant="secondary">
                <Link to="/habits">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add a new habit
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          title="Add New Habit"
          description="Create a new habit to track"
          icon={<PlusIcon className="h-5 w-5" />}
          to="/habits"
        />
        <ActionCard
          title="View Analytics"
          description="See your progress and stats"
          icon={<TrendingUpIcon className="h-5 w-5" />}
          to="/analytics"
        />
        <ActionCard
          title="Daily Review"
          description="Check today's habits"
          icon={<CalendarIcon className="h-5 w-5" />}
          to="/daily"
        />
      </section>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>
            Your habit completion rate for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Weekly progress</span>
              <span className="text-sm font-medium">
                {stats.completionRate}%
              </span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  isLoading,
}: StatsCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          {isLoading ? (
            <div className="mt-1 h-7 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        </div>
        <div className="p-2 bg-background rounded-full border border-border">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ActionCard = ({ title, description, icon, to }: ActionCardProps) => (
  <Card className="hover:shadow-md transition-all">
    <CardContent className="p-0">
      <Link to={to} className="block p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 text-primary rounded-full">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Link>
    </CardContent>
  </Card>
);

export default Dashboard;
