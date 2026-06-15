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

  // Optional: update local state if URL changes from outside
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

  const statusLabels: Record<string, string> = {
    AVAILABLE: "متاح",
    SOLD: "مباع",
    COMING_SOON: "قريباً",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 max-w-5xl mx-auto -mt-10 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Text Search */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label className="text-sm font-bold text-gray-700">بحث</label>
          <input
            type="text"
            placeholder="اسم المشروع، الحي..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFilter("q", q);
            }}
            onBlur={() => handleFilter("q", q)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">النوع</label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                handleFilter("type", e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="">الكل</option>
              {types.map((t) => (
                <option key={t} value={t} className="text-gray-900">{t}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">الحالة</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilter("status", e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="">الكل</option>
              {statuses.map((s) => (
                <option key={s} value={s} className="text-gray-900">{statusLabels[s] || s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* City Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">المدينة</label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                handleFilter("city", e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="">الكل</option>
              {cities.map((c) => (
                <option key={c} value={c} className="text-gray-900">{c}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-bold transition-colors"
          >
            مسح الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}
