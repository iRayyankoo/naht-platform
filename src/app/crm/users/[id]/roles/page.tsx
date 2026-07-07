import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { requirePermissionLogging } from "@/lib/rbac-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentCard from "@/components/platform/layout/ContentCard";
import { assignUserRoles } from "./actions";

export default async function UserRolesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  await requirePermissionLogging("USERS_MANAGE_ROLES", "UserRoles Page");
  
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      userRoles: {
        include: { role: true }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const allRoles = await prisma.appRole.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  const currentUserRoleIds = user.userRoles.map(ur => ur.roleId);

  return (
    <div className="space-y-4 xl:space-y-6 max-w-4xl mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة أدوار المستخدم</h1>
          <p className="text-sm text-gray-500 mt-1">
            تعيين الصلاحيات والأدوار المخصصة للمستخدم: <span className="font-semibold text-primary">{user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/crm/users/${user.id}/edit`} 
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            العودة لبيانات المستخدم
          </Link>
          <Link 
            href="/crm/users" 
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            قائمة المستخدمين
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
        
        {/* User Info Card */}
        <div className="md:col-span-1">
          <ContentCard title="بيانات المستخدم">
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="block text-gray-500 text-xs mb-1">الاسم</span>
                <span className="font-semibold">{user.name || "—"}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">البريد الإلكتروني</span>
                <span className="font-mono text-xs">{user.email}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">الدور القديم (Legacy Role)</span>
                <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-bold font-mono">
                  {user.role}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">القسم / المسمى الوظيفي</span>
                <span className="font-medium">
                  {user.department?.name || "بدون قسم"}
                  {user.jobTitle ? ` - ${user.jobTitle}` : ""}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">الحالة</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? "نشط" : "معطل"}
                </span>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Roles Form Card */}
        <div className="md:col-span-2">
          <ContentCard title="أدوار النظام المخصصة (AppRoles)">
            <form action={assignUserRoles.bind(null, user.id)} className="space-y-6">
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 leading-relaxed">
                <p>
                  <strong>ملاحظة:</strong> تحديد الأدوار هنا سيمنح المستخدم الصلاحيات المربوطة بكل دور. لا يتم إلغاء الدور القديم حالياً لضمان استقرار النظام.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allRoles.map((role) => {
                  const isChecked = currentUserRoleIds.includes(role.id);
                  const isSuperAdmin = role.code === "SUPER_ADMIN";
                  // Add a visual indicator if it's super admin
                  return (
                    <label 
                      key={role.id} 
                      className={`relative flex items-start p-4 cursor-pointer rounded-xl border transition-all ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${isSuperAdmin ? 'ring-1 ring-red-100 border-red-200 bg-red-50/20' : ''}`}
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          name="roleIds"
                          value={role.id}
                          defaultChecked={isChecked}
                          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-offset-0 transition-colors cursor-pointer"
                        />
                      </div>
                      <div className="ml-3 rtl:mr-3 rtl:ml-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isSuperAdmin ? 'text-red-700' : 'text-gray-900'}`}>{role.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded tracking-wider">{role.code}</span>
                        </div>
                        {role.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  حفظ تعديلات الأدوار
                </button>
              </div>

            </form>
          </ContentCard>
        </div>

      </div>
    </div>
  );
}
