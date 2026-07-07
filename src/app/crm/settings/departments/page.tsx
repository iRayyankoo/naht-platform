import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { requirePermissionLogging } from "@/lib/rbac-helpers";
import Link from "next/link";
import ContentCard from "@/components/platform/layout/ContentCard";

export default async function DepartmentsPage() {
  await requireRole(["ADMIN"]);
  await requirePermissionLogging("ORG_VIEW", "Departments Page");

  const departments = await prisma.department.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة الأقسام</h1>
          <p className="text-sm text-gray-500 mt-1">عرض وإدارة أقسام المنظمة والهيكل التنظيمي</p>
        </div>
        <Link 
          href="/crm/settings/departments/new" 
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          قسم جديد
        </Link>
      </div>

      <ContentCard title="قائمة الأقسام">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="text-gray-300 text-6xl mb-4">🏢</div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">لا يوجد أقسام حالياً</h3>
             <p className="text-gray-500 text-sm max-w-md">ابدأ بإضافة قسم جديد لإعداد الهيكل التنظيمي.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-600 min-w-[800px]">
              <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">القسم</th>
                  <th className="px-6 py-4 font-medium">الكود</th>
                  <th className="px-6 py-4 font-medium">الوصف</th>
                  <th className="px-6 py-4 font-medium text-center">الموظفين</th>
                  <th className="px-6 py-4 font-medium text-center">الترتيب</th>
                  <th className="px-6 py-4 font-medium text-center">الحالة</th>
                  <th className="px-6 py-4 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {departments.map((dept) => (
                  <tr key={dept.id} className={`hover:bg-gray-50/50 transition-colors ${!dept.isActive ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{dept.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {dept.code}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {dept.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">
                      {dept._count.users}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {dept.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dept.isActive ? "فعال" : "معطل"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <Link 
                        href={`/crm/settings/departments/${dept.id}/edit`} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        title="تعديل القسم"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>
    </div>
  );
}
