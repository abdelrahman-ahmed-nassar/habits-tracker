import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  BarChart,
  Calendar,
  ListChecks,
  TrendingUp,
  FileText,
  Settings,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <BarChart className="w-5 h-5" /> },
    { name: "Daily", path: "/daily", icon: <Calendar className="w-5 h-5" /> },
    {
      name: "Habits",
      path: "/habits",
      icon: <ListChecks className="w-5 h-5" />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    { name: "Notes", path: "/notes", icon: <FileText className="w-5 h-5" /> },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-primary-600">Habits Tracker</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-primary-500 text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border p-4 flex justify-between items-center md:hidden z-10">
        <h1 className="text-xl font-bold text-primary-600">Habits Tracker</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-2 md:hidden z-10">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-2 rounded-md flex flex-col items-center ${
              location.pathname === item.path
                ? "text-primary-500"
                : "text-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 md:ml-64 mt-16 md:mt-0 mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
