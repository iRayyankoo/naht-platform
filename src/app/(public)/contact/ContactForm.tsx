"use client";

import { useState, useEffect } from "react";
import { submitContactUs } from "@/actions/forms";
import { useRouter } from "next/navigation";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utmData, setUtmData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    // Capture UTM parameters and Referrer
    const params = new URLSearchParams(window.location.search);
    setUtmData({
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmContent: params.get("utm_content"),
      utmTerm: params.get("utm_term"),
      landingPageUrl: window.location.pathname + window.location.search,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      inquiryType: formData.get("inquiryType"),
      message: formData.get("message"),
      ...utmData
    };

    try {
      await submitContactUs(data);
      import('@/lib/events').then(({ trackEvent }) => {
        trackEvent("form_submit", { formType: "CONTACT_US" });
      }).catch(err => console.error(err));
      router.push("/thank-you/contact");
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
        <input type="text" name="name" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="اكتب اسمك الكامل" />
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

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نوع الاستفسار *</label>
        <select name="inquiryType" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base bg-white">
          <option value="">-- اختر نوع الاستفسار --</option>
          <option value="استفسار عام">استفسار عام</option>
          <option value="مبيعات المشاريع">مبيعات المشاريع</option>
          <option value="اقتراح">اقتراح أو شكوى</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الرسالة *</label>
        <textarea name="message" required rows={4} className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="اكتب رسالتك أو استفسارك هنا..."></textarea>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-md font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الإرسال...
            </>
          ) : "إرسال الرسالة"}
        </button>
      </div>
    </form>
  );
}
