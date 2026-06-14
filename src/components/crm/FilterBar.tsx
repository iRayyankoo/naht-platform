"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
}

export default function FilterBar({ fields, searchPlaceholder }: { fields: FilterField[], searchPlaceholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    router.push(`?${createQueryString(key, value)}`);
  };

  const clearFilters = () => {
    router.push("?");
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
      {searchPlaceholder && (
        <div className="flex-1 min-w-[200px] max-w-[250px]">
          <label className="block text-xs font-bold text-gray-500 mb-1">بحث</label>
          <input
            type="text"
            placeholder={searchPlaceholder}
            defaultValue={searchParams.get("q") || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleFilterChange("q", e.currentTarget.value);
              }
            }}
            onBlur={(e) => handleFilterChange("q", e.target.value)}
            className="w-full border-gray-300 rounded-md p-2 text-sm border focus:ring-primary focus:border-primary bg-gray-50"
          />
        </div>
      )}
      {fields.map((field) => (
        <div key={field.key} className="flex-1 min-w-[200px] max-w-[250px]">
          <label className="block text-xs font-bold text-gray-500 mb-1">{field.label}</label>
          <select
            value={searchParams.get(field.key) || ""}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            className="w-full border-gray-300 rounded-md p-2 text-sm border focus:ring-primary focus:border-primary bg-gray-50"
          >
            <option value="">الكل</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition-colors border border-red-100"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}
