import { Menu } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { format } from "date-fns";
import { getArabicDayName, getArabicMonthName } from "../../utils/dateUtils";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const now = new Date();
  const dayNameEnglish = format(now, "EEEE");
  const monthNameEnglish = format(now, "MMMM");
  const dayNumber = format(now, "d");
  const year = format(now, "yyyy");

  const dayName = getArabicDayName(dayNameEnglish);
  const monthName = getArabicMonthName(monthNameEnglish);

  const currentDate = `${dayName}، ${dayNumber} ${monthName} ${year}`;

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full px-4 flex items-center justify-between lg:justify-between">
        {/* Menu button - shown on mobile, positioned at edge */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Logo - centered on mobile, left-aligned on desktop */}
        <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
          مداوم
        </h1>

        {/* Right side items */}
        <div className="flex items-center space-x-reverse space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {currentDate}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
