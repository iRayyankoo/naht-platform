import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClientForm from "@/components/crm/ClientForm";
import ContentCard from "@/components/platform/layout/ContentCard";
import { updateRolePermissions } from "./actions";

export default async function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  
  const id = (await params).id;
  const role = await prisma.appRole.findUnique({
    where: { id },
    include: {
      permissions: true
    }
  });

  if (!role) {
    notFound();
  }

  const rolePermissionIds = role.permissions.map(rp => rp.permissionId);

  const allPermissions = await prisma.permission.findMany({
    orderBy: [
      { module: "asc" },
      { action: "asc" }
    ]
  });

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  const updateAction = updateRolePermissions.bind(null, role.id);

  return (
    <div className="space-y-4 xl:space-y-6 max-w-7xl mx-auto w-full pb-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">صلاحيات الدور</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة الصلاحيات المرتبطة بالدور: <span className="font-bold text-primary">{role.name} ({role.code})</span>
          </p>
        </div>
        <Link 
          href="/crm/settings/roles" 
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          العودة للأدوار
        </Link>
      </div>

      <ClientForm action={updateAction} successMessage="تم حفظ وتحديث صلاحيات الدور بنجاح">
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
            <ContentCard key={moduleName} title={`وحدة النظام: ${moduleName}`}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {modulePerms.map(perm => {
                  const isChecked = rolePermissionIds.includes(perm.id);
                  return (
                    <div key={perm.id} className="relative flex items-start py-4 px-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors bg-white">
                      <div className="min-w-0 flex-1 text-sm">
                        <label htmlFor={`perm_${perm.id}`} className="font-semibold text-gray-900 cursor-pointer block select-none">
                          {perm.action}
                        </label>
                        <p className="text-gray-500 mt-1 text-xs">
                          {perm.description || "لا يوجد وصف"}
                        </p>
                        <p className="text-gray-400 font-mono text-[10px] mt-1.5 uppercase">
                          {perm.code}
                        </p>
                      </div>
                      <div className="ml-3 flex h-6 items-center">
                        <input
                          id={`perm_${perm.id}`}
                          name={`permission_${perm.id}`}
                          type="checkbox"
                          defaultChecked={isChecked}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-colors"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContentCard>
          ))}
        </div>

        <div className="pt-8 mt-6 flex justify-end sticky bottom-6 z-10">
          <button 
            type="submit" 
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/30 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            حفظ تعديلات الصلاحيات
          </button>
        </div>
      </ClientForm>
    </div>
  );
}
