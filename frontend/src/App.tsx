import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import MainLayout from "@/components/layout/MainLayout";

// Lazy loading pages
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DailyPage = lazy(() => import("@/pages/DailyPage"));
const HabitsPage = lazy(() => import("@/pages/HabitsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailyPage />} />
            <Route path="/daily/:date" element={<DailyPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/habits/:id" element={<HabitsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/analytics/:view" element={<AnalyticsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:date" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
