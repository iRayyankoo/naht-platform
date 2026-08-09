/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface UnitItem {
  id: string;
  unitNum: string;
  type: string;
  area: number;
  rooms: number;
  baths: number;
  price: number;
  status: string;
  floor?: string | null;
  facade?: string | null;
  unitPlanImage?: string | null;
  project: {
    id: string;
    slug: string;
    name: string;
    city: string;
    neighborhood: string;
    mainImage?: string | null;
  };
  model?: {
    name: string;
    planImage?: string | null;
  } | null;
}

interface UnitsClientViewProps {
  initialUnits: UnitItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  cities: string[];
  neighborhoods: string[];
  unitTypes: string[];
  searchParams: Record<string, string | undefined>;
}

function formatProjectName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.startsWith("مشروع ")) {
    return trimmed;
  }
  return `مشروع ${trimmed}`;
}

function formatUnitType(type?: string | null): string {
  if (!type || type === "???" || type.includes("?")) return "وحدة عقارية";
  return type;
}

function formatFloor(floor?: string | null): string | null {
  if (!floor) return null;
  if (floor.toLowerCase().startsWith("floor ")) {
    return floor.toLowerCase().replace("floor ", "الطابق ");
  }
  return floor;
}

export default function UnitsClientView({
  initialUnits,
  totalCount,
  currentPage,
  totalPages,
  cities,
  neighborhoods,
  unitTypes,
  searchParams,
}: UnitsClientViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.search || "");
  const [city, setCity] = useState(searchParams.city || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.neighborhood || "");
  const [type, setType] = useState(searchParams.type || "");
  const [status, setStatus] = useState(searchParams.status || "");
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || "");
  const [minArea, setMinArea] = useState(searchParams.minArea || "");
  const [maxArea, setMaxArea] = useState(searchParams.maxArea || "");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const applyFilters = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    const current = {
      search,
      city,
      neighborhood,
      type,
      status,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page: "1",
      ...overrides,
    };

    Object.entries(current).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    router.push(`${pathname}?${params.toString()}`);
    setIsFilterDrawerOpen(false);
  };

  const handleReset = () => {
    setSearch("");
    setCity("");
    setNeighborhood("");
    setType("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    router.push(pathname);
    setIsFilterDrawerOpen(false);
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "السعر عند الطلب";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (unitStatus: string) => {
    switch (unitStatus) {
      case "AVAILABLE":
        return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">متاحة</span>;
      case "RESERVED":
        return <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full">محجوزة</span>;
      case "SOLD":
        return <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-full">مباعة</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">متاحة</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="ابحث برقم الوحدة، اسم المشروع، المدينة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-brand-cafe focus:ring-2 focus:ring-brand-cafe/20 outline-none transition-all"
            />
            <button
              onClick={() => applyFilters()}
              aria-label="تنفيذ البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-cafe"
              title="بحث"
            >
              🔍
            </button>
          </div>


          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
            >
              ⚙️ التصفية المتقدمة
              {(city || type || status || minPrice || maxPrice) && (
                <span className="w-2.5 h-2.5 bg-brand-cafe rounded-full animate-ping" />
              )}
            </button>

            {(search || city || neighborhood || type || status || minPrice || maxPrice) && (
              <button
                onClick={handleReset}
                className="px-4 py-3 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all"
              >
                تصفير الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Filter Drawer / Expanded Box */}
        {isFilterDrawerOpen && (
          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-brand-cafe"
              >
                <option value="">جميع المدن</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">الحي</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-brand-cafe"
              >
                <option value="">جميع الأحياء</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">نوع العقار</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-brand-cafe"
              >
                <option value="">جميع الأنواع</option>
                {unitTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="شقة">شقة سكنيّة</option>
                <option value="فيلا">فيلا فاخرة</option>
                <option value="تاون هاوس">تاون هاوس</option>
                <option value="دور سكني">دور سكني مستقل</option>
                <option value="محل تجاري">محل / مكتب تجاري</option>
              </select>
            </div>


            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-brand-cafe"
              >
                <option value="">جميع الحالات</option>
                <option value="AVAILABLE">متاحة للبيع</option>
                <option value="RESERVED">محجوزة</option>
                <option value="SOLD">مباعة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">السعر الأدنى (ريال)</label>
              <input
                type="number"
                placeholder="مثال: 500000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">السعر الأعلى (ريال)</label>
              <input
                type="number"
                placeholder="مثال: 2000000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المساحة الأدنى (م²)</label>
              <input
                type="number"
                placeholder="مثال: 150"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">المساحة الأعلى (م²)</label>
              <input
                type="number"
                placeholder="مثال: 500"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
              <button
                onClick={() => applyFilters()}
                className="px-6 py-2.5 bg-[#2A2624] text-white font-bold text-xs rounded-xl hover:bg-brand-cafe transition-all"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Counter Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 px-2">
        <div>
          تم العثور على <span className="font-bold text-gray-900">{totalCount}</span> وحدة عقارية
        </div>
      </div>

      {/* Units Grid */}
      {initialUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialUnits.map((unit) => {
            const cardImage =
              unit.unitPlanImage || unit.model?.planImage || unit.project.mainImage || "/placeholder-unit.jpg";

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Card Image */}
                <div className="relative h-60 bg-gray-100 overflow-hidden">
                  <img
                    src={cardImage}
                    alt={`وحدة رقم ${unit.unitNum}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {getStatusBadge(unit.status)}
                    <span className="bg-[#2A2624]/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                      {formatUnitType(unit.type)}
                    </span>
                  </div>
                  {unit.project && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg">
                      {formatProjectName(unit.project.name)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-cafe transition-colors">
                        وحدة رقم {unit.unitNum}
                      </h3>
                      {unit.floor && (
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-md">
                          {formatFloor(unit.floor)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      📍 {unit.project.city} — حي {unit.project.neighborhood}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center text-xs text-gray-600">
                    <div>
                      <span className="block font-bold text-gray-900 text-sm">{unit.area} م²</span>
                      <span>المساحة</span>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 text-sm">{unit.rooms || "-"}</span>
                      <span>الغرف</span>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 text-sm">{unit.baths || "-"}</span>
                      <span>دورات المياه</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="block text-xs text-gray-400">السعر المطلوب</span>
                      <span className="text-lg font-bold text-brand-cafe">{formatPrice(unit.price)}</span>
                    </div>

                    <Link
                      href={`/units/${unit.id}`}
                      className="px-5 py-2.5 bg-[#2A2624] hover:bg-brand-cafe text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                    >
                      عرض التفاصيل ➔
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 max-w-xl mx-auto space-y-4">
          <div className="text-5xl">🏢</div>
          <h3 className="text-xl font-bold text-gray-900">لم يتم العثور على وحدات عقارية</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            لم نجد نتائج تطابق خيارات التصفية الحالية. حاول تغيير شروط البحث أو اضغط على تصفير الفلاتر للاطلاع على كافة العقارات المتاحة.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-brand-cafe text-white text-xs font-bold rounded-xl hover:bg-[#2A2624] transition-all"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => applyFilters({ page: p.toString() })}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                p === currentPage
                  ? "bg-[#2A2624] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
