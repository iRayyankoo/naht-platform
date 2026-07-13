"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createTask } from "@/actions/tasks";

export const dynamic = "force-dynamic";

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch users for assignment (could be moved to server component and passed as props, but this is simple)
    fetch("/api/users/active")
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as "LOW" | "MEDIUM" | "HIGH",
      assignedToId: formData.get("assignedToId") as string || undefined,
      requiresApproval: formData.get("requiresApproval") === "on",
    };

    try {
      await createTask(data);
      toast.success("تم إنشاء المهمة بنجاح");
      router.push("/crm/tasks");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء مهمة جديدة</h1>
          <p className="text-gray-500 text-sm mt-1">أدخل تفاصيل المهمة والمسؤوليات</p>
        </div>
        <Link href="/crm/tasks" className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">
          إلغاء والعودة
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">عنوان المهمة <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              placeholder="مثال: مراجعة العقد النهائي لمشروع النخيل"
              className="w-full border-gray-200 rounded-xl focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">التفاصيل</label>
            <textarea
              name="description"
              rows={4}
              placeholder="تفاصيل إضافية عن المهمة والمطلوب..."
              className="w-full border-gray-200 rounded-xl focus:border-primary focus:ring-primary sm:text-sm resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">الأولوية</label>
              <select name="priority" className="w-full border-gray-200 rounded-xl focus:border-primary focus:ring-primary sm:text-sm font-medium">
                <option value="MEDIUM">متوسطة</option>
                <option value="HIGH">عالية</option>
                <option value="LOW">عادية</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">المسؤول عن التنفيذ</label>
              <select name="assignedToId" className="w-full border-gray-200 rounded-xl focus:border-primary focus:ring-primary sm:text-sm">
                <option value="">-- بدون إسناد (قيد الانتظار) --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                id="requiresApproval"
                name="requiresApproval"
                type="checkbox"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="requiresApproval" className="font-bold text-gray-900 block cursor-pointer">تتطلب اعتماد بعد التنفيذ؟</label>
              <p className="text-gray-500 mt-0.5">إذا تم التفعيل، لن تعتبر المهمة منتهية إلا بعد الحصول على الموافقة من صاحب الصلاحية.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  جاري الحفظ...
                </>
              ) : "إنشاء المهمة"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
