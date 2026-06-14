"use client";

import { useState } from "react";
import { upsertSocialLink } from "@/actions/cms";
import toast from "react-hot-toast";

export default function SocialLinkForm() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      platformName: formData.get("platformName") as string,
      url: formData.get("url") as string,
      icon: (formData.get("icon") as string) || null,
      order: parseInt(formData.get("order") as string) || 0,
      isVisible: formData.get("isVisible") === "true",
    };

    try {
      await upsertSocialLink(data);
      toast.success("تمت إضافة الرابط بنجاح");
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
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنصة *</label>
        <input type="text" name="platformName" required className="w-full border-gray-300 rounded-md p-2 border text-sm" placeholder="مثال: X (Twitter)" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط *</label>
        <input type="url" name="url" dir="ltr" required className="w-full border-gray-300 rounded-md p-2 border text-sm text-left" placeholder="https://x.com/naht" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">رمز الأيقونة (اختياري)</label>
        <input type="text" name="icon" className="w-full border-gray-300 rounded-md p-2 border text-sm" placeholder="SVG Code or FontAwesome class" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
          <input type="number" name="order" defaultValue={0} className="w-full border-gray-300 rounded-md p-2 border text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
          <select name="isVisible" defaultValue="true" className="w-full border-gray-300 rounded-md p-2 border text-sm">
            <option value="true">ظاهر</option>
            <option value="false">مخفي</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isSaving} className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-bold text-sm disabled:opacity-50">
          {isSaving ? "جاري الإضافة..." : "إضافة الرابط"}
        </button>
      </div>
    </form>
  );
}
