"use client";

import { useState } from "react";
import type { HomePageContent } from "@prisma/client";
import { updateHomePageContent } from "@/actions/cms";
import { updateProjectMapData } from "@/actions/projects";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/crm/ImageUpload";
import dynamic from "next/dynamic";

const InteractiveMapPreview = dynamic(() => import('@/app/(public)/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">جاري تحميل المعاينة...</div>
});

export type MapContentSettings = HomePageContent;

export interface MapProjectItem {
  id: string;
  name: string;
  status: string;
  city: string;
  neighborhood: string;
  isVisible?: boolean;
  showOnHomeMap?: boolean;
  mapLat?: number | string | null;
  mapLng?: number | string | null;
  mapX?: number | string | null;
  mapY?: number | string | null;
  [key: string]: unknown;
}

interface MapManagerClientProps {
  content: HomePageContent;
  projects: MapProjectItem[];
}

export default function MapManagerClient({ content, projects: initialProjects }: MapManagerClientProps) {
  const [projects, setProjects] = useState<MapProjectItem[]>(initialProjects);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [savingProjectId, setSavingProjectId] = useState<string | null>(null);

  // General Settings State
  const [showMapSection, setShowMapSection] = useState(content.showMapSection ?? true);
  const [mapSectionTitle, setMapSectionTitle] = useState(content.mapSectionTitle || "منتجاتنا العقارية على الخريطة");
  const [mapSectionDesc, setMapSectionDesc] = useState(content.mapSectionDesc || "تصفح مواقع منتجاتنا العقارية في مختلف مناطق المملكة.");
  const [mapMode, setMapMode] = useState(content.mapMode || "geographic");
  const [mapCenterLat, setMapCenterLat] = useState(content.mapCenterLat ?? 24.7136);
  const [mapCenterLng, setMapCenterLng] = useState(content.mapCenterLng ?? 46.6753);
  const [mapZoom, setMapZoom] = useState(content.mapZoom ?? 5);
  const [mapBackgroundImage, setMapBackgroundImage] = useState(content.mapBackgroundImage || "");

  // Pin Settings State
  const [pinLogoUrl, setPinLogoUrl] = useState(content.pinLogoUrl || "");
  const [pinLogoSize, setPinLogoSize] = useState(content.pinLogoSize || 32);
  const [pinColorAvailable, setPinColorAvailable] = useState(content.pinColorAvailable || "#B5B693");
  const [pinColorSold, setPinColorSold] = useState(content.pinColorSold || "#4E4949");
  const [pinColorComingSoon, setPinColorComingSoon] = useState(content.pinColorComingSoon || "#C5B59C");
  const [pinColorUnderConstruction, setPinColorUnderConstruction] = useState(content.pinColorUnderConstruction || "#A6937C");
  const [pinColorDefault, setPinColorDefault] = useState(content.pinColorDefault || "#A6937C");

  // Map Tile Style Settings
  const [mapTileStyle, setMapTileStyle] = useState(content.mapTileStyle || "light");
  const [mapTileBrightness, setMapTileBrightness] = useState(content.mapTileBrightness ?? 100);
  const [mapTileContrast, setMapTileContrast] = useState(content.mapTileContrast ?? 100);
  const [mapTileSaturation, setMapTileSaturation] = useState(content.mapTileSaturation ?? 100);
  const [mapTileHue, setMapTileHue] = useState(content.mapTileHue ?? 0);
  const [mapTileGrayscale, setMapTileGrayscale] = useState(content.mapTileGrayscale ?? 0);

  const handleStylePreset = (preset: string) => {
    setMapTileStyle(preset);
    switch (preset) {
      case "warm":
        setMapTileBrightness(95); setMapTileContrast(105); setMapTileSaturation(120); setMapTileHue(15); setMapTileGrayscale(0);
        break;
      case "muted":
        setMapTileBrightness(90); setMapTileContrast(90); setMapTileSaturation(60); setMapTileHue(0); setMapTileGrayscale(20);
        break;
      case "grayscale":
        setMapTileBrightness(100); setMapTileContrast(110); setMapTileSaturation(0); setMapTileHue(0); setMapTileGrayscale(100);
        break;
      case "dark":
        setMapTileBrightness(40); setMapTileContrast(120); setMapTileSaturation(80); setMapTileHue(0); setMapTileGrayscale(10);
        break;
      case "default":
      case "light":
      default:
        setMapTileBrightness(100); setMapTileContrast(100); setMapTileSaturation(100); setMapTileHue(0); setMapTileGrayscale(0);
        break;
    }
  };

  const handleResetPreview = () => {
    setShowMapSection(content.showMapSection ?? true);
    setMapSectionTitle(content.mapSectionTitle || "منتجاتنا العقارية على الخريطة");
    setMapSectionDesc(content.mapSectionDesc || "تصفح مواقع منتجاتنا العقارية في مختلف مناطق المملكة.");
    setMapMode(content.mapMode || "geographic");
    setMapCenterLat(content.mapCenterLat ?? 24.7136);
    setMapCenterLng(content.mapCenterLng ?? 46.6753);
    setMapZoom(content.mapZoom ?? 5);
    setMapBackgroundImage(content.mapBackgroundImage || "");
    setPinLogoUrl(content.pinLogoUrl || "");
    setPinLogoSize(content.pinLogoSize || 32);
    setPinColorAvailable(content.pinColorAvailable || "#B5B693");
    setPinColorSold(content.pinColorSold || "#4E4949");
    setPinColorComingSoon(content.pinColorComingSoon || "#C5B59C");
    setPinColorUnderConstruction(content.pinColorUnderConstruction || "#A6937C");
    setPinColorDefault(content.pinColorDefault || "#A6937C");
    setMapTileStyle(content.mapTileStyle || "light");
    setMapTileBrightness(content.mapTileBrightness ?? 100);
    setMapTileContrast(content.mapTileContrast ?? 100);
    setMapTileSaturation(content.mapTileSaturation ?? 100);
    setMapTileHue(content.mapTileHue ?? 0);
    setMapTileGrayscale(content.mapTileGrayscale ?? 0);
    toast.success("تم إعادة ضبط المعاينة للبيانات المحفوظة");
  };

  const previewContent: HomePageContent = {
    ...content,
    showMapSection,
    mapSectionTitle,
    mapSectionDesc,
    mapMode,
    mapCenterLat,
    mapCenterLng,
    mapZoom,
    mapBackgroundImage,
    pinLogoUrl,
    pinLogoSize,
    pinColorAvailable,
    pinColorSold,
    pinColorComingSoon,
    pinColorUnderConstruction,
    pinColorDefault,
    mapTileStyle,
    mapTileBrightness,
    mapTileContrast,
    mapTileSaturation,
    mapTileHue,
    mapTileGrayscale,
  };

  const handleSaveContent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingContent(true);

    try {
      await updateHomePageContent(previewContent);
      toast.success("تم حفظ إعدادات الخريطة بنجاح");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الإعدادات";
      toast.error(errMsg);
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleProjectUpdate = (id: string, field: keyof MapProjectItem, value: unknown) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveProjectMapData = async (project: MapProjectItem) => {
    setSavingProjectId(project.id);
    try {
      await updateProjectMapData(project.id, {
        showOnHomeMap: Boolean(project.showOnHomeMap),
        mapLat: project.mapLat ? parseFloat(String(project.mapLat)) : null,
        mapLng: project.mapLng ? parseFloat(String(project.mapLng)) : null,
        mapX: project.mapX ? parseFloat(String(project.mapX)) : null,
        mapY: project.mapY ? parseFloat(String(project.mapY)) : null,
      });
      toast.success(`تم حفظ إحداثيات ${project.name} بنجاح`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      toast.error(errMsg);
    } finally {
      setSavingProjectId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. General Map Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">الإعدادات العامة للخريطة</h2>
        
        <form onSubmit={handleSaveContent} className="space-y-4">
          <div className="mb-4">
            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
              <input 
                type="checkbox" 
                name="showMapSection" 
                checked={showMapSection} 
                onChange={(e) => setShowMapSection(e.target.checked)}
                className="w-5 h-5 text-primary border-gray-300 rounded" 
              />
              <span className="font-bold text-gray-800">إظهار قسم الخريطة التفاعلية في الصفحة الرئيسية</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">عنوان القسم</label>
              <input type="text" name="mapSectionTitle" value={mapSectionTitle} onChange={(e) => setMapSectionTitle(e.target.value)} className="w-full border-gray-300 rounded-md p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">وصف القسم</label>
              <input type="text" name="mapSectionDesc" value={mapSectionDesc} onChange={(e) => setMapSectionDesc(e.target.value)} className="w-full border-gray-300 rounded-md p-2 border" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">نوع الخريطة</label>
              <select name="mapMode" value={mapMode} onChange={(e) => setMapMode(e.target.value)} className="w-full border-gray-300 rounded-md p-2 border">
                <option value="geographic">خريطة جغرافية حقيقية (Geographic Map)</option>
                <option value="image">خريطة تصميمية (Image-based Map)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4 border-gray-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">مركز الخريطة (Latitude)</label>
                <input type="number" step="any" name="mapCenterLat" value={mapCenterLat} onChange={(e) => setMapCenterLat(Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 border text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">مركز الخريطة (Longitude)</label>
                <input type="number" step="any" name="mapCenterLng" value={mapCenterLng} onChange={(e) => setMapCenterLng(Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 border text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">مستوى التكبير (Zoom)</label>
                <input type="number" name="mapZoom" value={mapZoom} onChange={(e) => setMapZoom(Number(e.target.value))} className="w-full border-gray-300 rounded-md p-2 border text-left" dir="ltr" />
              </div>
            </div>

            <div className="border-t pt-4 border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-1">رابط صورة الخريطة (للخريطة التصميمية فقط)</label>
              <input type="url" name="mapBackgroundImage" value={mapBackgroundImage} onChange={(e) => setMapBackgroundImage(e.target.value)} placeholder="https://example.com/map-bg.png" className="w-full border-gray-300 rounded-md p-2 border text-left" dir="ltr" />
            </div>

            {/* Map Style Settings Section */}
            <div className="border-t pt-6 mt-6 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات ألوان الخريطة (Map Style)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Presets */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">القوالب الجاهزة (Presets)</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { id: 'light', label: 'Light / فاتح' },
                      { id: 'warm', label: 'Warm / دافئ' },
                      { id: 'muted', label: 'Muted / هادئ' },
                      { id: 'grayscale', label: 'Grayscale / رمادي' },
                      { id: 'dark', label: 'Dark / داكن' },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleStylePreset(preset.id)}
                        className={`px-4 py-2 text-sm rounded-md border transition ${mapTileStyle === preset.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="mapTileStyle" value={mapTileStyle} />
                </div>

                {/* Advanced CSS Filters */}
                <div className="space-y-4 bg-gray-50 p-4 rounded border">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">تحكم متقدم (CSS Filters)</h4>
                  
                  <div>
                    <label className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>السطوع (Brightness)</span>
                      <span>{mapTileBrightness}%</span>
                    </label>
                    <input type="range" name="mapTileBrightness" min="0" max="200" value={mapTileBrightness} onChange={(e) => setMapTileBrightness(Number(e.target.value))} className="w-full" />
                  </div>
                  
                  <div>
                    <label className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>التباين (Contrast)</span>
                      <span>{mapTileContrast}%</span>
                    </label>
                    <input type="range" name="mapTileContrast" min="0" max="200" value={mapTileContrast} onChange={(e) => setMapTileContrast(Number(e.target.value))} className="w-full" />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>التشبع (Saturation)</span>
                      <span>{mapTileSaturation}%</span>
                    </label>
                    <input type="range" name="mapTileSaturation" min="0" max="200" value={mapTileSaturation} onChange={(e) => setMapTileSaturation(Number(e.target.value))} className="w-full" />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>تدرج اللون (Hue Rotate)</span>
                      <span>{mapTileHue}deg</span>
                    </label>
                    <input type="range" name="mapTileHue" min="-180" max="180" value={mapTileHue} onChange={(e) => setMapTileHue(Number(e.target.value))} className="w-full" />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>تدرج رمادي (Grayscale)</span>
                      <span>{mapTileGrayscale}%</span>
                    </label>
                    <input type="range" name="mapTileGrayscale" min="0" max="100" value={mapTileGrayscale} onChange={(e) => setMapTileGrayscale(Number(e.target.value))} className="w-full" />
                  </div>
                </div>

              </div>
            </div>

            {/* Pin Settings Section */}
            <div className="border-t pt-6 mt-6 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات علامات الخريطة (Pins)</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
                    <span className="text-sm font-bold">لون حالة (متاح)</span>
                    <input type="color" value={pinColorAvailable} onChange={(e) => setPinColorAvailable(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
                    <span className="text-sm font-bold">لون حالة (مباع)</span>
                    <input type="color" value={pinColorSold} onChange={(e) => setPinColorSold(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
                    <span className="text-sm font-bold">لون حالة (قريباً)</span>
                    <input type="color" value={pinColorComingSoon} onChange={(e) => setPinColorComingSoon(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
                    <span className="text-sm font-bold">لون حالة (تحت الإنشاء)</span>
                    <input type="color" value={pinColorUnderConstruction} onChange={(e) => setPinColorUnderConstruction(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
                    <span className="text-sm font-bold">اللون الافتراضي</span>
                    <input type="color" value={pinColorDefault} onChange={(e) => setPinColorDefault(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                </div>

                {/* Logo & Preview */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شعار داخل العلامة (اختياري)</label>
                    <ImageUpload 
                      name="pinLogoUrl"
                      defaultValue={pinLogoUrl}
                      onChange={(url) => setPinLogoUrl(url)} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">حجم الشعار داخل العلامة: {pinLogoSize}px</label>
                    <input 
                      type="range" 
                      min="16" 
                      max="48" 
                      value={pinLogoSize} 
                      onChange={(e) => setPinLogoSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="bg-gray-100 p-4 rounded border flex flex-col items-center justify-center min-h-[120px]">
                    <span className="text-xs text-gray-500 mb-4">معاينة العلامة (مثال: متاح)</span>
                    <div 
                      className="relative rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden"
                      style={{ 
                        backgroundColor: pinColorAvailable, 
                        width: '40px', 
                        height: '40px'
                      }}
                    >
                      {pinLogoUrl && (
                        <Image
                          src={pinLogoUrl} 
                          alt="شعار الخريطة"
                          width={pinLogoSize}
                          height={pinLogoSize}
                          unoptimized
                          style={{ 
                            width: `${pinLogoSize}px`, 
                            height: `${pinLogoSize}px`, 
                            objectFit: 'contain' 
                          }} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Link href="/" target="_blank" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              معاينة الخريطة في الرئيسية
            </Link>
            <button type="button" onClick={handleResetPreview} disabled={isSavingContent} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-md font-bold disabled:opacity-50">
              إعادة ضبط المعاينة
            </button>
            <button type="submit" disabled={isSavingContent} className="bg-primary hover:bg-primary-dark text-[#ffffff] px-8 py-2.5 rounded-md font-bold disabled:opacity-50">
              {isSavingContent ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}
            </button>
          </div>
        </form>
      </div>

      {/* Live Map Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">معاينة مباشرة للخريطة (Live Preview)</h2>
            <p className="text-sm text-gray-500 mt-1">تعكس التعديلات لحظياً. التعديلات لن تظهر في الموقع حتى تضغط على &quot;حفظ&quot;.</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold animate-pulse">Live</span>
        </div>
        <div className="p-4 bg-gray-100 relative z-0">
          <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-inner relative">
            {showMapSection ? (
              <InteractiveMapPreview content={previewContent} projects={projects} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-bold bg-white rounded-xl">
                قسم الخريطة معطل حالياً (قم بتفعيل القسم لمعاينة الخريطة)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Projects Map Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">إدارة المنتجات على الخريطة</h2>
          <p className="text-sm text-gray-500 mt-1">تفعيل وتعديل إحداثيات المنتجات لظهورها على الخريطة</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4 border-b">المنتج</th>
                <th className="p-4 border-b">الحالة والمكان</th>
                <th className="p-4 border-b text-center">تفعيل الخريطة</th>
                <th className="p-4 border-b">الإحداثيات (Lat / Lng)</th>
                <th className="p-4 border-b">الإحداثيات (X / Y)</th>
                <th className="p-4 border-b text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => {
                const isGeoWarning = content.mapMode === 'geographic' && project.showOnHomeMap && (!project.mapLat || !project.mapLng);
                const isImageWarning = content.mapMode === 'image' && project.showOnHomeMap && (!project.mapX || !project.mapY);
                const hasWarning = isGeoWarning || isImageWarning;

                return (
                  <tr key={project.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{project.name}</div>
                      {!project.isVisible && <span className="text-xs text-red-500 font-medium">مخفي من الموقع</span>}
                      {hasWarning && (
                        <div className="text-xs text-orange-500 font-bold mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          ينقص إحداثيات
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded mb-1">{project.status}</div>
                      <div className="text-xs">{project.city} - {project.neighborhood}</div>
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={Boolean(project.showOnHomeMap)}
                          onChange={(e) => handleProjectUpdate(project.id, 'showOnHomeMap', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <input 
                          type="number" step="any" placeholder="Lat" dir="ltr"
                          value={project.mapLat || ''}
                          onChange={(e) => handleProjectUpdate(project.id, 'mapLat', e.target.value)}
                          className="w-20 border-gray-300 rounded text-xs p-1 border text-center"
                        />
                        <input 
                          type="number" step="any" placeholder="Lng" dir="ltr"
                          value={project.mapLng || ''}
                          onChange={(e) => handleProjectUpdate(project.id, 'mapLng', e.target.value)}
                          className="w-20 border-gray-300 rounded text-xs p-1 border text-center"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <input 
                          type="number" step="any" placeholder="X %" dir="ltr"
                          value={project.mapX || ''}
                          onChange={(e) => handleProjectUpdate(project.id, 'mapX', e.target.value)}
                          className="w-16 border-gray-300 rounded text-xs p-1 border text-center"
                        />
                        <input 
                          type="number" step="any" placeholder="Y %" dir="ltr"
                          value={project.mapY || ''}
                          onChange={(e) => handleProjectUpdate(project.id, 'mapY', e.target.value)}
                          className="w-16 border-gray-300 rounded text-xs p-1 border text-center"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => saveProjectMapData(project)}
                          disabled={savingProjectId === project.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold disabled:opacity-50"
                        >
                          {savingProjectId === project.id ? "..." : "حفظ"}
                        </button>
                        <Link 
                          href={`/crm/projects/${project.id}/edit`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-bold"
                        >
                          تعديل
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">لا توجد مشاريع مضافة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
