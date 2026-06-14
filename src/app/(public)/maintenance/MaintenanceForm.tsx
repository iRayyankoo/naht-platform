"use client";

import { useState } from "react";
import { submitMaintenance } from "@/actions/forms";
import { useRouter } from "next/navigation";

export default function MaintenanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    let attachmentUrl = null;

    try {
      // 1. Upload file if exists
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", "maintenance");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "فشل رفع المرفق");
        }

        const { url } = await uploadRes.json();
        attachmentUrl = url;
      }

      // 2. Submit Data
      const data = {
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        projectOrUnit: formData.get("projectOrUnit"),
        issueType: formData.get("issueType"),
        description: formData.get("description"),
        contactTime: formData.get("contactTime"),
        attachmentUrl,
      };

      await submitMaintenance(data);
      import('@/lib/events').then(({ trackEvent }) => {
        trackEvent("form_submit", { formType: "MAINTENANCE" });
      }).catch(err => console.error(err));
      router.push("/thank-you/maintenance");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقاً.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm md:text-base border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
        <input type="text" name="fullName" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">رقم الجوال *</label>
          <input type="tel" name="phone" dir="ltr" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="05xxxxxxxx" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">البريد الإلكتروني (اختياري)</label>
          <input type="email" name="email" dir="ltr" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="example@email.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">اسم المشروع أو الوحدة</label>
          <input type="text" name="projectOrUnit" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: مشروع نحت 15 - شقة 4" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الوقت المناسب للتواصل</label>
          <input type="text" name="contactTime" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: بعد العصر" />
        </div>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نوع المشكلة *</label>
        <select name="issueType" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base bg-white">
          <option value="">-- اختر نوع المشكلة --</option>
          <option value="كهرباء">كهرباء</option>
          <option value="سباكة">سباكة</option>
          <option value="تكييف">تكييف</option>
          <option value="أبواب ونوافذ">أبواب ونوافذ</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">وصف المشكلة بدقة *</label>
        <textarea name="description" required rows={4} className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base"></textarea>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">إرفاق صورة للمشكلة (اختياري)</label>
        <div className="w-full border-gray-300 rounded-md p-2 border bg-gray-50 flex items-center">
          <input type="file" name="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
        </div>
        <p className="text-xs text-gray-500 mt-2">الحد الأقصى 5 ميجابايت (JPG, PNG, PDF)</p>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-md font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري إرسال الطلب...
            </>
          ) : "إرسال طلب الصيانة"}
        </button>
      </div>
    </form>
  );
}
