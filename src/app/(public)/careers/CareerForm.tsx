"use client";

import { useState } from "react";
import { submitCareer } from "@/actions/forms";
import { useRouter } from "next/navigation";

export default function CareerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setError("يرجى إرفاق السيرة الذاتية");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload CV
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "careers");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || "فشل رفع السيرة الذاتية");
      }

      const { url } = await uploadRes.json();

      // 2. Submit Data
      const data = {
        fullName: formData.get("fullName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        position: formData.get("position"),
        experienceYears: formData.get("experienceYears"),
        city: formData.get("city"),
        linkedInUrl: formData.get("linkedInUrl"),
        notes: formData.get("notes"),
        resumeUrl: url,
      };

      await submitCareer(data);
      import('@/lib/events').then(({ trackEvent }) => {
        trackEvent("form_submit", { formType: "CAREER" });
      }).catch(err => console.error(err));
      router.push("/thank-you/careers");
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
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">البريد الإلكتروني *</label>
          <input type="email" name="email" dir="ltr" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="example@email.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">المسمى الوظيفي المتقدم له *</label>
          <input type="text" name="position" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: مستشار مبيعات" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">سنوات الخبرة</label>
          <input type="number" name="experienceYears" min="0" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: 3" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">المدينة</label>
          <input type="text" name="city" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: الرياض" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">رابط LinkedIn (اختياري)</label>
          <input type="url" name="linkedInUrl" dir="ltr" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">السيرة الذاتية (PDF, DOC) *</label>
        <div className="w-full border-gray-300 rounded-md p-2 border bg-gray-50 flex items-center">
          <input type="file" name="file" accept=".pdf,.doc,.docx" required className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
        </div>
        <p className="text-xs text-gray-500 mt-2">الحد الأقصى 5 ميجابايت</p>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نبذة عنك أو رسالة تغطية (اختياري)</label>
        <textarea name="notes" rows={3} className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base"></textarea>
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
          ) : "تقديم الطلب"}
        </button>
      </div>
    </form>
  );
}
