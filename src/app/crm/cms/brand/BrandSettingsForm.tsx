"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/actions/cms";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/crm/ImageUpload";

export default function BrandSettingsForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state just for the preview functionality
  const [previewData, setPreviewData] = useState({
    siteName: initialData?.siteName || "",
    brandTagline: initialData?.brandTagline || "",
    primaryColor: initialData?.primaryColor || "",
    secondaryColor: initialData?.secondaryColor || "",
    accentColor: initialData?.accentColor || "",
    darkBgColor: initialData?.darkBgColor || "",
    buttonColor: initialData?.buttonColor || "",
    textColor: initialData?.textColor || "",
    borderColor: initialData?.borderColor || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateHex = (val: string) => {
    if (!val) return true;
    return /^#([0-9A-F]{3}){1,2}$/i.test(val);
  };

  const handleResetToDefault = async () => {
    if (!confirm("هل أنت متأكد من استعادة الألوان الافتراضية؟ سيتم مسح قيم الألوان الحالية والرجوع لهوية (نحت) الأساسية.")) return;
    
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...initialData,
        primaryColor: null,
        secondaryColor: null,
        accentColor: null,
        darkBgColor: null,
        buttonColor: null,
        textColor: null,
        borderColor: null,
      };
      
      await updateSiteSettings(dataToSave);
      toast.success("تمت استعادة الألوان الافتراضية بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("حدث خطأ أثناء الاستعادة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validate hex colors
    const colorsToValidate = [
      data.primaryColor as string, data.secondaryColor as string, data.accentColor as string, 
      data.darkBgColor as string, data.buttonColor as string, data.textColor as string, data.borderColor as string
    ];
    for (const color of colorsToValidate) {
      if (color && !validateHex(color)) {
        toast.error("اللون غير صحيح، يجب أن يكون Hex Code مثل #C9A46A");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = { ...data };
      ['primaryColor', 'secondaryColor', 'accentColor', 'darkBgColor', 'buttonColor', 'textColor', 'borderColor'].forEach(key => {
        if (payload[key] === "") payload[key] = null;
      });

      await updateSiteSettings(payload);
      toast.success("تم تحديث الهوية بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color Field Component for Premium Look
  const ColorField = ({ name, label, description }: { name: keyof typeof previewData, label: string, description?: string }) => (
    <div className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors">
      <div>
        <label className="block text-sm font-semibold text-gray-800">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <div 
          className="w-12 h-12 rounded-full shadow-inner border border-gray-200 overflow-hidden shrink-0 relative cursor-pointer"
        >
          <input
            type="color"
            value={previewData[name] || "#ffffff"}
            onChange={(e) => setPreviewData(prev => ({ ...prev, [name]: e.target.value }))}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-0 cursor-pointer"
          />
          <div 
            className="w-full h-full pointer-events-none" 
            style={{ backgroundColor: previewData[name] || "#e5e7eb" }} 
          />
        </div>
        <input
          name={name}
          value={previewData[name]}
          onChange={handleChange}
          className="flex-1 w-full text-sm font-mono tracking-widest text-left dir-ltr bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase"
          placeholder="#FFFFFF"
          dir="ltr"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto flex flex-col gap-8">
      
      {/* 1. Premium Preview */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-800 group">
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: previewData.darkBgColor || "#0a0a0a" }}
        ></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="relative z-10 px-8 py-20 flex flex-col items-center justify-center text-center gap-8 backdrop-blur-sm">
          <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-md border" style={{ borderColor: previewData.borderColor || "rgba(255,255,255,0.1)" }}>
            {initialData?.logoDarkUrl || initialData?.logoUrl ? (
              <img src={initialData?.logoDarkUrl || initialData?.logoUrl} alt="Logo" className="h-16 object-contain drop-shadow-lg" />
            ) : (
              <div className="text-white font-serif text-3xl md:text-4xl font-bold tracking-wide">{previewData.siteName || "نحت للأصول العقارية"}</div>
            )}
          </div>
          
          <p 
            className="text-lg md:text-xl font-light max-w-2xl leading-relaxed tracking-wide"
            style={{ color: previewData.textColor || "#cbd5e1" }}
          >
            {previewData.brandTagline || "نبني مساحات تلهم الحياة وترتقي بجودة المعيشة نحو آفاق جديدة بتصاميم استثنائية."}
          </p>
          
          <div className="pt-4">
            <button 
              type="button"
              className="px-10 py-4 rounded-full font-bold tracking-widest text-sm uppercase transition-transform hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: previewData.buttonColor || previewData.primaryColor || "#C9A46A",
                color: "#ffffff",
                boxShadow: `0 10px 25px -5px ${previewData.buttonColor || previewData.primaryColor || "#C9A46A"}60`
              }}
            >
              استكشف مشاريعنا
            </button>
          </div>
        </div>
      </div>

      {/* 2. Brand Identity Texts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-900">هوية النصوص الأساسية</h2>
          <p className="text-gray-500 text-sm mt-1">الاسم الأساسي والشعار النصي (Tagline) الذي يعبر عن العلامة التجارية.</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الموقع / الشركة</label>
            <input
              name="siteName"
              value={previewData.siteName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900"
              placeholder="شركة نحت الأصول العقارية"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الشعار النصي (Tagline)</label>
            <input
              name="brandTagline"
              value={previewData.brandTagline}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900"
              placeholder="شغف التفاصيل وروعة التصميم"
            />
          </div>
        </div>
      </div>

      {/* 3. Logos & Imagery */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-900">أصول الشعار (Logos)</h2>
          <p className="text-gray-500 text-sm mt-1">قم برفع النسخ المتعددة من الشعار لتتناسب مع جميع الخلفيات والأحجام.</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col">
              <div className="mb-4">
                <span className="inline-flex items-center justify-center p-2 bg-white rounded-lg shadow-sm border border-gray-100 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </span>
                <h3 className="font-bold text-gray-900">الشعار الفاتح</h3>
                <p className="text-xs text-gray-500 mt-1">يُعرض على الخلفيات الفاتحة والبيضاء.</p>
              </div>
              <div className="mt-auto">
                <ImageUpload name="logoUrl" defaultValue={initialData?.logoUrl || ""} label="" />
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col">
              <div className="mb-4">
                <span className="inline-flex items-center justify-center p-2 bg-gray-800 rounded-lg border border-gray-700 mb-3">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                </span>
                <h3 className="font-bold text-white">الشعار الداكن</h3>
                <p className="text-xs text-gray-400 mt-1">يُعرض على الخلفيات الداكنة والوضع الليلي.</p>
              </div>
              <div className="mt-auto theme-dark">
                <ImageUpload name="logoDarkUrl" defaultValue={initialData?.logoDarkUrl || ""} label="" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col">
              <div className="mb-4">
                <span className="inline-flex items-center justify-center p-2 bg-white rounded-lg shadow-sm border border-gray-100 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </span>
                <h3 className="font-bold text-gray-900">الأيقونة المصغرة</h3>
                <p className="text-xs text-gray-500 mt-1">Favicon لعلامات تبويب المتصفح.</p>
              </div>
              <div className="mt-auto">
                <ImageUpload name="faviconUrl" defaultValue={initialData?.faviconUrl || ""} label="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Color Palette */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">لوحة الألوان (Brand Palette)</h2>
            <p className="text-gray-500 text-sm mt-1">تخصيص الألوان الأساسية للمنصة (Hex Codes).</p>
          </div>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-sm px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg font-medium transition-colors border border-red-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            استعادة الافتراضي
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorField name="primaryColor" label="اللون الأساسي (Primary)" description="للعناصر البارزة والهوية العامة." />
            <ColorField name="secondaryColor" label="اللون الثانوي (Secondary)" description="للعناصر الثانوية والهوامش." />
            <ColorField name="accentColor" label="لون التمييز (Accent)" description="للأيقونات والتنبيهات الخاصة." />
            <ColorField name="buttonColor" label="لون الأزرار (Buttons)" description="لون أزرار الدعوة للإجراء CTA." />
            <ColorField name="darkBgColor" label="لون الخلفيات الداكنة" description="لخلفيات العرض والأقسام المظلمة." />
            <ColorField name="textColor" label="لون النصوص الأساسية" description="لون النصوص على الخلفيات الداكنة." />
            <ColorField name="borderColor" label="لون الحدود (Borders)" description="خطوط الفصل بين الأقسام." />
          </div>
        </div>
        
        {/* Card Footer Action Bar */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">سيتم تطبيق التغييرات فوراً على واجهة الموقع الرئيسية.</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                حفظ الهوية والتغييرات
              </>
            )}
          </button>
        </div>
      </div>
      
    </form>
  );
}
