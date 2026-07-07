import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import ContentCard from "@/components/platform/layout/ContentCard";

export default async function RolesPage() {
  await requireRole(["ADMIN"]);

  const roles = await prisma.appRole.findMany({
    include: {
      _count: {
        select: { users: true, permissions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-7xl mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة الأدوار (AppRoles)</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة أدوار النظام وتعيين الصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/crm/settings/permissions" 
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            عرض الصلاحيات
          </Link>
          <Link 
            href="/crm/settings/roles/new" 
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إضافة دور
          </Link>
        </div>
      </div>

      <ContentCard title="الأدوار المتوفرة">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">الاسم والكود</th>
                <th scope="col" className="px-6 py-4 font-bold">الوصف</th>
                <th scope="col" className="px-6 py-4 font-bold text-center">الموظفين</th>
                <th scope="col" className="px-6 py-4 font-bold text-center">الصلاحيات</th>
                <th scope="col" className="px-6 py-4 font-bold text-center">الحالة</th>
                <th scope="col" className="px-6 py-4 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{role.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{role.code}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                    {role.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {role._count.users}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {role._count.permissions}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      role.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {role.isActive ? 'نشط' : 'معطل'}
                    </span>
                    {role.isSystem && (
                      <span className="block text-[10px] text-gray-400 mt-1 font-semibold uppercase">نظام الأساس</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/crm/settings/roles/${role.id}/permissions`}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
                      >
                        الصلاحيات
                      </Link>
                      <Link 
                        href={`/crm/settings/roles/${role.id}/edit`}
                        className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="تعديل الدور"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد أدوار حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
