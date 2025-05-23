import React from "react";
import { useTheme } from "@/context/ThemeContext";

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="accent-primary-500"
                />
                <span>Light</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="accent-primary-500"
                />
                <span>Dark</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "system"}
                  onChange={() => setTheme("system")}
                  className="accent-primary-500"
                />
                <span>System</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
            Export Data
          </button>
          <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
            Import Data
          </button>
          <button className="px-4 py-2 bg-danger-500 text-white rounded-md hover:bg-danger-600 transition-colors">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
