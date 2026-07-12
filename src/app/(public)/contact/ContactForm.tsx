"use client";

import { useState, useEffect } from "react";
import { submitContactUs } from "@/actions/forms";
import { useRouter } from "next/navigation";

interface ContactFormProps {
  submitButtonText?: string;
  helperText?: string;
}

export default function ContactForm({ submitButtonText, helperText }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utmData, setUtmData] = useState<Record<string, string | null>>({});
  const router = useRouter();

  useEffect(() => {
    // Capture UTM parameters and Referrer
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const phoneVal = formData.get("phone") as string;

    if (!/^05\d{8}$/.test(phoneVal)) {
      setError("يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05");
      setIsSubmitting(false);
      return;
    }

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقاً.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 w-full min-w-0 max-w-none">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm md:text-base border border-red-200 flex items-center gap-3 w-full">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <div className="w-full min-w-0">
        <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
        <input type="text" name="name" required className="w-full bg-gray-50/50 border-gray-200 rounded-xl px-4 py-3 min-h-[50px] border focus:bg-white focus:ring-2 focus:ring-brand-cafe/20 focus:border-brand-cafe text-base text-gray-900 transition-colors" placeholder="اكتب اسمك الكامل" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full min-w-0">
        <div className="w-full min-w-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال <span className="text-red-500">*</span></label>
          <input type="tel" name="phone" dir="ltr" required pattern="^05\d{8}$" className="w-full bg-gray-50/50 border-gray-200 rounded-xl px-4 py-3 min-h-[50px] border focus:bg-white focus:ring-2 focus:ring-brand-cafe/20 focus:border-brand-cafe text-right text-base text-gray-900 transition-colors" placeholder="05xxxxxxxx" />
        </div>
        <div className="w-full min-w-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
          <input type="email" name="email" dir="ltr" className="w-full bg-gray-50/50 border-gray-200 rounded-xl px-4 py-3 min-h-[50px] border focus:bg-white focus:ring-2 focus:ring-brand-cafe/20 focus:border-brand-cafe text-right text-base text-gray-900 transition-colors" placeholder="example@email.com" />
        </div>
      </div>

      <div className="w-full min-w-0">
        <label className="block text-sm font-bold text-gray-700 mb-2">نوع الاستفسار <span className="text-red-500">*</span></label>
        <select name="inquiryType" required className="w-full bg-gray-50/50 border-gray-200 rounded-xl px-4 py-3 min-h-[50px] border focus:bg-white focus:ring-2 focus:ring-brand-cafe/20 focus:border-brand-cafe text-base text-gray-900 transition-colors">
          <option value="">-- اختر نوع الاستفسار --</option>
          <option value="استفسار عام">استفسار عام</option>
          <option value="مبيعات المشاريع">مبيعات المشاريع</option>
          <option value="اقتراح">اقتراح أو شكوى</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      <div className="w-full min-w-0">
        <label className="block text-sm font-bold text-gray-700 mb-2">الرسالة <span className="text-red-500">*</span></label>
        <textarea name="message" required className="w-full bg-gray-50/50 border-gray-200 rounded-xl px-4 py-3 min-h-[130px] border focus:bg-white focus:ring-2 focus:ring-brand-cafe/20 focus:border-brand-cafe text-base text-gray-900 transition-colors resize-y" placeholder="اكتب رسالتك أو استفسارك هنا..."></textarea>
      </div>

      <div className="pt-2 w-full min-w-0">
        {helperText && (
          <p className="text-sm text-gray-500 mb-4 text-center w-full">{helperText}</p>
        )}
        <button type="submit" disabled={isSubmitting} className="w-full min-h-[52px] bg-brand-cafe hover:bg-[#B3932F] hover:-translate-y-0.5 text-white px-6 py-3 rounded-xl font-bold text-lg disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg shadow-brand-cafe/20 whitespace-nowrap">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الإرسال...
            </>
          ) : (
            <>
              {submitButtonText || "إرسال الرسالة"}
              <svg className="w-5 h-5 mr-2 rtl:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
