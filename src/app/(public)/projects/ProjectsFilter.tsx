/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface ProjectsFilterProps {
  types: string[];
  statuses: string[];
  cities: string[];
}

export default function ProjectsFilter({ types, statuses, cities }: ProjectsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setType(searchParams.get("type") || "");
    setStatus(searchParams.get("status") || "");
    setCity(searchParams.get("city") || "");
  }, [searchParams]);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(`/projects`, { scroll: false });
  };

  const hasFilters = searchParams.get("q") || searchParams.get("type") || searchParams.get("status") || searchParams.get("city");

  const typeLabels: Record<string, string> = {
    villas: "فلل",
    villa: "فلل",
    floors: "أدوار",
    floor: "أدوار",
    villasfloors: "فلل وأدوار",
    apartments: "شقق",
    apartment: "شقق",
    townhouse: "تاون هاوس",
    "فلل": "فلل",
    "أدوار": "أدوار",
    "شقق": "شقق",
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: "متاح",
    SOLD: "مباع",
    SOLD_OUT: "مباع",
    SOON: "قريباً",
    COMING_SOON: "قريباً",
    UNDER_CONSTRUCTION: "تحت الإنشاء",
    "متاح": "متاح",
    "مباع": "مباع",
    "قريباً": "قريباً",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A6937C]/20 mb-10 max-w-5xl mx-auto -mt-10 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[#A6937C] font-bold tracking-wider uppercase mb-0.5">تصفية المشاريع</p>
          <h2 className="text-sm font-bold text-[#4F4949]">ابحث عن عقارك المناسب</h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors border border-red-200 px-3 py-1.5 rounded-lg"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        {/* Text Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#4F4949]">بحث بالاسم أو الحي</label>
          <input
            type="text"
            placeholder="اسم المشروع، الحي..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFilter("q", q);
            }}
            onBlur={() => handleFilter("q", q)}
            className="w-full px-3.5 py-2 border border-[#A6937C]/30 rounded-lg focus:ring-2 focus:ring-[#A6937C] focus:border-[#A6937C] outline-none text-xs bg-[#F9F9F9]"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#4F4949]">النوع</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              handleFilter("type", e.target.value);
            }}
            className="w-full px-3.5 py-2 border border-[#A6937C]/30 rounded-lg focus:ring-2 focus:ring-[#A6937C] focus:border-[#A6937C] outline-none text-xs bg-[#F9F9F9] text-[#4F4949] cursor-pointer"
          >
            <option value="">جميع الأنواع</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {typeLabels[t.toLowerCase().trim()] || t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#4F4949]">الحالة</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              handleFilter("status", e.target.value);
            }}
            className="w-full px-3.5 py-2 border border-[#A6937C]/30 rounded-lg focus:ring-2 focus:ring-[#A6937C] focus:border-[#A6937C] outline-none text-xs bg-[#F9F9F9] text-[#4F4949] cursor-pointer"
          >
            <option value="">جميع الحالات</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s] || s}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#4F4949]">المدينة</label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              handleFilter("city", e.target.value);
            }}
            className="w-full px-3.5 py-2 border border-[#A6937C]/30 rounded-lg focus:ring-2 focus:ring-[#A6937C] focus:border-[#A6937C] outline-none text-xs bg-[#F9F9F9] text-[#4F4949] cursor-pointer"
          >
            <option value="">جميع المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
