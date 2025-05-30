import React, { useState, useEffect } from "react";
import { Save, Edit3, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import MarkdownEditor from "../ui/MarkdownEditor";
import { NotesService } from "../../services/notes";
import { TemplatesService } from "../../services/templates";
import { DailyNote } from "@shared/types/note";
import { NoteTemplate } from "@shared/types/template";

interface DailyNotesProps {
  date: string; // YYYY-MM-DD format
  initialNote: DailyNote | null;
  onNoteUpdate: () => void;
}

const DailyNotes: React.FC<DailyNotesProps> = ({
  date,
  initialNote,
  onNoteUpdate,
}) => {
  const [note, setNote] = useState<DailyNote | null>(initialNote);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [productivityLevel, setProductivityLevel] = useState("");
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [availableProductivityLevels, setAvailableProductivityLevels] =
    useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(true); // Default to RTL
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    setNote(initialNote);
    if (initialNote) {
      setContent(initialNote.content);
      setMood(initialNote.mood || "");
      setProductivityLevel(initialNote.productivityLevel || "");
    } else {
      setContent("");
      setMood("");
      setProductivityLevel("");
    }
  }, [initialNote]);

  useEffect(() => {
    fetchOptions();
    fetchTemplates();
  }, []);
  const fetchOptions = async () => {
    try {
      const [moods, productivityLevels] = await Promise.all([
        NotesService.getMoods(),
        NotesService.getProductivityLevels(),
      ]);
      setAvailableMoods(moods);
      setAvailableProductivityLevels(productivityLevels);
    } catch (error) {
      console.error("Error fetching options:", error);
      // Set default options if API call fails
      setAvailableMoods([
        "😊 Great",
        "🙂 Good",
        "😐 Okay",
        "😔 Poor",
        "😞 Terrible",
      ]);
      setAvailableProductivityLevels([
        "🚀 Very High",
        "⚡ High",
        "✅ Medium",
        "🐌 Low",
        "😴 Very Low",
      ]);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const fetchedTemplates = await TemplatesService.getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load note templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const applyTemplate = (template: NoteTemplate) => {
    // Process template content - replace variables
    let processedContent = template.template;
    const today = new Date();

    // Common template variables
    processedContent = processedContent.replace(
      /\{\{date\}\}/g,
      today.toLocaleDateString()
    );
    processedContent = processedContent.replace(
      /\{\{year\}\}/g,
      today.getFullYear().toString()
    );
    processedContent = processedContent.replace(
      /\{\{month\}\}/g,
      today.toLocaleString("default", { month: "long" })
    );

    // Weekly variables
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (6 - today.getDay()));

    processedContent = processedContent.replace(
      /\{\{weekStart\}\}/g,
      weekStart.toLocaleDateString()
    );
    processedContent = processedContent.replace(
      /\{\{weekEnd\}\}/g,
      weekEnd.toLocaleDateString()
    );

    setContent(processedContent);
    setShowTemplateSelector(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.warning("Please enter some content for your note");
      return;
    }

    setLoading(true);
    try {
      if (note) {
        // Update existing note
        const updatedNote = await NotesService.updateNote(note.id, {
          content: content.trim(),
          mood: mood || undefined,
          productivityLevel: productivityLevel || undefined,
        });
        setNote(updatedNote);
        toast.success("Note updated successfully");
      } else {
        // Create new note
        const newNote = await NotesService.createNote({
          date,
          content: content.trim(),
          mood: mood || undefined,
          productivityLevel: productivityLevel || undefined,
        });
        setNote(newNote);
        toast.success("Note created successfully");
      }
      setIsEditing(false);
      onNoteUpdate();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    if (!confirm("Are you sure you want to delete this note?")) return;

    setLoading(true);
    try {
      await NotesService.deleteNote(note.id);
      setNote(null);
      setContent("");
      setMood("");
      setProductivityLevel("");
      setIsEditing(false);
      toast.success("Note deleted successfully");
      onNoteUpdate();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (note) {
      setContent(note.content);
      setMood(note.mood || "");
      setProductivityLevel(note.productivityLevel || "");
    } else {
      setContent("");
      setMood("");
      setProductivityLevel("");
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCreate = () => {
    setIsEditing(true);
    setContent("");
    setMood("");
    setProductivityLevel("");
  };

  return (
    <div className="space-y-6 [direction:rtl] ">
      {/* Note Display/Edit */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Daily Note</h2>
              <div className="flex items-center space-x-2">
                {note && !isEditing && (
                  <>
                    <Button
                      onClick={handleEdit}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {!note && !isEditing && (
                  <Button
                    onClick={handleCreate}
                    variant="primary"
                    size="sm"
                    className="mr-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                )}
              </div>
            </div>
          }
        />

        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {" "}
              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note Content
                  </label>
                  <div className="relative">
                    <Button
                      onClick={() =>
                        setShowTemplateSelector(!showTemplateSelector)
                      }
                      variant="secondary"
                      size="sm"
                      className="flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>

                    {showTemplateSelector && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                            Select Template
                          </div>
                          {isLoadingTemplates ? (
                            <div className="flex items-center justify-center p-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Loading...
                              </span>
                            </div>
                          ) : templates.length > 0 ? (
                            templates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => applyTemplate(template)}
                                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                {template.name}
                              </button>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                              No templates available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="What's on your mind today? Use markdown for rich formatting..."
                  minHeight={300}
                  disabled={loading}
                  rtl={isRtl}
                  onRtlChange={setIsRtl}
                />
              </div>
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mood
                </label>
                <select
                  value={mood}
                  dir="ltr"
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Select mood (optional)</option>
                  {availableMoods.map((moodOption) => (
                    <option key={moodOption} value={moodOption}>
                      {moodOption}
                    </option>
                  ))}
                </select>
              </div>
              {/* Productivity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Productivity Level
                </label>
                <select
                  dir="ltr"
                  value={productivityLevel}
                  onChange={(e) => setProductivityLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Select productivity level (optional)</option>
                  {availableProductivityLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="sm"
                  disabled={loading || !content.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          ) : note ? (
            <div className="space-y-4">
              {/* Content Display */}
              <div className="prose dark:prose-invert max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  {note.mood && (
                    <div className="flex items-center space-x-1">
                      <span>Mood:</span>
                      <span className="font-medium">{note.mood}</span>
                    </div>
                  )}
                  {note.productivityLevel && (
                    <div className="flex items-center space-x-1">
                      <span>Productivity:</span>
                      <span className="font-medium">
                        {note.productivityLevel}
                      </span>
                    </div>
                  )}
                </div>
                <div>Updated: {new Date(note.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No note for this day yet.
              </p>
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </div>
          )}
        </CardContent>
      </Card>{" "}
      {/* Quick Tips */}
      <Card>
        <CardHeader title="Daily Reflection Tips" />
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Ideas
              </h4>
              <div className="space-y-1">
                <p>• Reflect on your achievements and challenges from today</p>
                <p>• Note any insights or learnings you gained</p>
                <p>• Consider what you're grateful for</p>
                <p>• Plan how tomorrow could be even better</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formatting Tips
              </h4>
              <div className="space-y-1">
                <p>
                  • Use <strong>**bold**</strong> for important achievements
                </p>
                <p>
                  • Create task lists with <code>- [ ]</code> for tomorrow's
                  goals
                </p>
                <p>
                  • Add <em>*emphasis*</em> to key insights
                </p>
                <p>• Use templates for consistent daily structure</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(DailyNotes);
