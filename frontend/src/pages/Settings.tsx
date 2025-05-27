import React, { useState } from "react";
import { Briefcase, MessageSquare, Zap, FileText } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import HabitsManager from "../components/settings/HabitsManager";
import MoodsManager from "../components/settings/MoodsManager";
import ProductivityLevelsManager from "../components/settings/ProductivityLevelsManager";
import TemplatesManager from "../components/settings/TemplatesManager";

type SettingsTab = "habits" | "moods" | "productivity" | "templates";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("habits"); // These states are for future use with asynchronous data loading
  const isLoading = false;
  const error = null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "habits":
        return <HabitsManager />;
      case "moods":
        return <MoodsManager />;
      case "productivity":
        return <ProductivityLevelsManager />;
      case "templates":
        return <TemplatesManager />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <PageContainer title="Settings" isLoading={isLoading} error={error}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your habits, moods, productivity levels, and note templates
        </p>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("habits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "habits"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                <span>Habits</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("moods")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "moods"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Moods</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("productivity")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "productivity"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>Productivity Levels</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <span>Note Templates</span>
              </div>
            </button>
          </nav>
        </div>

        {renderTabContent()}
      </div>
    </PageContainer>
  );
};

export default Settings;
