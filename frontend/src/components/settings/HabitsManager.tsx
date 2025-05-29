import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { toast } from "react-toastify";
import { habitsService } from "../../services/habits";
import { Habit } from "@shared/types/habit";

interface HabitFormData {
  name: string;
  description: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  goalType: "counter" | "streak";
  goalValue: number;
  motivationNote?: string;
  isActive: boolean;
}

const defaultHabitData: HabitFormData = {
  name: "",
  description: "",
  tag: "",
  repetition: "daily",
  goalType: "streak",
  goalValue: 1,
  motivationNote: "",
  isActive: true,
};

const HabitsManager: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [currentHabitId, setCurrentHabitId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HabitFormData>(defaultHabitData);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const data = await habitsService.getAllHabits();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch habits");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchHabits();
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
    setFormData(defaultHabitData);
    setSelectedDays([]);
    setFormMode("create");
    setCurrentHabitId(null);
    setShowForm(true);
  };
  const handleOpenEditForm = (habit: Habit) => {
    setFormData({
      name: habit.name,
      description: habit.description || "",
      tag: habit.tag,
      repetition: habit.repetition,
      goalType: habit.goalType,
      goalValue: habit.goalValue,
      motivationNote: habit.motivationNote || "",
      isActive: habit.isActive !== false, // Default to true if not specified
    });
    setSelectedDays(habit.specificDays || []);
    setFormMode("edit");
    setCurrentHabitId(habit.id);
    setShowForm(true);
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access type

    if (name === "goalValue") {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 1, // Ensure it's a positive number
      });
    } else if (type === "checkbox" && name === "isActive") {
      setFormData({
        ...formData,
        isActive: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Habit name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const habitData = {
        ...formData,
        specificDays:
          formData.repetition !== "daily" ? selectedDays : undefined,
      };

      if (formMode === "create") {
        await habitsService.createHabit(habitData);
        toast.success("Habit created successfully");
      } else if (formMode === "edit" && currentHabitId) {
        await habitsService.updateHabit(currentHabitId, habitData);
        toast.success("Habit updated successfully");
      }

      await fetchHabits();
      setShowForm(false);
    } catch (err) {
      toast.error(
        formMode === "create"
          ? "Failed to create habit"
          : "Failed to update habit"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this habit? This will also delete all associated completion records."
      )
    ) {
      return;
    }

    try {
      await habitsService.deleteHabit(id);
      toast.success("Habit deleted successfully");
      await fetchHabits();
    } catch (err) {
      toast.error("Failed to delete habit");
      console.error(err);
    }
  };
    const handleToggleActive = async (habit: Habit) => {
    try {
      setIsSubmitting(true);
      // Create a request object with only the necessary fields
      const updateRequest = {
        name: habit.name,
        description: habit.description || "",
        tag: habit.tag,
        repetition: habit.repetition,
        specificDays: habit.specificDays,
        goalType: habit.goalType,
        goalValue: habit.goalValue,
        motivationNote: habit.motivationNote || "",
        isActive: !habit.isActive
      };
      
      await habitsService.updateHabit(habit.id, updateRequest);
      toast.success(`Habit ${!habit.isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchHabits();
    } catch (err) {
      toast.error("Failed to update habit status");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDaySelector = () => {
    if (formData.repetition === "daily") {
      return null;
    }

    const days =
      formData.repetition === "weekly"
        ? [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ]
        : Array.from({ length: 31 }, (_, i) => `${i + 1}`);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {formData.repetition === "weekly" ? "Days of week" : "Days of month"}
        </label>
        <div className="flex flex-wrap gap-2">
          {" "}
          {days.map((day, index) => (
            <button
              key={index}
              type="button"
              className={`px-3 py-1 text-sm rounded-full ${
                selectedDays.includes(index)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleDayToggle(index)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading habits...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Habits Manager</h2>
        <Button
          onClick={handleOpenCreateForm}
          leftIcon={<PlusCircle size={16} />}
        >
          Create Habit
        </Button>
      </div>
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              No habits found. Create your first habit!
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <Card key={habit.id}>              <CardContent className={`p-4 ${habit.isActive === false ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{habit.name}</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.description}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      onClick={() => handleOpenEditForm(habit)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      onClick={() => handleDelete(habit.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {habit.repetition}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs">
                    {habit.tag}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                    Goal: {habit.goalValue} {habit.goalType === "streak" ? "days" : "times"}
                  </span>
                  {habit.isActive === false && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                      Inactive
                    </span>
                  )}
                </div>                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Current Streak: {habit.currentStreak}</div>
                  <div>Best Streak: {habit.bestStreak}</div>
                </div>
                <div className="mt-3 flex items-center">
                  <button
                    className="flex items-center text-sm font-medium"
                    onClick={() => handleToggleActive(habit)}
                    disabled={isSubmitting}
                  >
                    {habit.isActive !== false ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600 mr-1" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400 mr-1" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}{" "}
      {/* Create/Edit Habit Form Modal */}{" "}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={formMode === "create" ? "Create Habit" : "Edit Habit"}
        size="full"
        fullHeight={true}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
          />
          <Input
            label="Tag"
            name="tag"
            value={formData.tag}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <Select
            label="Repetition"
            name="repetition"
            value={formData.repetition}
            onChange={handleInputChange}
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            fullWidth
          />
          {renderDaySelector()}
          <Select
            label="Goal Type"
            name="goalType"
            value={formData.goalType}
            onChange={handleInputChange}
            options={[
              { value: "streak", label: "Streak" },
              { value: "counter", label: "Counter" },
            ]}
            fullWidth
          />
          <Input
            label="Goal Value"
            name="goalValue"
            type="number"
            min="1"
            value={formData.goalValue.toString()}
            onChange={handleInputChange}
            required
            fullWidth
          />          <Input
            label="Motivation Note"
            name="motivationNote"
            value={formData.motivationNote || ""}
            onChange={handleInputChange}
            fullWidth
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className="flex items-center focus:outline-none"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="h-6 w-6 text-green-600 mr-2" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-6 w-6 text-gray-400 mr-2" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
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
              {formMode === "create" ? "Create Habit" : "Update Habit"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitsManager;
