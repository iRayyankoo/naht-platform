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
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 pb-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm md:text-base border border-red-200 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
          <input type="text" name="name" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="اكتب اسمك الكامل" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">رقم الجوال <span className="text-red-500">*</span></label>
          <input type="tel" name="phone" dir="ltr" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-base transition-colors" placeholder="05xxxxxxxx" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">البريد الإلكتروني (اختياري)</label>
          <input type="email" name="email" dir="ltr" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-base transition-colors" placeholder="example@email.com" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">نوع الفرصة <span className="text-red-500">*</span></label>
          <select name="opportunityType" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors">
            <option value="">-- اختر نوع الفرصة --</option>
            <option value="شراكة استراتيجية">شراكة استراتيجية</option>
            <option value="تطوير أرض">تطوير أرض</option>
            <option value="استثمار نقدي">استثمار نقدي</option>
            <option value="فرصة بيع جملة">فرصة بيع جملة</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">المدينة <span className="text-red-500">*</span></label>
          <input type="text" name="city" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="مثال: جدة" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">الحي <span className="text-red-500">*</span></label>
          <input type="text" name="district" required className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="مثال: الشاطئ" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">موقع العقار (رابط Maps)</label>
          <input type="url" name="propertyLocation" dir="ltr" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-right text-base transition-colors" placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">مساحة الأرض (متر مربع)</label>
          <input type="number" name="landArea" min="0" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors" placeholder="مثال: 500" />
        </div>
        <div>
          <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">نوع الملكية</label>
          <select name="propertyOwnership" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors">
            <option value="">-- غير محدد --</option>
            <option value="مالك مباشر">أنا المالك المباشر</option>
            <option value="وسيط معتمد">وسيط معتمد</option>
            <option value="وكيل">وكيل عن المالك</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm md:text-base font-bold text-gray-800 mb-2">ملاحظات أو وصف إضافي (اختياري)</label>
        <textarea name="notes" rows={4} className="w-full bg-gray-50 border-gray-200 rounded-lg p-3.5 md:p-4 border focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-base transition-colors resize-y" placeholder="اكتب ملاحظاتك أو تفاصيل الفرصة هنا..."></textarea>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark hover:-translate-y-0.5 text-white px-6 py-4 rounded-lg font-bold text-lg disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg shadow-primary/20">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري إرسال الفرصة...
            </>
          ) : (
            <>
              إرسال الفرصة للدراسة
              <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
