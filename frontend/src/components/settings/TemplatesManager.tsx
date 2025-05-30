import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, FileText } from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import { TemplatesService } from "../../services/templates";
import { NoteTemplate } from "@shared/types/template";
import MarkdownEditor from "../ui/MarkdownEditor";

interface TemplateFormData {
  name: string;
  template: string;
}

const defaultTemplateData: TemplateFormData = {
  name: "",
  template: "# {{title}}\n\n## Notes\n\n",
};

const TemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null
  );
  const [formData, setFormData] =
    useState<TemplateFormData>(defaultTemplateData);
  const [isRtl, setIsRtl] = useState(false);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await TemplatesService.getAllTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch templates");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTemplates();
  }, []);
  // Cleanup toasts when component unmounts to prevent stale messages
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleCloseForm = () => {
    // Clear any pending toasts when closing the form
    toast.dismiss();
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    setFormData(defaultTemplateData);
    setFormMode("create");
    setCurrentTemplateId(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (template: NoteTemplate) => {
    setFormData({
      name: template.name,
      template: template.template,
    });
    setFormMode("edit");
    setCurrentTemplateId(template.id);
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTemplateChange = (value: string) => {
    setFormData({
      ...formData,
      template: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    if (!formData.template) {
      toast.error("Template content is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (formMode === "create") {
        await TemplatesService.createTemplate(formData);
        toast.success("Template created successfully");
      } else if (formMode === "edit" && currentTemplateId) {
        await TemplatesService.updateTemplate(currentTemplateId, formData);
        toast.success("Template updated successfully");
      }

      await fetchTemplates();
      setShowForm(false);
    } catch (err) {
      toast.error(
        formMode === "create"
          ? "Failed to create template"
          : "Failed to update template"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await TemplatesService.deleteTemplate(id);
      toast.success("Template deleted successfully");
      await fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
      console.error(err);
    }
  };

  const previewTemplate = (template: string) => {
    const variables = {
      date: new Date().toLocaleDateString(),
      title: "Sample Title",
      weekStart: new Date().toLocaleDateString(),
      weekEnd: new Date().toLocaleDateString(),
      month: new Date().toLocaleString("default", { month: "long" }),
      year: new Date().getFullYear().toString(),
    };

    return TemplatesService.formatTemplate(template, variables);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Templates Manager</h2>
        <Button
          onClick={handleOpenCreateForm}
          leftIcon={<PlusCircle size={16} />}
        >
          Create Template
        </Button>
      </div>
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              No templates found. Create your first template!
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader
                title={
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2 text-blue-500" />
                    {template.name}
                  </div>
                }
              />
              <CardContent className="p-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 mb-4 rounded-lg overflow-auto max-h-40 text-sm font-mono whitespace-pre-wrap">
                  {template.template.substring(0, 200)}
                  {template.template.length > 200 && "..."}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditForm(template)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 size={14} className="mr-1 text-red-500" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Create/Edit Template Form Modal */}{" "}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={formMode === "create" ? "Create Template" : "Edit Template"}
        size="full"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Content
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Use variables like {"{{"}
              <span className="font-semibold">date</span>
              {"}}"},{"{{"}
              <span className="font-semibold">title</span>
              {"}}"},{"{{"}
              <span className="font-semibold">weekStart</span>
              {"}}"},{"{{"}
              <span className="font-semibold">weekEnd</span>
              {"}}"},{"{{"}
              <span className="font-semibold">month</span>
              {"}}"},{"{{"}
              <span className="font-semibold">year</span>
              {"}}"}
              that will be replaced with actual values when the template is
              used.
            </p>
            <MarkdownEditor
              value={formData.template}
              onChange={handleTemplateChange}
              minHeight={300}
              rtl={isRtl}
              onRtlChange={setIsRtl}
            />
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Preview</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="prose dark:prose-invert max-w-none prose-sm overflow-auto max-h-48">
                {/* This would be better with a real markdown preview component */}
                <pre className="whitespace-pre-wrap">
                  {previewTemplate(formData.template)}
                </pre>
              </div>
            </div>
          </div>{" "}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleCloseForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {formMode === "create" ? "Create Template" : "Update Template"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesManager;
