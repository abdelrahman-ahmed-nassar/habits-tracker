import { Menu } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { format } from "date-fns";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold">Habits Tracker</h1>
        </div>

        <div className="flex items-center space-x-4">
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
