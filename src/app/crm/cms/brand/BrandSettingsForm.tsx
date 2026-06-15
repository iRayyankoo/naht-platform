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

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-20">
      
      {/* معاينة سريعة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">معاينة الهوية (Preview)</h2>
        <div 
          className="p-8 rounded-xl flex flex-col items-center justify-center gap-6 border"
          style={{ 
            backgroundColor: previewData.darkBgColor || "#050505",
            borderColor: previewData.borderColor || "rgba(255,255,255,0.1)",
          }}
        >
          {initialData?.logoDarkUrl || initialData?.logoUrl ? (
            <img src={initialData?.logoDarkUrl || initialData?.logoUrl} alt="Logo" className="h-12 object-contain" />
          ) : (
            <div className="text-white font-serif text-2xl">{previewData.siteName || "نحت للأصول العقارية"}</div>
          )}
          
          <p style={{ color: previewData.textColor || "#cbd5e1" }} className="text-center font-light">
            {previewData.brandTagline || "نبني مساحات تلهم الحياة وترتقي بجودة المعيشة نحو آفاق جديدة بتصاميم استثنائية."}
          </p>
          
          <button 
            type="button"
            className="px-8 py-3 rounded-3xl font-bold tracking-widest text-sm"
            style={{ 
              backgroundColor: previewData.buttonColor || previewData.primaryColor || "#C9A46A",
              color: "#ffffff"
            }}
          >
            تصفح مشاريعنا
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* النصوص */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">النصوص الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموقع / الشركة</label>
              <input
                name="siteName"
                value={previewData.siteName}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
                placeholder="شركة نحت الأصول العقارية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النص المختصر (Tagline)</label>
              <input
                name="brandTagline"
                value={previewData.brandTagline}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
                placeholder="شغف التفاصيل وروعة التصميم"
              />
            </div>
          </div>
        </div>

        {/* الشعارات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">الشعارات (Logos)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                name="logoUrl"
                defaultValue={initialData?.logoUrl || ""}
                label="الشعار الأساسي (الخلفيات الفاتحة)"
              />
            </div>
            <div>
              <ImageUpload
                name="logoDarkUrl"
                defaultValue={initialData?.logoDarkUrl || ""}
                label="الشعار الداكن (الخلفيات الداكنة)"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                name="faviconUrl"
                defaultValue={initialData?.faviconUrl || ""}
                label="الأيقونة المصغرة (Favicon)"
              />
            </div>
          </div>
        </div>

        {/* الألوان */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">الألوان (Hex Codes)</h2>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              استعادة الألوان الافتراضية
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اللون الأساسي (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.primaryColor || "#C9A46A"}
                  onChange={(e) => setPreviewData(prev => ({...prev, primaryColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="primaryColor"
                  value={previewData.primaryColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#C9A46A"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اللون الثانوي (Secondary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.secondaryColor || "#1f2937"}
                  onChange={(e) => setPreviewData(prev => ({...prev, secondaryColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="secondaryColor"
                  value={previewData.secondaryColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#1f2937"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون التمييز (Accent)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.accentColor || "#D4AF37"}
                  onChange={(e) => setPreviewData(prev => ({...prev, accentColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="accentColor"
                  value={previewData.accentColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#D4AF37"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون الخلفيات الداكنة</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.darkBgColor || "#050505"}
                  onChange={(e) => setPreviewData(prev => ({...prev, darkBgColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="darkBgColor"
                  value={previewData.darkBgColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#050505"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون الأزرار</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.buttonColor || "#C9A46A"}
                  onChange={(e) => setPreviewData(prev => ({...prev, buttonColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="buttonColor"
                  value={previewData.buttonColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#C9A46A"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون النصوص الأساسية</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.textColor || "#111827"}
                  onChange={(e) => setPreviewData(prev => ({...prev, textColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="textColor"
                  value={previewData.textColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#111827"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون الحدود (Borders)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={previewData.borderColor || "#e5e7eb"}
                  onChange={(e) => setPreviewData(prev => ({...prev, borderColor: e.target.value}))}
                  className="w-10 h-10 rounded border-0 p-0"
                />
                <input
                  name="borderColor"
                  value={previewData.borderColor}
                  onChange={handleChange}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary font-mono text-left dir-ltr"
                  placeholder="#e5e7eb"
                  dir="ltr"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ الهوية"}
        </button>
      </div>
    </form>
  );
}
