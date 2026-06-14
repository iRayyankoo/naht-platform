"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/actions/cms";

export default function SettingsForm({ settings }: { settings: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateSiteSettings(data);
      setMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {message && (
        <div className={`p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموقع</label>
          <input type="text" name="siteName" defaultValue={settings.siteName} required className="w-full border-gray-300 rounded-md p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رابط الشعار (Logo URL)</label>
          <input type="url" dir="ltr" name="logoUrl" defaultValue={settings.logoUrl || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الواتساب</label>
          <input type="text" dir="ltr" name="whatsappNumber" defaultValue={settings.whatsappNumber || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" placeholder="966500000000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الاتصال المباشر</label>
          <input type="text" dir="ltr" name="contactPhone" defaultValue={settings.contactPhone || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input type="email" dir="ltr" name="contactEmail" defaultValue={settings.contactEmail || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
          <input type="text" name="address" defaultValue={settings.address || ""} className="w-full border-gray-300 rounded-md p-2 border" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">رابط خرائط جوجل (Google Maps URL)</label>
          <input type="url" dir="ltr" name="googleMapsUrl" defaultValue={settings.googleMapsUrl || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">أوقات العمل</label>
          <input type="text" name="workingHours" defaultValue={settings.workingHours || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="الأحد - الخميس: 9 ص - 5 م" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">نص الفوتر التعريفي</label>
          <textarea name="footerText" defaultValue={settings.footerText || ""} rows={3} className="w-full border-gray-300 rounded-md p-2 border"></textarea>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">نص حقوق النشر (Copyright)</label>
          <input type="text" name="copyrightText" defaultValue={settings.copyrightText || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="جميع الحقوق محفوظة © 2026 شركة نحت الأصول" />
        </div>
      </div>

      {/* إعدادات السيو العامة */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات الـ SEO العامة (افتراضية)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الموقع الافتراضي (SEO Title)</label>
            <input type="text" name="defaultSeoTitle" defaultValue={settings.defaultSeoTitle || ""} className="w-full border-gray-300 rounded-md p-2 border" placeholder="نحت الأصول العقارية | الاستثمار المضمون" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الموقع الافتراضي (SEO Description)</label>
            <textarea name="defaultSeoDescription" defaultValue={settings.defaultSeoDescription || ""} rows={2} className="w-full border-gray-300 rounded-md p-2 border" placeholder="شركة نحت الأصول العقارية تقدم أفضل الفرص..."></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">صورة المشاركة الافتراضية (Open Graph Image URL)</label>
            <input type="url" dir="ltr" name="defaultOgImage" defaultValue={settings.defaultOgImage || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" placeholder="https://example.com/og-image.jpg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الرابط الأساسي للموقع (Canonical Base URL)</label>
            <input type="url" dir="ltr" name="canonicalBaseUrl" defaultValue={settings.canonicalBaseUrl || ""} className="w-full border-gray-300 rounded-md p-2 border text-left" placeholder="https://naht.com.sa" />
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" id="defaultRobotsIndex" name="defaultRobotsIndex" defaultChecked={settings.defaultRobotsIndex ?? true} value="true" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <label htmlFor="defaultRobotsIndex" className="ml-2 block text-sm text-gray-900 pr-2">
              السماح لمحركات البحث بفهرسة الموقع
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md font-bold disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
