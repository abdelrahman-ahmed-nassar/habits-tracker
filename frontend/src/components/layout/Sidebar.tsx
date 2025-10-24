import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Home, Calendar, BarChart2, Settings, BookOpen } from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const location = useLocation();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const currentYear = format(new Date(), "yyyy");

  const navigation = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: `/daily/${todayDate}`, icon: Calendar, label: "اليومي" },
    { path: "/weekly", icon: Calendar, label: "الأسبوعي" },
    { path: "/monthly", icon: Calendar, label: "الشهري" },
    { path: `/yearly/${currentYear}`, icon: Calendar, label: "السنوي" },
    { path: "/analytics", icon: BarChart2, label: "التحليلات" },
    { path: "/notes", icon: BookOpen, label: "اليوميات" },
    { path: "/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <aside
      className={
        "h-full w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
      }
    >
      <div className="h-full flex flex-col">
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              // Special handling for Daily route to match any date
              const isActive =
                item.label === "اليومي"
                  ? location.pathname.startsWith("/daily")
                  : item.label === "الأسبوعي"
                  ? location.pathname.startsWith("/weekly")
                  : item.label === "الشهري"
                  ? location.pathname.startsWith("/monthly")
                  : item.label === "السنوي"
                  ? location.pathname.startsWith("/yearly")
                  : location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={isMobile ? onClose : undefined}
                    className={`flex items-center space-x-reverse space-x-2 p-2 rounded transition-colors ${
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
