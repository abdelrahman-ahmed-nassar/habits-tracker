import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  List,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import NotesCalendar from "../components/features/NotesCalendar";
import NotesList from "../components/features/NotesList";
import NotesAnalytics from "../components/features/NotesAnalytics";
import { NotesService } from "../services/notes";
import { DailyNote } from "@shared/types/note";

type ViewMode = "calendar" | "list" | "analytics";

const Notes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const mode = searchParams.get("view") as ViewMode;
    return ["calendar", "list", "analytics"].includes(mode) ? mode : "calendar";
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null);

  // Update URL when view mode changes
  useEffect(() => {
    setSearchParams({ view: viewMode });
  }, [viewMode, setSearchParams]);

  // Fetch all notes on component mount
  useEffect(() => {
    fetchAllNotes();
  }, []);

  // Fetch calendar data when current date changes (for calendar view)
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchCalendarData();
    }
  }, [currentDate, viewMode]);

  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await NotesService.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await NotesService.getNotesCalendar(year, month);
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast.error("Failed to load calendar data");
    }
  };

  const handleDateNavigation = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleNoteSelect = (note: DailyNote) => {
    setSelectedNote(note);
  };

  const handleNoteUpdate = () => {
    fetchAllNotes();
    if (viewMode === "calendar") {
      fetchCalendarData();
    }
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "calendar":
        return <CalendarIcon className="w-4 h-4" />;
      case "list":
        return <List className="w-4 h-4" />;
      case "analytics":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading && viewMode !== "calendar") {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notes & Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {viewMode === "calendar" && "View your notes on a monthly calendar"}
            {viewMode === "list" &&
              "Browse all your notes in chronological order"}
            {viewMode === "analytics" &&
              "Analyze your writing patterns and insights"}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
          {(["calendar", "list", "analytics"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === mode
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {getViewModeIcon(mode)}
              <span className="capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View Navigation (only show for calendar mode) */}
      {viewMode === "calendar" && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <Badge variant="default" size="sm">
                  {calendarData?.totalNotes || 0} notes this month
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateNavigation("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateNavigation("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {viewMode === "calendar" && (
          <NotesCalendar
            currentDate={currentDate}
            calendarData={calendarData}
            onNoteSelect={handleNoteSelect}
            onNoteUpdate={handleNoteUpdate}
          />
        )}

        {viewMode === "list" && (
          <NotesList
            notes={notes}
            onNoteSelect={handleNoteSelect}
            selectedNote={selectedNote}
            onNoteUpdate={handleNoteUpdate}
          />
        )}

        {viewMode === "analytics" && <NotesAnalytics notes={notes} />}
      </div>
    </div>
  );
};

export default Notes;
