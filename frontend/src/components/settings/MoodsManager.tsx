import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import * as OptionsService from "../../services/options";

const MoodsManager: React.FC = () => {
  const [moods, setMoods] = useState<string[]>([]);
  const [newMood, setNewMood] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchMoods = async () => {
    try {
      setIsLoading(true);
      const data = await OptionsService.getMoodLabels();
      setMoods(data);
      setError(null);
    } catch (err) {
      setError("فشل تحميل الحالات المزاجية");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMoods();
  }, []);

  // Cleanup toasts when component unmounts to prevent stale messages
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleAddMood = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMood.trim()) {
      toast.error("اسم الحالة المزاجية مطلوب");
      return;
    }

    if (moods.includes(newMood)) {
      toast.error("هذه الحالة المزاجية موجودة بالفعل");
      return;
    }

    try {
      setIsSubmitting(true);
      await OptionsService.addMood(newMood);
      toast.success("تمت إضافة الحالة المزاجية بنجاح");
      await fetchMoods();
      setNewMood("");
    } catch (err) {
      toast.error("فشل إضافة الحالة المزاجية");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMood = async (mood: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الحالة المزاجية "${mood}"؟`)) {
      return;
    }

    try {
      await OptionsService.removeMood(mood);
      toast.success("تم حذف الحالة المزاجية بنجاح");
      await fetchMoods();
    } catch (err) {
      toast.error("فشل حذف الحالة المزاجية");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جارٍ تحميل الحالات المزاجية...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدير الحالات المزاجية</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader title="إضافة حالة مزاجية جديدة" />
        <CardContent>
          <form onSubmit={handleAddMood} className="flex space-x-2">
            <Input
              placeholder="أدخل اسم الحالة المزاجية"
              value={newMood}
              onChange={(e) => setNewMood(e.target.value)}
              fullWidth
              required
            />
            <Button
              type="submit"
              leftIcon={<PlusCircle size={16} />}
              isLoading={isSubmitting}
            >
              إضافة
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="الحالات المزاجية الموجودة" />
        <CardContent>
          {moods.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
              <AlertCircle size={18} className="mr-2" />
              لم يتم إضافة أي حالات مزاجية بعد
            </div>
          ) : (
            <ul className="space-y-2">
              {moods.map((mood) => (
                <li
                  key={mood}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span>{mood}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMood(mood)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodsManager;
