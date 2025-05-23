import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  HomeIcon,
  LineChartIcon,
  ListTodoIcon,
  MenuIcon,
  MoonIcon,
  StickyNoteIcon,
  SunIcon,
  XIcon,
  SettingsIcon,
} from "lucide-react";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { to: "/", label: "Dashboard", icon: HomeIcon },
    { to: "/daily", label: "Daily", icon: CalendarIcon },
    { to: "/habits", label: "Habits", icon: ListTodoIcon },
    { to: "/analytics", label: "Analytics", icon: LineChartIcon },
    { to: "/notes", label: "Notes", icon: StickyNoteIcon },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu toggle */}
        <div className="md:hidden mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo */}
        <div className="flex items-center font-bold text-xl">
          <Link to="/" className="flex items-center">
            <span className="text-primary mr-1">Habit</span>
            <span>Tracker</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center ml-auto space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive(item.to)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            );
          })}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-2"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={toggleMenu}
            />
            <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-background border-r p-6 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div className="font-bold text-xl">
                  <span className="text-primary">Habit</span>Tracker
                </div>
                <Button variant="ghost" size="icon" onClick={toggleMenu}>
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={toggleMenu}
                      className={`flex items-center py-3 px-4 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                        isActive(item.to)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <>
                      <SunIcon className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
