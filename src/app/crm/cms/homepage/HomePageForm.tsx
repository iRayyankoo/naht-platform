"use client";

import { useState } from "react";
import { updateHomePageContent } from "@/actions/cms";

export default function HomePageForm({ content }: { content: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateHomePageContent(data);
      setMessage({ type: "success", text: "تم حفظ محتوى الصفحة الرئيسية بنجاح" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">قسم البداية (Hero Section)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الرئيسي</label>
            <input type="text" name="heroTitle" defaultValue={content.heroTitle} required className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الفرعي</label>
            <input type="text" name="heroSubtitle" defaultValue={content.heroSubtitle} required className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الوسائط (صورة، فيديو، أو سلايدر)</label>
            <textarea 
              dir="ltr" 
              name="heroBackgroundImage" 
              defaultValue={content.heroBackgroundImage || ""} 
              rows={3}
              className="w-full border-gray-300 rounded-md p-2 border text-left" 
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              يمكنك إدخال رابط صورة واحدة، أو رابط فيديو MP4، أو عدة روابط صور (كل رابط في سطر منفصل أو مفصولة بفاصلة) لعرضها كسلايدر.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر (CTA)</label>
            <input type="text" name="ctaButtonText" defaultValue={content.ctaButtonText} required className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الزر (CTA URL)</label>
            <input type="text" dir="ltr" name="ctaButtonUrl" defaultValue={content.ctaButtonUrl} required className="w-full border-gray-300 rounded-md p-2 border text-left" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">قسم الإحصائيات</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان القسم (اختياري)</label>
          <input type="text" name="statsTitle" defaultValue={content.statsTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم الإحصائية 1</label>
            <input type="text" name="stat1Label" defaultValue={content.stat1Label || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" placeholder="مشاريع منجزة" />
            <label className="block text-xs font-bold text-gray-700 mb-1">قيمة الإحصائية 1</label>
            <input type="text" name="stat1Value" defaultValue={content.stat1Value || ""} className="w-full border-gray-300 rounded p-1 text-sm border" placeholder="+50" />
          </div>
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم الإحصائية 2</label>
            <input type="text" name="stat2Label" defaultValue={content.stat2Label || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">قيمة الإحصائية 2</label>
            <input type="text" name="stat2Value" defaultValue={content.stat2Value || ""} className="w-full border-gray-300 rounded p-1 text-sm border" />
          </div>
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم الإحصائية 3</label>
            <input type="text" name="stat3Label" defaultValue={content.stat3Label || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">قيمة الإحصائية 3</label>
            <input type="text" name="stat3Value" defaultValue={content.stat3Value || ""} className="w-full border-gray-300 rounded p-1 text-sm border" />
          </div>
        </div>
      </div>

      {/* Why Naht & About Brief Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">قسم لماذا نحت؟</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <input type="text" name="whyNahtTitle" defaultValue={content.whyNahtTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea name="whyNahtDescription" defaultValue={content.whyNahtDescription || ""} rows={4} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">نبذة من نحن (للصفحة الرئيسية)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <input type="text" name="aboutBriefTitle" defaultValue={content.aboutBriefTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">النص</label>
            <textarea name="aboutBriefText" defaultValue={content.aboutBriefText || ""} rows={4} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط صورة النبذة (اختياري)</label>
            <input type="url" dir="ltr" name="aboutBriefImage" defaultValue={content.aboutBriefImage || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold text-lg disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : "حفظ محتوى الصفحة الرئيسية"}
        </button>
      </div>
    </form>
  );
}
