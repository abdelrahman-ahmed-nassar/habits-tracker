import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  BarChart2,
  Settings,
  BookOpen,
  Flame,
} from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const location = useLocation();

  const navigation = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/daily", icon: Calendar, label: "Daily" },
    { path: "/weekly", icon: Calendar, label: "Weekly" },
    { path: "/monthly", icon: Calendar, label: "Monthly" },
    { path: "/analytics", icon: BarChart2, label: "Analytics" },
    { path: "/streaks", icon: Flame, label: "Streaks" },
    { path: "/notes", icon: BookOpen, label: "Notes" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];


  return (
    <aside
      className={
        "h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
      }
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Navigation</h2>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={isMobile ? onClose : undefined}
                    className={`flex items-center space-x-2 p-2 rounded transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        </div>
    </aside>
  );
};

export default Sidebar;
