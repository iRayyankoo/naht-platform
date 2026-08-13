"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { HomePageContent } from "@prisma/client";
import { updateHomePageContent } from "@/actions/cms";
import { updateProjectMapData } from "@/actions/projects";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import type L from "leaflet";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#F7F3EB] rounded-2xl flex items-center justify-center animate-pulse text-xs font-bold text-gray-500">جاري تحميل الخريطة التفاعلية...</div>,
});

export interface MapProjectItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  city?: string | null;
  neighborhood?: string | null;
  isVisible?: boolean;
  showOnHomeMap?: boolean;
  mapLat?: number | string | null;
  mapLng?: number | string | null;
  mainImage?: string | null;
  [key: string]: unknown;
}

interface MapManagerClientProps {
  initialContent: HomePageContent;
  initialProjects: MapProjectItem[];
}

export default function MapManagerClient({ initialContent, initialProjects }: MapManagerClientProps) {
  const [projects, setProjects] = useState<MapProjectItem[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjects[0]?.id || null);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [savingProjectId, setSavingProjectId] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");
  const [coordsFilter, setCoordsFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Content Settings State
  const [showMapSection, setShowMapSection] = useState(initialContent.showMapSection ?? true);
  const [mapSectionTitle, setMapSectionTitle] = useState(initialContent.mapSectionTitle || "مشاريعنا العقارية على الخريطة");
  const [mapSectionDesc, setMapSectionDesc] = useState(initialContent.mapSectionDesc || "تصفح مواقع مشاريعنا في مختلف أحياء الرياض والمملكة.");
  const [mapCenterLat, setMapCenterLat] = useState(initialContent.mapCenterLat ?? 24.7136);
  const [mapCenterLng, setMapCenterLng] = useState(initialContent.mapCenterLng ?? 46.6753);
  const [mapZoom, setMapZoom] = useState(initialContent.mapZoom ?? 11);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.neighborhood || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchVis = visibilityFilter === "ALL" || (visibilityFilter === "VISIBLE" ? p.isVisible : !p.isVisible);
      const hasCoords = p.mapLat !== null && p.mapLng !== null && !isNaN(Number(p.mapLat)) && !isNaN(Number(p.mapLng));
      const matchCoords = coordsFilter === "ALL" || (coordsFilter === "HAS_COORDS" ? hasCoords : !hasCoords);
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchSearch && matchVis && matchCoords && matchStatus;
    });
  }, [projects, searchTerm, visibilityFilter, coordsFilter, statusFilter]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!selectedProjectId) return;
      const formattedLat = parseFloat(lat.toFixed(6));
      const formattedLng = parseFloat(lng.toFixed(6));
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProjectId ? { ...p, mapLat: formattedLat, mapLng: formattedLng, showOnHomeMap: true } : p))
      );
      toast.success(`تم تحديد موقع جديد لـ ${selectedProject?.name || "المشروع"}`);
    },
    [selectedProjectId, selectedProject]
  );

  const handleMarkerDragEnd = useCallback((id: string, e: L.DragEndEvent) => {
    const marker = e.target;
    if (marker) {
      const latLng = marker.getLatLng();
      const formattedLat = parseFloat(latLng.lat.toFixed(6));
      const formattedLng = parseFloat(latLng.lng.toFixed(6));
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mapLat: formattedLat, mapLng: formattedLng, showOnHomeMap: true } : p))
      );
      toast.success("تم تحديث موقع العلامة بالسحب");
    }
  }, []);

  const handleProjectUpdate = (id: string, field: keyof MapProjectItem, value: unknown) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveProjectMapData = async (project: MapProjectItem) => {
    setSavingProjectId(project.id);
    try {
      const lat = project.mapLat !== null && project.mapLat !== undefined && project.mapLat !== "" ? parseFloat(String(project.mapLat)) : null;
      const lng = project.mapLng !== null && project.mapLng !== undefined && project.mapLng !== "" ? parseFloat(String(project.mapLng)) : null;

      await updateProjectMapData(project.id, {
        showOnHomeMap: Boolean(project.showOnHomeMap),
        mapLat: lat,
        mapLng: lng,
        mapX: project.mapX ? parseFloat(String(project.mapX)) : null,
        mapY: project.mapY ? parseFloat(String(project.mapY)) : null,
      });
      toast.success(`تم حفظ إعدادات خريطة ${project.name} بنجاح`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      toast.error(errMsg);
    } finally {
      setSavingProjectId(null);
    }
  };

  const handleSaveGeneralContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      await updateHomePageContent({
        ...initialContent,
        showMapSection,
        mapSectionTitle,
        mapSectionDesc,
        mapCenterLat,
        mapCenterLng,
        mapZoom,
      });
      toast.success("تم حفظ الإعدادات العامة للخريطة بنجاح");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      toast.error(errMsg);
    } finally {
      setIsSavingContent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. General Map Settings Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">الإعدادات العامة لخريطة الموقع العام</h2>
        <form onSubmit={handleSaveGeneralContent} className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showMapSection"
              checked={showMapSection}
              onChange={(e) => setShowMapSection(e.target.checked)}
              className="w-5 h-5 text-[#a6937c] rounded border-gray-300 focus:ring-[#a6937c]"
            />
            <label htmlFor="showMapSection" className="font-bold text-gray-800 text-sm">
              إظهار قسم الخريطة التفاعلية في الصفحة الرئيسية للموقع العام
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">عنوان القسم الخارجي</label>
              <input
                type="text"
                value={mapSectionTitle}
                onChange={(e) => setMapSectionTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">وصف القسم الخارجي</label>
              <input
                type="text"
                value={mapSectionDesc}
                onChange={(e) => setMapSectionDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">مركز الخريطة (Latitude)</label>
              <input
                type="number"
                step="any"
                value={mapCenterLat}
                onChange={(e) => setMapCenterLat(parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">مركز الخريطة (Longitude)</label>
              <input
                type="number"
                step="any"
                value={mapCenterLng}
                onChange={(e) => setMapCenterLng(parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">مستوى التكبير الافتراضي (Zoom)</label>
              <input
                type="number"
                value={mapZoom}
                onChange={(e) => setMapZoom(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingContent}
              className="px-5 py-2.5 bg-[#a6937c] text-white font-bold text-sm rounded-xl hover:bg-[#8e7d69] transition-colors disabled:opacity-50"
            >
              {isSavingContent ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Interactive Map Picker & Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects List & Filter controls */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
          <h3 className="text-lg font-bold text-gray-900 mb-3">قائمة المشاريع (30 مشروعاً)</h3>

          {/* Search & Filters */}
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder="ابحث باسم المشروع أو الحي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-700"
              >
                <option value="ALL">جميع العرض</option>
                <option value="VISIBLE">مفعل</option>
                <option value="HIDDEN">مخفي</option>
              </select>

              <select
                value={coordsFilter}
                onChange={(e) => setCoordsFilter(e.target.value)}
                className="border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-700"
              >
                <option value="ALL">الإحداثيات</option>
                <option value="HAS_COORDS">محدد (14)</option>
                <option value="MISSING_COORDS">ناقص (16)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-700"
              >
                <option value="ALL">الحالات</option>
                <option value="AVAILABLE">متاح</option>
                <option value="SOLD">مباع</option>
                <option value="COMING_SOON">قريباً</option>
              </select>
            </div>
          </div>

          {/* Projects Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredProjects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              const hasCoords = p.mapLat !== null && p.mapLng !== null && !isNaN(Number(p.mapLat)) && !isNaN(Number(p.mapLng));

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#a6937c] bg-[#a6937c]/5 shadow-sm"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{p.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hasCoords ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {hasCoords ? "محدد الموقع" : "بدون إحداثيات"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>حي: {p.neighborhood || "غير محدد"}</span>
                    <span>الحالة: {p.status === "SOLD" ? "مباع" : p.status === "COMING_SOON" ? "قريباً" : "متاح"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map & Selected Project Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Leaflet Map Picker Container */}
          <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 bg-[#F7F3EB]">
            <LeafletMapInner
              mapCenterLat={mapCenterLat}
              mapCenterLng={mapCenterLng}
              mapZoom={mapZoom}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onLocationSelect={handleMapClick}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
            <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 shadow-sm border border-gray-200">
              انقر في أي مكان بالخريطة لتحديد موقع المشروع المحدد ({selectedProject?.name || "لا يوجد"})
            </div>
          </div>

          {/* Selected Project Coordinate & Status Editor */}
          {selectedProject && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-bold text-gray-900">
                  تعديل موقع وحالة: <span className="text-[#a6937c]">{selectedProject.name}</span>
                </h4>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedProject.showOnHomeMap)}
                      onChange={(e) => handleProjectUpdate(selectedProject.id, "showOnHomeMap", e.target.checked)}
                      className="w-4 h-4 text-[#a6937c] rounded"
                    />
                    <span>إظهار في الخريطة</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">دائرة العرض (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedProject.mapLat ?? ""}
                    onChange={(e) => handleProjectUpdate(selectedProject.id, "mapLat", e.target.value)}
                    placeholder="مثال: 24.883778"
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">خط الطول (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedProject.mapLng ?? ""}
                    onChange={(e) => handleProjectUpdate(selectedProject.id, "mapLng", e.target.value)}
                    placeholder="مثال: 46.830028"
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">حالة المشروع</label>
                  <select
                    value={selectedProject.status}
                    onChange={(e) => handleProjectUpdate(selectedProject.id, "status", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold text-gray-800"
                  >
                    <option value="AVAILABLE">متاح (AVAILABLE)</option>
                    <option value="SOLD">مباع (SOLD)</option>
                    <option value="COMING_SOON">قريباً (COMING_SOON)</option>
                    <option value="UNDER_CONSTRUCTION">تحت الإنشاء (UNDER_CONSTRUCTION)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => saveProjectMapData(selectedProject)}
                  disabled={savingProjectId === selectedProject.id}
                  className="px-6 py-2 bg-[#a6937c] text-white font-bold text-xs rounded-xl hover:bg-[#8e7d69] transition-colors disabled:opacity-50"
                >
                  {savingProjectId === selectedProject.id ? "جاري الحفظ..." : "حفظ موقع وحالة المشروع"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
