import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";
import AccessDenied from "@/components/crm/AccessDenied";
import Link from "next/link";
import ContentCard from "@/components/platform/layout/ContentCard";

export default async function PermissionsPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  await requireRole(["ADMIN"]);
  const hasAccess = await requirePermission("RBAC_VIEW", { context: "Permissions Page" });
  if (!hasAccess) return <AccessDenied />;

  const moduleFilter = (await searchParams).module;

  const permissions = await prisma.permission.findMany({
    where: moduleFilter ? { module: moduleFilter } : undefined,
    orderBy: [
      { module: "asc" },
      { action: "asc" }
    ]
  });

  // Get distinct modules for the filter dropdown
  const distinctModules = await prisma.permission.findMany({
    select: { module: true },
    distinct: ['module'],
    orderBy: { module: "asc" }
  });

  return (
    <div className="space-y-4 xl:space-y-6 max-w-7xl mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">صلاحيات النظام (Permissions)</h1>
          <p className="text-sm text-gray-500 mt-1">عرض جميع الصلاحيات المتوفرة في النظام (قراءة فقط)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/crm/settings/roles" 
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            العودة للأدوار
          </Link>
        </div>
      </div>

      <ContentCard title="قائمة الصلاحيات">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-xs">
            <form method="GET" className="flex items-center gap-2">
              <label htmlFor="module" className="text-sm font-medium text-gray-700">تصفية حسب الوحدة:</label>
              <select 
                id="module"
                name="module"
                defaultValue={moduleFilter || ""}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-lg py-2 px-3 border bg-white cursor-pointer"
              >
                <option value="">الكل (All)</option>
                {distinctModules.map(m => (
                  <option key={m.module} value={m.module}>{m.module}</option>
                ))}
              </select>
              <button 
                type="submit" 
                className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                تطبيق
              </button>
            </form>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            إجمالي الصلاحيات: {permissions.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold w-[120px]">الوحدة (Module)</th>
                <th scope="col" className="px-6 py-4 font-bold w-[120px]">الإجراء (Action)</th>
                <th scope="col" className="px-6 py-4 font-bold">الكود (Code)</th>
                <th scope="col" className="px-6 py-4 font-bold">الوصف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                      {perm.module}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 uppercase tracking-wide">{perm.action}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700 font-mono text-xs">
                    {perm.code}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {perm.description || "—"}
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد صلاحيات مطابقة.
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
