"use client";

import React, { useState } from "react";
import { isValidPhone, isValidEmail } from "@/lib/contact-helpers";

interface ModernContactProps {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
}

export default function ModernContact({ contactPhone, contactEmail, address }: ModernContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "buy",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasValidPh = isValidPhone(contactPhone);
  const hasValidEm = isValidEmail(contactEmail);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          interest: "buy",
          message: ""
        });
      }, 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-[#05070a] relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            تواصل <span className="text-brand-cafe">معنا</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            فريقنا جاهز للرد على استفساراتك وتقديم الاستشارة العقارية التي تحتاجها.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">معلومات التواصل</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                سواء كنت تبحث عن عقار أحلامك، أو ترغب في استثمار عقاري ناجح، نحن هنا لمساعدتك في كل خطوة.
              </p>
            </div>

            <div className="space-y-6">
              {address && address.trim() !== "" && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
                    <svg className="w-6 h-6 text-brand-cafe" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">المقر الرئيسي</h4>
                    <p className="text-gray-400">{address}</p>
                  </div>
                </div>
              )}

              {hasValidPh && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
                    <svg className="w-6 h-6 text-brand-cafe" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">الهاتف</h4>
                    <p className="text-gray-400" dir="ltr">{contactPhone}</p>
                  </div>
                </div>
              )}

              {hasValidEm && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
                    <svg className="w-6 h-6 text-brand-cafe" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">البريد الإلكتروني</h4>
                    <a href={`mailto:${contactEmail}`} className="text-gray-400 hover:text-white transition-colors">{contactEmail}</a>
                  </div>
                </div>
              )}

            </div>

            
            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-cafe/10 group-hover:bg-brand-cafe/20 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500 font-medium">خريطة الموقع التفاعلية</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#0b0f19] p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cafe/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8 relative z-10">أرسل رسالة</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">الاسم الكريم</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#151a25] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cafe transition-colors"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">رقم الجوال</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#151a25] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cafe transition-colors text-right"
                    placeholder="05x xxx xxxx"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#151a25] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cafe transition-colors"
                    placeholder="example@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">نوع الاهتمام</label>
                  <select 
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full bg-[#151a25] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cafe transition-colors appearance-none"
                  >
                    <option value="buy">شراء عقار</option>
                    <option value="sell">بيع عقار</option>
                    <option value="rent">استئجار</option>
                    <option value="manage">إدارة أملاك</option>
                    <option value="other">استفسار عام</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium block">الرسالة</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-[#151a25] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cafe transition-colors resize-none"
                  placeholder="كيف يمكننا مساعدتك؟"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || submitted}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  submitted 
                    ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                    : isSubmitting
                    ? "bg-brand-cafe/70 text-white cursor-not-allowed"
                    : "bg-brand-cafe text-white hover:bg-yellow-600 shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)]"
                }`}
              >
                {submitted ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    تم الإرسال بنجاح
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال الطلب
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
}
