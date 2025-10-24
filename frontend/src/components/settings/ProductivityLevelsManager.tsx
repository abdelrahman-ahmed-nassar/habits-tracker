import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import * as OptionsService from "../../services/options";

const ProductivityLevelsManager: React.FC = () => {
  const [levels, setLevels] = useState<string[]>([]);
  const [newLevel, setNewLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      const data = await OptionsService.getProductivityLabels();
      setLevels(data);
      setError(null);
    } catch (err) {
      setError("فشل تحميل مستويات الإنتاجية");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchLevels();
  }, []);

  // Cleanup toasts when component unmounts to prevent stale messages
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLevel.trim()) {
      toast.error("اسم مستوى الإنتاجية مطلوب");
      return;
    }

    if (levels.includes(newLevel)) {
      toast.error("مستوى الإنتاجية هذا موجود بالفعل");
      return;
    }

    try {
      setIsSubmitting(true);
      await OptionsService.addProductivityLevel(newLevel);
      toast.success("تمت إضافة مستوى الإنتاجية بنجاح");
      await fetchLevels();
      setNewLevel("");
    } catch (err) {
      toast.error("فشل إضافة مستوى الإنتاجية");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLevel = async (level: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مستوى الإنتاجية "${level}"؟`)) {
      return;
    }

    try {
      await OptionsService.removeProductivityLevel(level);
      toast.success("تم حذف مستوى الإنتاجية بنجاح");
      await fetchLevels();
    } catch (err) {
      toast.error("فشل حذف مستوى الإنتاجية");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جارٍ تحميل مستويات الإنتاجية...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدير مستويات الإنتاجية</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader title="إضافة مستوى إنتاجية جديد" />
        <CardContent>
          <form onSubmit={handleAddLevel} className="flex space-x-2">
            <Input
              placeholder="أدخل مستوى الإنتاجية (مثل: عالي، متوسط، منخفض)"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
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
        <CardHeader title="مستويات الإنتاجية الموجودة" />
        <CardContent>
          {levels.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
              <AlertCircle size={18} className="mr-2" />
              لم يتم إضافة أي مستويات إنتاجية بعد
            </div>
          ) : (
            <ul className="space-y-2">
              {levels.map((level) => (
                <li
                  key={level}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span>{level}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLevel(level)}
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

export default ProductivityLevelsManager;
