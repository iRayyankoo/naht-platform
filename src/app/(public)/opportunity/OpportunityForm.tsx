"use client";

import { useState, useEffect } from "react";
import { submitOpportunity } from "@/actions/forms";
import { useRouter } from "next/navigation";

export default function OpportunityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utmData, setUtmData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
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
      opportunityType: formData.get("opportunityType"),
      city: formData.get("city"),
      district: formData.get("district"),
      propertyLocation: formData.get("propertyLocation"),
      landArea: formData.get("landArea"),
      propertyOwnership: formData.get("propertyOwnership"),
      notes: formData.get("notes"),
      ...utmData
    };

    try {
      await submitOpportunity(data);
      import('@/lib/events').then(({ trackEvent }) => {
        trackEvent("form_submit", { formType: "REAL_ESTATE_OPPORTUNITY" });
      }).catch(err => console.error(err));
      router.push("/thank-you/opportunity");
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
          <input type="text" name="name" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">رقم الجوال *</label>
          <input type="tel" name="phone" dir="ltr" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="05xxxxxxxx" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">البريد الإلكتروني (اختياري)</label>
          <input type="email" name="email" dir="ltr" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="example@email.com" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نوع الفرصة *</label>
          <select name="opportunityType" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base bg-white">
            <option value="">-- اختر نوع الفرصة --</option>
            <option value="شراكة استراتيجية">شراكة استراتيجية</option>
            <option value="تطوير أرض">تطوير أرض</option>
            <option value="استثمار نقدي">استثمار نقدي</option>
            <option value="فرصة بيع جملة">فرصة بيع جملة</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">المدينة *</label>
          <input type="text" name="city" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: جدة" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">الحي *</label>
          <input type="text" name="district" required className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: الشاطئ" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">موقع العقار (رابط Maps)</label>
          <input type="url" name="propertyLocation" dir="ltr" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-right text-base" placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">مساحة الأرض (متر مربع)</label>
          <input type="number" name="landArea" min="0" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base" placeholder="مثال: 500" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">نوع الملكية</label>
          <select name="propertyOwnership" className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base bg-white">
            <option value="">-- غير محدد --</option>
            <option value="مالك مباشر">أنا المالك المباشر</option>
            <option value="وسيط معتمد">وسيط معتمد</option>
            <option value="وكيل">وكيل عن المالك</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5">ملاحظات أو وصف إضافي (اختياري)</label>
        <textarea name="notes" rows={4} className="w-full border-gray-300 rounded-md p-3 md:p-3.5 border focus:ring-primary focus:border-primary text-base"></textarea>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-md font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري إرسال الفرصة...
            </>
          ) : "إرسال الفرصة للدراسة"}
        </button>
      </div>
    </form>
  );
}
