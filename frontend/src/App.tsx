import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy loading pages
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DailyPage = lazy(() => import("@/pages/DailyPage"));
const HabitsPage = lazy(() => import("@/pages/HabitsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Loading component for Suspense
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MainLayout>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </MainLayout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
