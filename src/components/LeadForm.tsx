"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LeadFormProps {
  projectId?: string;
  projectSlug?: string;
  formType?: string;
}

export default function LeadForm({ projectId, projectSlug, formType = "GENERAL" }: LeadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [utmData, setUtmData] = useState<any>({});

  useEffect(() => {
    // Capture UTM and Tracking Data on mount
    const urlParams = new URLSearchParams(window.location.search);
    setUtmData({
      utmSource: urlParams.get("utm_source") || "",
      utmMedium: urlParams.get("utm_medium") || "",
      utmCampaign: urlParams.get("utm_campaign") || "",
      utmContent: urlParams.get("utm_content") || "",
      utmTerm: urlParams.get("utm_term") || "",
      landingPageUrl: window.location.href,
      referrer: document.referrer || "",
      deviceType: /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? "Mobile" : "Desktop",
      platform: navigator.platform,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      ...utmData,
      projectId,
      formType,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        import('@/lib/events').then(({ trackEvent }) => {
          trackEvent("form_submit", { formType, projectId });
        }).catch(err => console.error(err));

        if (projectSlug) {
          router.push(`/thank-you/project/${projectSlug}`);
        } else {
          router.push("/thank-you/general");
        }
      } else {
        setError(result.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm md:text-base mb-4 border border-red-100">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
        <input type="text" id="name" name="name" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base" placeholder="محمد أحمد" />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">رقم الجوال *</label>
        <input type="tel" id="phone" name="phone" required pattern="^[+\d\s]{9,20}$" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base" placeholder="05XXXXXXXX" dir="ltr" />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
        <input type="email" id="email" name="email" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base" placeholder="example@email.com" dir="ltr" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="propertyType" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نوع العقار المهتم به</label>
          <select id="propertyType" name="propertyType" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base bg-white">
            <option value="غير محدد">غير محدد</option>
            <option value="شقة">شقة</option>
            <option value="فيلا">فيلا</option>
            <option value="دور">دور</option>
            <option value="تاون هاوس">تاون هاوس</option>
          </select>
        </div>
        <div>
          <label htmlFor="preferredContactMethod" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">التواصل المفضل</label>
          <select id="preferredContactMethod" name="preferredContactMethod" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base bg-white">
            <option value="اتصال">اتصال</option>
            <option value="واتساب">واتساب</option>
            <option value="بريد إلكتروني">بريد إلكتروني</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">رسالتك (اختياري)</label>
        <textarea id="message" name="message" rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 border text-base" placeholder="هل لديك أي استفسارات أو ملاحظات إضافية؟"></textarea>
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-lg mt-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري الإرسال...
          </>
        ) : "إرسال الطلب"}
      </button>
    </form>
  );
}
