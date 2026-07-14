"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronRight, ChevronLeft, Users } from "lucide-react";

interface Membership {
  id: string;
  departmentId: string;
  departmentName: string;
  isPrimary: boolean;
  role: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  memberships: Membership[];
}

interface MembersData {
  total: number;
  pages: number;
  members: Member[];
}

export default function MembersListClient({ 
  data, 
  currentPage, 
  currentSearch 
}: { 
  data: MembersData; 
  currentPage: number; 
  currentSearch: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/crm/organization/members?page=1&search=${encodeURIComponent(search)}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/crm/organization/members?page=${newPage}&search=${encodeURIComponent(currentSearch)}`);
  };

  const getPrimaryDepartment = (memberships: Membership[]) => {
    return memberships.find(m => m.isPrimary);
  };

  const getSecondaryDepartments = (memberships: Membership[]) => {
    return memberships.filter(m => !m.isPrimary);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            الموظفون
          </h1>
          <p className="text-gray-500 mt-1">
            إجمالي الأعضاء: {data.total}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <input
              type="text"
              placeholder="البحث بالاسم أو البريد..."
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
                <th className="px-6 py-4 text-sm font-bold text-gray-900">الموظف</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">القسم الأساسي</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900">الأقسام الإضافية</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-900 w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد موظفون مطابقون للبحث
                  </td>
                </tr>
              ) : (
                data.members.map((member) => {
                  const primaryDept = getPrimaryDepartment(member.memberships);
                  const secondaryDepts = getSecondaryDepartments(member.memberships);

                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {member.status === "ACTIVE" ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {primaryDept ? (
                          <Link href={`/crm/organization/departments/${primaryDept.departmentId}`} className="text-primary hover:underline font-medium">
                            {primaryDept.departmentName}
                          </Link>
                        ) : (
                          <span className="text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-md text-xs font-medium">غير معين</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {secondaryDepts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {secondaryDepts.map(d => (
                              <Link key={d.id} href={`/crm/organization/departments/${d.departmentId}`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                                {d.departmentName} ({d.role === "MEMBER" ? "عضو" : "مراقب"})
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/crm/organization/members/${member.id}`}
                          className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
                        >
                          عرض الملف
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
