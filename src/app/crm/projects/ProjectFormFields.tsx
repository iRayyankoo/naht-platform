"use client";

import { useState } from "react";
import ImageUpload from "@/components/crm/ImageUpload";

interface ProjectFeature {
  id?: string;
  title: string;
  desc: string;
  icon: string;
}

interface ProjectWarranty {
  id?: string;
  title: string;
  desc: string;
  duration: string;
}

interface ProjectGalleryImage {
  id?: string;
  url: string;
  alt: string;
}

interface ProjectFormFieldsProps {
  initialData?: any;
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
  const updateGalleryImage = (index: number, key: keyof ProjectGalleryImage, value: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], [key]: value };
    setGalleryImages(newGallery);
  };
  const removeGalleryImage = (index: number) => setGalleryImages(galleryImages.filter((_, i) => i !== index));

  const tabs = [
    { id: "basic", label: "البيانات الأساسية" },
    { id: "specs", label: "المواصفات" },
    { id: "location", label: "الموقع والإنجاز" },
    { id: "features", label: "المميزات والضمانات" },
    { id: "media", label: "الوسائط" },
  ];

  return (
    <div>
      {/* Hidden inputs for JSON data */}
      <input type="hidden" name="features" value={JSON.stringify(features)} />
      <input type="hidden" name="warranties" value={JSON.stringify(warranties)} />
      <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />

      {/* Tabs Header */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap space-x-4 space-x-reverse" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* TAB 1: BASIC */}
        <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${activeTab === "basic" ? "block" : "hidden"}`}>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">اسم المنتج العقاري</label>
            <input type="text" name="name" required defaultValue={initialData?.name} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">الرابط (Slug)</label>
            <input type="text" name="slug" required defaultValue={initialData?.slug} placeholder="مثال: batil-villa" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">النوع</label>
            <select name="type" defaultValue={initialData?.type || "فيلا"} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
              <option value="فيلا">فيلا</option>
              <option value="شقة">شقة</option>
              <option value="دور">دور</option>
              <option value="تاون هاوس">تاون هاوس</option>
              <option value="أرض">أرض</option>
              <option value="تجاري">تجاري</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">المدينة</label>
            <input type="text" name="city" required defaultValue={initialData?.city || "الرياض"} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">الحي</label>
            <input type="text" name="neighborhood" required defaultValue={initialData?.neighborhood} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">الحالة</label>
            <select name="status" defaultValue={initialData?.status || "AVAILABLE"} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border">
              <option value="AVAILABLE">متاح</option>
              <option value="SOLD">مباع</option>
              <option value="COMING_SOON">قريباً</option>
              <option value="UNDER_CONSTRUCTION">تحت الإنشاء</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">وصف مختصر (للروت)</label>
            <textarea name="shortDesc" rows={2} defaultValue={initialData?.shortDesc} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3"></textarea>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">عن المنتج العقاري (تفصيلي للصفحة الداخلية)</label>
            <textarea name="fullDesc" rows={4} defaultValue={initialData?.fullDesc} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3"></textarea>
          </div>

          <div className="sm:col-span-6 flex gap-6 mt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input name="isFeatured" type="checkbox" defaultChecked={initialData?.isFeatured} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
              </div>
              <div className="ml-3 mr-3 text-sm">
                <label className="font-medium text-gray-700">مميز (يظهر بالرئيسية)</label>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input name="isVisible" type="checkbox" defaultChecked={initialData ? initialData.isVisible : true} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
              </div>
              <div className="ml-3 mr-3 text-sm">
                <label className="font-medium text-gray-700">مرئي في الموقع</label>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 2: SPECS */}
        <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${activeTab === "specs" ? "block" : "hidden"}`}>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">السعر (اختياري)</label>
            <input type="number" name="price" defaultValue={initialData?.price} placeholder="مثال: 1500000" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">المساحة م² (اختياري)</label>
            <input type="number" name="area" defaultValue={initialData?.area} placeholder="مثال: 350" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">عدد الغرف (اختياري)</label>
            <input type="number" name="rooms" defaultValue={initialData?.rooms} placeholder="مثال: 5" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">دورات المياه (اختياري)</label>
            <input type="number" name="baths" defaultValue={initialData?.baths} placeholder="مثال: 4" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>
        </div>

        {/* TAB 3: LOCATION & PROGRESS */}
        <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${activeTab === "location" ? "block" : "hidden"}`}>
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">رابط خريطة جوجل (اختياري)</label>
            <input type="url" name="googleMapsUrl" defaultValue={initialData?.googleMapsUrl} placeholder="https://maps.google.com/..." className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
          </div>
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">وصف الموقع (اختياري)</label>
            <input type="text" name="locationText" defaultValue={initialData?.locationText} placeholder="مثال: يقع المشروع على تقاطع طريق الملك فهد" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>
          <div className="sm:col-span-3 mt-4">
            <label className="block text-sm font-medium text-gray-700">نسبة الإنجاز % (0 - 100)</label>
            <input type="number" name="progressPercent" min="0" max="100" defaultValue={initialData?.progressPercent} placeholder="مثال: 85" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
            <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لإخفاء قسم الإنجاز.</p>
          </div>
          <div className="sm:col-span-3 mt-4">
            <label className="block text-sm font-medium text-gray-700">وصف الإنجاز (اختياري)</label>
            <input type="text" name="progressLabel" defaultValue={initialData?.progressLabel} placeholder="مثال: نسبة الإنجاز العام للمشروع" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
          </div>

          <div className="sm:col-span-6 mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-md font-bold text-gray-900 mb-4">الخريطة التفاعلية (الصفحة الرئيسية)</h4>
            <div className="flex items-start mb-4">
              <div className="flex items-center h-5">
                <input name="showOnHomeMap" type="checkbox" defaultChecked={initialData?.showOnHomeMap} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
              </div>
              <div className="ml-3 mr-3 text-sm">
                <label className="font-medium text-gray-700">إظهار المنتج على خريطة الصفحة الرئيسية</label>
              </div>
            </div>

            {/* Geographic Map Settings */}
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
              <h5 className="text-sm font-bold text-blue-900 mb-3">إحداثيات الخريطة الجغرافية الحقيقية (Geographic Map)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude (دائرة العرض)</label>
                  <input type="number" step="any" name="mapLat" defaultValue={initialData?.mapLat} placeholder="مثال: 24.7136" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude (خط الطول)</label>
                  <input type="number" step="any" name="mapLng" defaultValue={initialData?.mapLng} placeholder="مثال: 46.6753" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
                </div>
              </div>
            </div>

            {/* Image Map Settings */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-bold text-gray-700 mb-3">إحداثيات الخريطة التصميمية الصورة (Image Map - احتياطي)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">موضع X بالنسبة المئوية (%)</label>
                  <input type="number" step="0.1" name="mapX" defaultValue={initialData?.mapX} placeholder="مثال: 45.5" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">موضع Y بالنسبة المئوية (%)</label>
                  <input type="number" step="0.1" name="mapY" defaultValue={initialData?.mapY} placeholder="مثال: 60.2" className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 4: FEATURES & WARRANTIES */}
        <div className={`space-y-8 ${activeTab === "features" ? "block" : "hidden"}`}>
          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">مميزات المنتج العقاري</h3>
              <button type="button" onClick={addFeature} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md font-medium transition">
                + إضافة ميزة
              </button>
            </div>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="عنوان الميزة (مثال: سمارت هوم)" value={feature.title} onChange={(e) => updateFeature(idx, "title", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" />
                    <input type="text" placeholder="وصف (اختياري)" value={feature.desc || ""} onChange={(e) => updateFeature(idx, "desc", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border sm:col-span-2" />
                  </div>
                  <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700 text-sm font-bold mt-2">حذف</button>
                </div>
              ))}
              {features.length === 0 && <p className="text-sm text-gray-500 italic">لا توجد ميزات مضافة.</p>}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Warranties */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">ضمانات المشروع</h3>
              <button type="button" onClick={addWarranty} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md font-medium transition">
                + إضافة ضمان
              </button>
            </div>
            <div className="space-y-4">
              {warranties.map((warranty, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="عنوان الضمان (مثال: الهيكل الإنشائي)" value={warranty.title} onChange={(e) => updateWarranty(idx, "title", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" />
                    <input type="text" placeholder="المدة (مثال: 10 سنوات)" value={warranty.duration || ""} onChange={(e) => updateWarranty(idx, "duration", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" />
                    <input type="text" placeholder="وصف (اختياري)" value={warranty.desc || ""} onChange={(e) => updateWarranty(idx, "desc", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                  <button type="button" onClick={() => removeWarranty(idx)} className="text-red-500 hover:text-red-700 text-sm font-bold mt-2">حذف</button>
                </div>
              ))}
              {warranties.length === 0 && <p className="text-sm text-gray-500 italic">لا توجد ضمانات مضافة.</p>}
            </div>
          </div>
        </div>

        {/* TAB 5: MEDIA */}
        <div className={`space-y-8 ${activeTab === "media" ? "block" : "hidden"}`}>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">الصورة الرئيسية (غلاف المنتج)</h3>
            <ImageUpload name="mainImage" label="الصورة الرئيسية" defaultValue={initialData?.mainImage} />
          </div>
          
          <hr className="border-gray-200" />

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">مخطط المشروع العام</h3>
            <p className="text-sm text-gray-500 mb-4">ارفع صورة المخطط العام للمشروع أو توزيع الوحدات الرئيسية.</p>
            <ImageUpload name="planImage" label="المخطط العام" defaultValue={initialData?.planImage || ""} />
          </div>
          
          <hr className="border-gray-200" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">معرض الصور (Gallery)</h3>
              <button type="button" onClick={addGalleryImage} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md font-medium transition">
                + إضافة صورة
              </button>
            </div>
            <div className="space-y-4">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden border border-gray-300">
                    {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">فارغ</div>}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="رابط الصورة (URL)" value={img.url} onChange={(e) => updateGalleryImage(idx, "url", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" dir="ltr" />
                    <input type="text" placeholder="نص بديل (اختياري)" value={img.alt || ""} onChange={(e) => updateGalleryImage(idx, "alt", e.target.value)} className="w-full text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                  <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-500 hover:text-red-700 text-sm font-bold">حذف</button>
                </div>
              ))}
              {galleryImages.length === 0 && <p className="text-sm text-gray-500 italic">لا توجد صور مضافة في المعرض.</p>}
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">ملف المنتج (PDF)</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الملف (اختياري)</label>
            <input type="url" name="pdfUrl" defaultValue={initialData?.pdfUrl} placeholder="https://..." className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border max-w-2xl" dir="ltr" />
          </div>
        </div>
      </div>
    </div>
  );
}
