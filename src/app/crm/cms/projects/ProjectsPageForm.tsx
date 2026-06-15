"use client";

import { useState } from "react";
import { updateProjectsPageContent } from "@/actions/cms";
import toast from "react-hot-toast";

export default function ProjectsPageForm({ content }: { content: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateProjectsPageContent(data);
      toast.success("تم حفظ محتوى صفحة المشاريع بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">المحتوى الأساسي لصفحة المشاريع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الصفحة (H1)</label>
            <input type="text" name="title" defaultValue={content?.title || "مشاريعنا العقارية"} required className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف أسفل العنوان</label>
            <textarea name="description" defaultValue={content?.description || ""} rows={3} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">نص في حال عدم وجود مشاريع</label>
            <input type="text" name="emptyStateText" defaultValue={content?.emptyStateText || "لا توجد مشاريع حالياً. نعمل على إضافة مشاريع جديدة قريباً."} className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">إعدادات محركات البحث (SEO)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الـ SEO (يظهر في تبويبة المتصفح)</label>
            <input type="text" name="seoTitle" defaultValue={content?.seoTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="مشاريعنا | نحت العقارية" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الـ SEO</label>
            <textarea name="seoDescription" defaultValue={content?.seoDescription || ""} rows={2} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold text-lg disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </form>
  );
}
