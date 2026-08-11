"use client";

import { useState } from "react";
import ImageUpload from "@/components/crm/ImageUpload";

export interface ProjectFeature {
  id?: string;
  title: string;
  desc?: string | null;
  icon?: string | null;
  order?: number;
}

export interface ProjectWarranty {
  id?: string;
  title: string;
  desc?: string | null;
  duration?: string | null;
  order?: number;
}

export interface ProjectGalleryImage {
  id?: string;
  url: string;
  alt?: string | null;
  order?: number;
}

export interface ProjectInitialData {
  id?: string;
  name?: string;
  slug?: string;
  type?: string;
  city?: string;
  neighborhood?: string;
  status?: string;
  shortDesc?: string | null;
  fullDesc?: string | null;
  price?: number | string | null;
  area?: number | string | null;
  rooms?: number | string | null;
  baths?: number | string | null;
  progressPercent?: number | string | null;
  progressLabel?: string | null;
  mainImage?: string | null;
  planImage?: string | null;
  pdfUrl?: string | null;
  locationText?: string | null;
  googleMapsUrl?: string | null;
  showOnHomeMap?: boolean | null;
  mapLat?: number | string | null;
  mapLng?: number | string | null;
  mapX?: number | string | null;
  mapY?: number | string | null;
  isVisible?: boolean | null;
  isFeatured?: boolean | null;
  features?: ProjectFeature[];
  warranties?: ProjectWarranty[];
  galleryImages?: ProjectGalleryImage[];
  [key: string]: unknown;
}

interface ProjectFormFieldsProps {
  initialData?: ProjectInitialData;
}

