"use client";

import LeadForm from "@/components/LeadForm";
import { isValidPhone, isValidEmail } from "@/lib/contact-helpers";

interface ModernContactProps {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
}

export default function ModernContact({
  contactPhone,
  contactEmail,
  address,
}: ModernContactProps) {
  const hasPhone = isValidPhone(contactPhone);
  const hasEmail = isValidEmail(contactEmail);
  const hasAddress = Boolean(address && address.trim());

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#F7F3EB] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4F4949] mb-4">
            سجل اهتمامك للمشروع
          </h2>
          <p className="text-[#4F4949]/80 text-base font-light leading-relaxed">
            فريقنا العقاري المباشر جاهز للرد على كافة استفساراتك واطلاعك على تفاصيل المشاريع والفرص المتاحة.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${hasPhone || hasEmail || hasAddress ? "lg:grid-cols-12" : "max-w-2xl mx-auto"} gap-12 items-start`}>
          {/* Contact Info Side — Render only if valid contact details exist */}
          {(hasPhone || hasEmail || hasAddress) && (
            <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-2xl border border-[#A6937C]/15 shadow-sm space-y-8">
              <h3 className="text-2xl font-bold text-[#4F4949]">معلومات التواصل المباشرة</h3>

              <div className="space-y-6 text-[#4F4949]">
                {hasAddress && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] flex items-center justify-center text-[#A6937C] shrink-0 border border-[#A6937C]/20">
                      <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">العنوان</h4>
                      <p className="text-sm text-[#4F4949]/80">{address}</p>
                    </div>
                  </div>
                )}

                {hasPhone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] flex items-center justify-center text-[#A6937C] shrink-0 border border-[#A6937C]/20">
                      <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">الهاتف</h4>
                      <a href={`tel:${contactPhone}`} className="text-sm font-bold text-[#A6937C] hover:underline" dir="ltr">
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {hasEmail && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F3EB] flex items-center justify-center text-[#A6937C] shrink-0 border border-[#A6937C]/20">
                      <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">البريد الإلكتروني</h4>
                      <a href={`mailto:${contactEmail}`} className="text-sm text-[#A6937C] hover:underline">
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lead Registration Form */}
          <div className={`${hasPhone || hasEmail || hasAddress ? "lg:col-span-7" : "w-full"} bg-white p-8 md:p-10 rounded-2xl border border-[#A6937C]/15 shadow-sm`}>
            <h3 className="text-2xl font-bold text-[#4F4949] text-center mb-2">تسجيل الاهتمام</h3>
            <p className="text-center text-sm text-[#B5B693] font-medium mb-8">
              قم بتعبئة النموذج وسيتواصل معك مستشارنا العقاري في أقرب وقت.
            </p>
            <LeadForm formType="HOMEPAGE_EXACT_MATCH" />
          </div>
        </div>
      </div>
    </section>
  );
}
