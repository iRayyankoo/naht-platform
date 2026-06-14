"use client";

import { useState } from "react";
import { updateAboutPageContent } from "@/actions/cms";
import toast from "react-hot-toast";

export default function AboutPageForm({ content }: { content: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateAboutPageContent(data);
      toast.success("تم حفظ محتوى صفحة من نحن بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الرئيسي</label>
        <input type="text" name="title" defaultValue={content.title} required className="w-full border-gray-300 rounded-md p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر</label>
        <textarea name="shortDescription" defaultValue={content.shortDescription || ""} rows={2} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">وصف تفصيلي</label>
        <textarea name="fullDescription" defaultValue={content.fullDescription || ""} rows={6} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الرؤية (Vision)</label>
          <textarea name="vision" defaultValue={content.vision || ""} rows={3} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة (Mission)</label>
          <textarea name="mission" defaultValue={content.mission || ""} rows={3} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">القيم (Values)</label>
        <textarea name="values" defaultValue={content.values || ""} rows={3} placeholder="قيمة 1، قيمة 2، قيمة 3..." className="w-full border-gray-300 rounded-md p-2 border"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رابط الميديا (صورة أو فيديو)</label>
          <input type="url" dir="ltr" name="mediaUrl" defaultValue={content.mediaUrl || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">إحصائيات الشركة (نص)</label>
          <input type="text" name="companyStats" defaultValue={content.companyStats || ""} className="w-full border-gray-300 rounded-md p-2 border" />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100 bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-bold text-gray-800">إعدادات محركات البحث (SEO)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input type="text" name="seoTitle" defaultValue={content.seoTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
            <input type="text" name="seoDescription" defaultValue={content.seoDescription || ""} className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold text-lg disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : "حفظ صفحة من نحن"}
        </button>
      </div>
    </form>
  );
}
