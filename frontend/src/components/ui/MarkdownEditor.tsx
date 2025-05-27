import React, { useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  Edit3,
  HelpCircle,
  CheckSquare,
  Calendar,
  Star,
  Zap,
  FileText,
  ChevronDown
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";
import Button from "./Button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  disabled?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 200,
  className,
  disabled = false,
}) => {  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit");
  const [showHelp, setShowHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);

  // Close templates dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };

    if (showTemplates) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTemplates]);

  const dailyNoteTemplates = [
    {
      name: "Daily Reflection",
      content: `# Daily Reflection - ${new Date().toLocaleDateString()}

## 🌟 Today's Highlights
- 

## 💭 What I Learned
- 

## 🎯 Tomorrow's Focus
- [ ] 
- [ ] 
- [ ] 

## 📝 Additional Notes
`
    },
    {
      name: "Gratitude & Growth",
      content: `# ${new Date().toLocaleDateString()} - Gratitude & Growth

## 🙏 What I'm Grateful For
1. 
2. 
3. 

## 📈 How I Grew Today
- 

## 🌱 Areas for Improvement
- 

## ⭐ Quote of the Day
> 
`
    },
    {
      name: "Achievement Log",
      content: `# Achievement Log - ${new Date().toLocaleDateString()}

## 🏆 Accomplishments
- **Big Win**: 
- **Small Wins**: 
  - 
  - 

## 🚀 Progress Made
- 

## 🎯 Next Steps
- [ ] 
- [ ] 

## 💡 Key Insights
- 
`
    },
    {
      name: "Mood & Energy",
      content: `# Daily Check-in - ${new Date().toLocaleDateString()}

## 😊 Mood & Energy
**Overall Mood**: 
**Energy Level**: 
**Stress Level**: 

## 🌈 What Affected My Mood
**Positive**: 
- 

**Challenging**: 
- 

## 🔋 Energy Boosters
- 

## 😌 Self-Care Today
- 
`
    }
  ];
  const insertText = useCallback((before: string, after: string = "", placeholder: string = "") => {
    if (!textareaRef.current || disabled) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = 
      value.substring(0, start) + 
      before + 
      textToInsert + 
      after + 
      value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + before.length + (selectedText ? selectedText.length : placeholder.length);
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [value, onChange, disabled]);  const insertLink = useCallback(() => {
    if (!textareaRef.current || disabled) return;

    const url = prompt("Enter URL:");
    if (!url) return;
    
    const linkText = prompt("Enter link text:") || "link";
    insertText(`[${linkText}](`, ")", url);
  }, [insertText, disabled]);

  const insertTemplate = useCallback((template: typeof dailyNoteTemplates[0]) => {
    if (value.trim() && !confirm("This will replace your current content. Continue?")) {
      return;
    }
    onChange(template.content);
    setShowTemplates(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [value, onChange]);
  const toolbarButtons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => insertText("**", "**", "bold text"),
    },
    {
      icon: Italic,
      title: "Italic", 
      action: () => insertText("*", "*", "italic text"),
    },
    {
      icon: Underline,
      title: "Strikethrough",
      action: () => insertText("~~", "~~", "strikethrough text"),
    },
    { type: "separator" },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => insertText("# ", "", "Heading 1"),
    },
    {
      icon: Heading2,
      title: "Heading 2", 
      action: () => insertText("## ", "", "Heading 2"),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => insertText("### ", "", "Heading 3"),
    },
    { type: "separator" },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertText("- ", "", "List item"),
    },
    {
      icon: ListOrdered,
      title: "Numbered List",
      action: () => insertText("1. ", "", "List item"),
    },
    {
      icon: CheckSquare,
      title: "Task List",
      action: () => insertText("- [ ] ", "", "Task item"),
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertText("> ", "", "Quote text"),
    },
    { type: "separator" },
    {
      icon: Code,
      title: "Inline Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: Link,
      title: "Link",
      action: insertLink,
    },
  ];

  const quickInsertButtons = [
    {
      icon: Calendar,
      title: "Insert Today's Date",
      action: () => {
        const today = new Date().toLocaleDateString();
        insertText(`📅 ${today}: `, "");
      },
    },
    {
      icon: Star,
      title: "Highlight Achievement",
      action: () => insertText("⭐ **Achievement**: ", "", "Something great I accomplished"),
    },
    {
      icon: Zap,
      title: "Key Insight",
      action: () => insertText("💡 **Insight**: ", "", "Something I learned or realized"),
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    // Handle Tab for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      insertText("  ", "");
      return;
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertText("**", "**", "bold text");
          break;
        case "i":
          e.preventDefault();
          insertText("*", "*", "italic text");
          break;
        case "k":
          e.preventDefault();
          insertLink();
          break;
      }
    }
  };

  return (
    <div className={cn("border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden", className)}>      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* Formatting buttons */}
          {toolbarButtons.map((button, index) => {
            if (button.type === "separator") {
              return (
                <div 
                  key={index} 
                  className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" 
                />
              );
            }

            const IconComponent = button.icon!;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 flex-shrink-0"
                onClick={button.action}
                disabled={disabled}
                title={button.title}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          {/* Quick insert buttons */}
          {quickInsertButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={`quick-${index}`}
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 flex-shrink-0 text-blue-600 dark:text-blue-400"
                onClick={button.action}
                disabled={disabled}
                title={button.title}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}
        </div>        <div className="flex items-center space-x-1">          {/* Templates Dropdown */}
          <div className="relative" ref={templatesRef}>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 flex items-center space-x-1"
              onClick={() => setShowTemplates(!showTemplates)}
              disabled={disabled}
              title="Insert Template"
            >
              <FileText className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">Daily Note Templates</div>
                  {dailyNoteTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => insertTemplate(template)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      disabled={disabled}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "edit"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMode("split")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "split"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              ⚏
            </button>
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "preview"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            onClick={() => setShowHelp(!showHelp)}
            title="Markdown Help"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>          {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-300 dark:border-gray-600 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Formatting</h4>
              <div className="space-y-1 text-xs">
                <div><code>**bold**</code> → <strong>bold</strong></div>
                <div><code>*italic*</code> → <em>italic</em></div>
                <div><code>~~strikethrough~~</code> → <del>strikethrough</del></div>
                <div><code>`code`</code> → <code>code</code></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Structure</h4>
              <div className="space-y-1 text-xs">
                <div><code># Heading 1</code></div>
                <div><code>## Heading 2</code></div>
                <div><code>- List item</code></div>
                <div><code>1. Numbered item</code></div>
                <div><code>- [ ] Task item</code></div>
                <div><code>&gt; Quote</code></div>
                <div><code>[Link](url)</code></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Inserts</h4>
              <div className="space-y-1 text-xs">
                <div>📅 Today's date</div>
                <div>⭐ Achievement marker</div>
                <div>💡 Insight marker</div>
                <div>📝 Note template</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-semibold mb-1">Keyboard Shortcuts</h5>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Ctrl+B → Bold text</div>
                  <div>Ctrl+I → Italic text</div>
                  <div>Ctrl+K → Insert link</div>
                  <div>Tab → Indent (in lists)</div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-1">Daily Note Tips</h5>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Use headings to organize sections</div>
                  <div>Create task lists for tomorrow's goals</div>
                  <div>Quote inspiring thoughts</div>
                  <div>Bold key achievements</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex" style={{ minHeight }}>
        {/* Edit Mode */}
        {(mode === "edit" || mode === "split") && (
          <div className={cn("flex-1", mode === "split" && "border-r border-gray-300 dark:border-gray-600")}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full h-full p-4 resize-none border-0 focus:outline-none focus:ring-0",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview Mode */}
        {(mode === "preview" || mode === "split") && (
          <div className={cn("flex-1 overflow-auto")}>
            <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-400 italic">Preview will appear here...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
