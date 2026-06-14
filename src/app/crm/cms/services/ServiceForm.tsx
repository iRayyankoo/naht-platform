"use client";

import { useState } from "react";
import { upsertService } from "@/actions/cms";
import toast from "react-hot-toast";

export default function ServiceForm() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: (formData.get("slug") as string) || null,
      description: formData.get("description") as string,
      fullDescription: formData.get("fullDescription") as string,
      icon: formData.get("icon") as string,
      image: formData.get("image") as string,
      order: parseInt(formData.get("order") as string) || 0,
      isVisible: formData.get("isVisible") === "true",
      seoTitle: formData.get("seoTitle") as string,
      seoDescription: formData.get("seoDescription") as string,
    };

    try {
      await upsertService(data);
      toast.success("تمت إضافة الخدمة بنجاح");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة *</label>
        <input type="text" name="title" required className="w-full border-gray-300 rounded-md p-2 border text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط اللطيف (Slug)</label>
        <input type="text" name="slug" dir="ltr" className="w-full border-gray-300 rounded-md p-2 border text-sm text-left" placeholder="property-management" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">وصف قصير *</label>
        <textarea name="description" required rows={2} className="w-full border-gray-300 rounded-md p-2 border text-sm"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">وصف كامل</label>
        <textarea name="fullDescription" rows={3} className="w-full border-gray-300 rounded-md p-2 border text-sm"></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة (Icon)</label>
          <input type="text" name="icon" className="w-full border-gray-300 rounded-md p-2 border text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
          <input type="number" name="order" defaultValue={0} className="w-full border-gray-300 rounded-md p-2 border text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
        <select name="isVisible" defaultValue="true" className="w-full border-gray-300 rounded-md p-2 border text-sm">
          <option value="true">ظاهرة</option>
          <option value="false">مخفية</option>
        </select>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isSaving} className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-bold text-sm disabled:opacity-50">
          {isSaving ? "جاري الإضافة..." : "إضافة الخدمة"}
        </button>
      </div>
    </form>
  );
}
