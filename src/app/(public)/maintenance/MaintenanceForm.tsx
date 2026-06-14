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
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 pb-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm md:text-base border border-red-200 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
        <input type="text" name="fullName" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="اكتب اسمك الكامل" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">رقم الجوال <span className="text-red-500">*</span></label>
          <input type="tel" name="phone" dir="ltr" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-base transition-colors" placeholder="05xxxxxxxx" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">البريد الإلكتروني (اختياري)</label>
          <input type="email" name="email" dir="ltr" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-base transition-colors" placeholder="example@email.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">اسم المشروع أو الوحدة</label>
          <input type="text" name="projectOrUnit" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="مثال: مشروع نحت 15 - شقة 4" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">الوقت المناسب للتواصل</label>
          <input type="text" name="contactTime" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="مثال: بعد العصر" />
        </div>
      </div>

      <div>
        <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">نوع المشكلة <span className="text-red-500">*</span></label>
        <select name="issueType" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors">
          <option value="">-- اختر نوع المشكلة --</option>
          <option value="كهرباء">كهرباء</option>
          <option value="سباكة">سباكة</option>
          <option value="تكييف">تكييف</option>
          <option value="أبواب ونوافذ">أبواب ونوافذ</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div>
        <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">وصف المشكلة بدقة <span className="text-red-500">*</span></label>
        <textarea name="description" required rows={4} className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors resize-y" placeholder="اشرح تفاصيل المشكلة لتسهيل معالجتها..."></textarea>
      </div>

      <div>
        <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">إرفاق صورة للمشكلة (اختياري)</label>
        <div className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-white transition-colors focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          <input type="file" name="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300 cursor-pointer text-sm" />
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">الحد الأقصى 5 ميجابايت (JPG, PNG, PDF)</p>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark hover:-translate-y-0.5 text-white px-6 py-4 rounded-lg font-bold text-lg disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg shadow-primary/20">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري إرسال الطلب...
            </>
          ) : (
            <>
              إرسال طلب الصيانة
              <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
