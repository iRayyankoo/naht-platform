"use client";

import { useState } from "react";
import { updateHomePageContent } from "@/actions/cms";
import UploadButton from "@/components/crm/UploadButton";
import toast from "react-hot-toast";

export default function HomePageForm({ content }: { content: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateHomePageContent(data);
      toast.success("تم حفظ محتوى الصفحة الرئيسية بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const [heroMedia, setHeroMedia] = useState(content.heroBackgroundImage || "");

  const handleMediaUpload = (url: string) => {
    setHeroMedia((prev: string) => prev ? `${prev}\n${url}` : url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">الوسائط (صورة، فيديو، أو سلايدر)</label>
              <UploadButton onUpload={handleMediaUpload} label="رفع وسائط" />
            </div>
            <textarea 
              dir="ltr" 
              name="heroBackgroundImage" 
              value={heroMedia}
              onChange={(e) => setHeroMedia(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-md p-2 border text-left" 
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              يمكنك إدخال رابط صورة واحدة، أو رابط فيديو MP4، أو عدة روابط صور (كل رابط في سطر منفصل) لعرضها كسلايدر.
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

      {/* Naht Standard Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">قسم معايير نحت (Naht Standard)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الصغير</label>
            <input type="text" name="nahtStandardTitle" defaultValue={content.nahtStandardTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="The Naht Standard" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الرئيسي</label>
            <input type="text" name="nahtStandardSubtitle" defaultValue={content.nahtStandardSubtitle || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="نرتقي بمفهوم التطوير العقاري" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف العام</label>
            <textarea name="nahtStandardDescription" defaultValue={content.nahtStandardDescription || ""} rows={3} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
          </div>
        </div>

        <h3 className="text-md font-bold mt-6 mb-2">المميزات الأربعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 1: العنوان</label>
            <input type="text" name="nahtFeature1Title" defaultValue={content.nahtFeature1Title || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 1: الوصف</label>
            <textarea name="nahtFeature1Desc" defaultValue={content.nahtFeature1Desc || ""} rows={2} className="w-full border-gray-300 rounded p-1 text-sm border"></textarea>
          </div>
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 2: العنوان</label>
            <input type="text" name="nahtFeature2Title" defaultValue={content.nahtFeature2Title || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 2: الوصف</label>
            <textarea name="nahtFeature2Desc" defaultValue={content.nahtFeature2Desc || ""} rows={2} className="w-full border-gray-300 rounded p-1 text-sm border"></textarea>
          </div>
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 3: العنوان</label>
            <input type="text" name="nahtFeature3Title" defaultValue={content.nahtFeature3Title || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 3: الوصف</label>
            <textarea name="nahtFeature3Desc" defaultValue={content.nahtFeature3Desc || ""} rows={2} className="w-full border-gray-300 rounded p-1 text-sm border"></textarea>
          </div>
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 4: العنوان</label>
            <input type="text" name="nahtFeature4Title" defaultValue={content.nahtFeature4Title || ""} className="w-full border-gray-300 rounded p-1 text-sm border mb-2" />
            <label className="block text-xs font-bold text-gray-700 mb-1">ميزة 4: الوصف</label>
            <textarea name="nahtFeature4Desc" defaultValue={content.nahtFeature4Desc || ""} rows={2} className="w-full border-gray-300 rounded p-1 text-sm border"></textarea>
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