export default function ProjectFormFields({ initialData }: ProjectFormFieldsProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Dynamic Lists State
  const [features, setFeatures] = useState<ProjectFeature[]>(initialData?.features || []);
  const [warranties, setWarranties] = useState<ProjectWarranty[]>(initialData?.warranties || []);
  const [galleryImages, setGalleryImages] = useState<ProjectGalleryImage[]>(initialData?.galleryImages || []);

  const addFeature = () => setFeatures([...features, { title: "", desc: "", icon: "" }]);
  const updateFeature = (index: number, key: keyof ProjectFeature, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [key]: value };
    setFeatures(newFeatures);
  };
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const addWarranty = () => setWarranties([...warranties, { title: "", desc: "", duration: "" }]);
  const updateWarranty = (index: number, key: keyof ProjectWarranty, value: string) => {
    const newWarranties = [...warranties];
    newWarranties[index] = { ...newWarranties[index], [key]: value };
    setWarranties(newWarranties);
  };
  const removeWarranty = (index: number) => setWarranties(warranties.filter((_, i) => i !== index));

  const addGalleryImage = () => setGalleryImages([...galleryImages, { url: "", alt: "" }]);
  const updateGalleryImageUrl = (index: number, url: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], url };
    setGalleryImages(newGallery);
  };
  const updateGalleryImageAlt = (index: number, alt: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], alt };
    setGalleryImages(newGallery);
  };
  const removeGalleryImage = (index: number) => setGalleryImages(galleryImages.filter((_, i) => i !== index));

  const tabs = [
    { id: "basic",    label: "الأساسيات",          icon: "📋" },
    { id: "details",  label: "التفاصيل",            icon: "📝" },
    { id: "media",    label: "الصور والملفات",       icon: "🖼" },
    { id: "location", label: "الموقع",              icon: "📍" },
    { id: "features", label: "المميزات والضمانات",   icon: "✨" },
    { id: "publish",  label: "النشر والمعاينة",      icon: "⚙" },
  ];

  return (
    <div>
      {/* Hidden inputs for JSON data */}
      <input type="hidden" name="features" value={JSON.stringify(features)} />
      <input type="hidden" name="warranties" value={JSON.stringify(warranties)} />
      <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />

      {/* Tabs Header */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">

        {/* ─────────────────────────────────────────────
            TAB 1: الأساسيات
        ───────────────────────────────────────────── */}
        <div className={`space-y-6 ${activeTab === "basic" ? "block" : "hidden"}`}>
          <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-6">

            {/* اسم المشروع */}
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">اسم المشروع <span className="text-red-500">*</span></label>
              <input type="text" name="name" required defaultValue={initialData?.name}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">رابط المشروع (Slug) <span className="text-red-500">*</span></label>
              <input type="text" name="slug" required defaultValue={initialData?.slug} placeholder="naht-plots"
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" dir="ltr" />
              <p className="text-xs text-amber-600 mt-1">⚠ لا يُنصح بتغيير هذا الرابط بعد نشر المشروع.</p>
            </div>

            {/* النوع */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">نوع العقار</label>
              <select name="type" defaultValue={initialData?.type || "فيلا"}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]">
                <option value="فيلا">فيلا</option>
                <option value="شقة">شقة</option>
                <option value="دور">دور</option>
                <option value="تاون هاوس">تاون هاوس</option>
                <option value="أرض">أرض</option>
                <option value="تجاري">تجاري</option>
              </select>
            </div>

            {/* المدينة */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">المدينة <span className="text-red-500">*</span></label>
              <input type="text" name="city" required defaultValue={initialData?.city || "الرياض"}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>

            {/* الحي */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">الحي <span className="text-red-500">*</span></label>
              <input type="text" name="neighborhood" required defaultValue={initialData?.neighborhood}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>

            {/* الحالة */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">حالة المشروع</label>
              <select name="status" defaultValue={initialData?.status || "AVAILABLE"}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]">
                <option value="AVAILABLE">🟢 متاح</option>
                <option value="UNDER_CONSTRUCTION">🟠 تحت الإنشاء</option>
                <option value="COMING_SOON">🔵 قريباً</option>
                <option value="SOLD">🔴 مباع</option>
              </select>
            </div>

          </div>
        </div>

        {/* ─────────────────────────────────────────────
            TAB 2: التفاصيل
        ───────────────────────────────────────────── */}
        <div className={`space-y-6 ${activeTab === "details" ? "block" : "hidden"}`}>

          {/* الأوصاف */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-5">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              الأوصاف
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">الوصف المختصر</label>
              <p className="text-xs text-gray-500 mb-1">يظهر في نتائج البحث وبطاقة المشروع</p>
              <textarea name="shortDesc" rows={2} defaultValue={initialData?.shortDesc || ""}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الوصف الكامل</label>
              <p className="text-xs text-gray-500 mb-1">يظهر في صفحة المشروع الداخلية</p>
              <textarea name="fullDesc" rows={5} defaultValue={initialData?.fullDesc || ""}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>
          </div>

          {/* المواصفات */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              المواصفات العامة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">السعر يبدأ من (ر.س)</label>
                <input type="number" name="price" defaultValue={initialData?.price ?? ""} placeholder="1500000"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">المساحة (م²)</label>
                <input type="number" name="area" defaultValue={initialData?.area ?? ""} placeholder="350"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">عدد الغرف</label>
                <input type="number" name="rooms" defaultValue={initialData?.rooms ?? ""} placeholder="5"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">دورات المياه</label>
                <input type="number" name="baths" defaultValue={initialData?.baths ?? ""} placeholder="4"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
              </div>
            </div>
          </div>

          {/* الإنجاز */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              نسبة الإنجاز
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">النسبة % (0–100)</label>
                <input type="number" name="progressPercent" min="0" max="100" defaultValue={initialData?.progressPercent ?? ""} placeholder="85"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لإخفاء شريط الإنجاز.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">تسمية شريط الإنجاز</label>
                <input type="text" name="progressLabel" defaultValue={initialData?.progressLabel || ""} placeholder="نسبة الإنجاز العام للمشروع"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
              </div>
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────
            TAB 3: الصور والملفات
        ───────────────────────────────────────────── */}
        <div className={`space-y-8 ${activeTab === "media" ? "block" : "hidden"}`}>

          {/* الصورة الرئيسية */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              الصورة الرئيسية (غلاف المشروع)
            </h3>
            <p className="text-xs text-gray-500 mb-3">تظهر في بطاقة المشروع وأعلى صفحته الداخلية.</p>
            <ImageUpload name="mainImage" label="الصورة الرئيسية" defaultValue={initialData?.mainImage || ""} />
          </div>

          {/* المخطط العام */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              المخطط العام للمشروع
            </h3>
            <p className="text-xs text-gray-500 mb-3">يظهر في قسم &quot;المخطط العام&quot; بصفحة المشروع.</p>
            <ImageUpload name="planImage" label="المخطط العام" defaultValue={initialData?.planImage || ""} />
          </div>

          {/* معرض الصور */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
                  معرض الصور
                </h3>
                <p className="text-xs text-gray-500 mt-1">ارفع صور المشروع — تظهر في قسم معرض الصور.</p>
              </div>
              <button type="button" onClick={addGalleryImage}
                className="text-sm bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#b5952f] border border-[#D4AF37]/30 py-1.5 px-3 rounded-md font-medium transition flex items-center gap-1">
                + إضافة صورة
              </button>
            </div>
            <div className="space-y-4">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1 space-y-3">
                    <ImageUpload
                      name={`gallery_upload_${idx}`}
                      label=""
                      defaultValue={img.url}
                      onChange={(url) => updateGalleryImageUrl(idx, url)}
                    />
                    {/* hidden input to capture final url in galleryImages JSON */}
                    <input type="text" placeholder="نص بديل للصورة (اختياري)"
                      value={img.alt || ""} onChange={(e) => updateGalleryImageAlt(idx, e.target.value)}
                      className="block w-full border border-gray-200 rounded-md py-1.5 px-3 text-xs text-gray-600 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                  </div>
                  <button type="button" onClick={() => removeGalleryImage(idx)}
                    className="text-red-400 hover:text-red-600 text-xs font-bold mt-1 shrink-0 px-2 py-1 rounded hover:bg-red-50 transition">
                    ✕ حذف
                  </button>
                </div>
              ))}
              {galleryImages.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  لا توجد صور في المعرض. اضغط &quot;+ إضافة صورة&quot; للبدء.
                </div>
              )}
            </div>
          </div>

          {/* PDF */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              ملف PDF — بروفايل المشروع
            </h3>
            <input type="url" name="pdfUrl" defaultValue={initialData?.pdfUrl || ""} placeholder="https://..."
              className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" dir="ltr" />
            <p className="text-xs text-gray-500 mt-1">رابط ملف PDF خارجي (اختياري).</p>
          </div>

        </div>

        {/* ─────────────────────────────────────────────
            TAB 4: الموقع
        ───────────────────────────────────────────── */}
        <div className={`space-y-6 ${activeTab === "location" ? "block" : "hidden"}`}>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              معلومات الموقع
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">وصف الموقع النصي</label>
              <input type="text" name="locationText" defaultValue={initialData?.locationText || ""}
                placeholder="مثال: يقع على تقاطع طريق الملك فهد مع الدائري الشمالي"
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">رابط خرائط جوجل</label>
              <input type="url" name="googleMapsUrl" defaultValue={initialData?.googleMapsUrl || ""}
                placeholder="https://maps.google.com/..."
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" dir="ltr" />
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-100 space-y-4">
            <div className="flex items-start gap-3">
              <input name="showOnHomeMap" id="showOnHomeMap" type="checkbox" defaultChecked={Boolean(initialData?.showOnHomeMap)}
                className="mt-0.5 h-4 w-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]" />
              <div>
                <label htmlFor="showOnHomeMap" className="text-sm font-medium text-gray-800 cursor-pointer">
                  إظهار المشروع على خريطة الصفحة الرئيسية
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  إذا كان مفعّلاً يجب إدخال الإحداثيات الجغرافية أدناه.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Latitude (دائرة العرض)</label>
                <input type="number" step="any" name="mapLat" defaultValue={initialData?.mapLat ?? ""}
                  placeholder="24.7136"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Longitude (خط الطول)</label>
                <input type="number" step="any" name="mapLng" defaultValue={initialData?.mapLng ?? ""}
                  placeholder="46.6753"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm shadow-sm focus:ring-[#D4AF37] focus:border-[#D4AF37]" dir="ltr" />
              </div>
            </div>
          </div>

          {/* Deprecated Map Fields — مخفية في inputs فقط */}
          <input type="hidden" name="mapX" defaultValue={initialData?.mapX ?? ""} />
          <input type="hidden" name="mapY" defaultValue={initialData?.mapY ?? ""} />

        </div>

        {/* ─────────────────────────────────────────────
            TAB 5: المميزات والضمانات
        ───────────────────────────────────────────── */}
        <div className={`space-y-8 ${activeTab === "features" ? "block" : "hidden"}`}>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
                  مميزات ومرافق المشروع
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">تظهر في قسم &quot;أبرز المرافق&quot; بصفحة المشروع.</p>
              </div>
              <button type="button" onClick={addFeature}
                className="text-sm bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#b5952f] border border-[#D4AF37]/30 py-1.5 px-3 rounded-md font-medium transition">
                + إضافة ميزة
              </button>
            </div>
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="عنوان الميزة (مثال: سمارت هوم)"
                      value={feature.title} onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                    <input type="text" placeholder="وصف إضافي (اختياري)"
                      value={feature.desc || ""} onChange={(e) => updateFeature(idx, "desc", e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 sm:col-span-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                  </div>
                  <button type="button" onClick={() => removeFeature(idx)}
                    className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition shrink-0">
                    ✕
                  </button>
                </div>
              ))}
              {features.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  لا توجد مميزات مضافة.
                </div>
              )}
            </div>
          </div>

          {/* Warranties */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
                  ضمانات المشروع
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">تظهر في قسم &quot;الضمانات&quot; بصفحة المشروع.</p>
              </div>
              <button type="button" onClick={addWarranty}
                className="text-sm bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#b5952f] border border-[#D4AF37]/30 py-1.5 px-3 rounded-md font-medium transition">
                + إضافة ضمان
              </button>
            </div>
            <div className="space-y-3">
              {warranties.map((warranty, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="عنوان الضمان (مثال: الهيكل الإنشائي)"
                      value={warranty.title} onChange={(e) => updateWarranty(idx, "title", e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                    <input type="text" placeholder="المدة (مثال: 10 سنوات)"
                      value={warranty.duration || ""} onChange={(e) => updateWarranty(idx, "duration", e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                    <input type="text" placeholder="وصف إضافي (اختياري)"
                      value={warranty.desc || ""} onChange={(e) => updateWarranty(idx, "desc", e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                  </div>
                  <button type="button" onClick={() => removeWarranty(idx)}
                    className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 transition shrink-0">
                    ✕
                  </button>
                </div>
              ))}
              {warranties.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  لا توجد ضمانات مضافة.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────
            TAB 6: النشر والمعاينة
        ───────────────────────────────────────────── */}
        <div className={`space-y-6 ${activeTab === "publish" ? "block" : "hidden"}`}>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              إعدادات النشر
            </h3>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input name="isVisible" type="checkbox" defaultChecked={initialData ? Boolean(initialData.isVisible) : true}
                className="mt-0.5 h-4 w-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]" />
              <div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">مرئي للزوار في الموقع</span>
                <p className="text-xs text-gray-500">إذا كان غير مفعّل، لن يظهر المشروع في صفحة المشاريع العامة.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input name="isFeatured" type="checkbox" defaultChecked={Boolean(initialData?.isFeatured)}
                className="mt-0.5 h-4 w-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]" />
              <div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">مميز (يظهر في الصفحة الرئيسية)</span>
                <p className="text-xs text-gray-500">يُعرض في قسم المشاريع المميزة بالصفحة الرئيسية.</p>
              </div>
            </label>
          </div>

          {initialData?.slug && (
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                معاينة الصفحة العامة
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                يمكنك فتح صفحة المشروع العامة للتحقق من الشكل النهائي.
              </p>
              <a
                href={`/projects/${initialData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 text-sm font-medium py-2 px-4 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                معاينة الصفحة العامة
              </a>
            </div>
          )}

          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
              📐 النماذج والوحدات
            </h3>
            <p className="text-sm text-amber-700">
              إدارة النماذج (نماذج الشقق/الفيلل) والوحدات الفردية تتم من صفحة مستقلة.
              اضغط الزر أعلى الصفحة للانتقال.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
