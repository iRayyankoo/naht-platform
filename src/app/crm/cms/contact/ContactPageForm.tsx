"use client";

import { useState } from "react";
import { updateContactPageContent } from "@/actions/cms";
import UploadButton from "@/components/crm/UploadButton";
import toast from "react-hot-toast";

export default function ContactPageForm({ content }: { content: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await updateContactPageContent(data);
      toast.success("تم حفظ محتوى صفحة تواصل معنا بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* القسم الرئيسي */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">محتوى قسم الهيدر (العنوان)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الصفحة</label>
            <input type="text" name="title" defaultValue={content.title} required className="w-full border-gray-300 rounded-md p-2 border" placeholder="تواصل معنا" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الصفحة</label>
            <textarea name="description" defaultValue={content.description || ""} rows={2} className="w-full border-gray-300 rounded-md p-2 border" placeholder="نحن هنا لخدمتك..."></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">صورة أو لون خلفية الهيدر (اختياري)</label>
            <div className="flex gap-2">
              <input type="text" id="heroImage" dir="ltr" name="heroImage" defaultValue={content.heroImage || ""} className="flex-1 border-gray-300 rounded-md p-2 border text-left" placeholder="https://... أو #0f172a" />
              <UploadButton onUpload={(url) => {
                const el = document.getElementById('heroImage') as HTMLInputElement;
                if (el) el.value = url;
              }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">يمكنك وضع رابط صورة أو كود لون. إذا تركته فارغاً سيتم استخدام اللون الافتراضي للموقع.</p>
          </div>
        </div>
      </div>

      {/* نموذج التواصل */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">نصوص نموذج التواصل</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان نموذج التواصل</label>
            <input type="text" name="formTitle" defaultValue={content.formTitle} required className="w-full border-gray-300 rounded-md p-2 border" placeholder="أرسل رسالتك" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نص زر الإرسال</label>
            <input type="text" name="submitButtonText" defaultValue={content.submitButtonText} required className="w-full border-gray-300 rounded-md p-2 border" placeholder="إرسال الرسالة" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">نص مساعد أعلى أو أسفل النموذج (اختياري)</label>
            <textarea name="helperText" defaultValue={content.helperText || ""} rows={2} className="w-full border-gray-300 rounded-md p-2 border" placeholder="سيتم الرد عليك خلال 24 ساعة..."></textarea>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">إعدادات محركات البحث (SEO)</h2>
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
          {isSaving ? "جاري الحفظ..." : "حفظ صفحة تواصل معنا"}
        </button>
      </div>
    </form>
  );
}
