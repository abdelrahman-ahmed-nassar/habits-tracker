import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Home, Calendar, BarChart2, Settings, BookOpen } from "lucide-react";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/daily"
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Calendar className="w-5 h-5" />
                <span>Daily</span>
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart2 className="w-5 h-5" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                to="/notes"
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BookOpen className="w-5 h-5" />
                <span>Notes</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
