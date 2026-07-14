"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, ChevronLeft, Building2 } from "@/components/crm/organization/icons";

interface Department {
  id: string;
  name: string;
  code: string;
  manager: { id: string; name: string } | null;
  membersCount: number;
}

interface DepartmentsData {
  total: number;
  pages: number;
  departments: Department[];
}

export default function DepartmentsListClient({ 
  data, 
  currentPage, 
  currentSearch 
}: { 
  data: DepartmentsData; 
  currentPage: number; 
  currentSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/crm/organization/departments?page=1&search=${encodeURIComponent(search)}`);
    // Router push will re-render server component, so we just let it load
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/crm/organization/departments?page=${newPage}&search=${encodeURIComponent(currentSearch)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            الأقسام
          </h1>
          <p className="text-gray-500 mt-1">
            إجمالي الأقسام: {data.total}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <input
              type="text"
              placeholder="البحث بالاسم أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button type="submit" className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">اسم القسم</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">الرمز</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">مدير القسم</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">عدد الأعضاء</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900 w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا توجد أقسام مطابقة للبحث
                  </td>
                </tr>
              ) : (
                data.departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-gray-500">{dept.code}</td>
                    <td className="px-6 py-4">
                      {dept.manager ? (
                        <Link href={`/crm/organization/members/${dept.manager.id}`} className="text-primary hover:underline">
                          {dept.manager.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400 italic">لا يوجد مدير</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{dept.membersCount} عضواً</td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/crm/organization/departments/${dept.id}`}
                        className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              الصفحة {currentPage} من {data.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
