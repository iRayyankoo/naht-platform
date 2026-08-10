import { requireAuth } from "@/lib/auth-helpers";
import Link from "next/link";
import { ImpersonationBanner } from "@/components/crm/ImpersonationBanner";
import { getImpersonationRuntimeContext } from "@/lib/impersonation-runtime-context";
import CrmSidebar from "@/components/crm/CrmSidebar";
import { getCurrentUserPermissions, isSuperAdmin, getCurrentUserScopedPermissions } from "@/lib/rbac-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const userId = user.id;

  const impersonationContext = await getImpersonationRuntimeContext();
  const permissions = await getCurrentUserPermissions(userId);

  let orgScope = "NONE";
  const isSuper = await isSuperAdmin(userId);
  const scopedPerms = await getCurrentUserScopedPermissions(userId);
  const orgViewScopes = scopedPerms.get("org.departments.view") || new Set();
  const membersViewScopes = scopedPerms.get("org.members.view") || new Set();

  if (isSuper || orgViewScopes.has("COMPANY") || membersViewScopes.has("COMPANY")) {
    orgScope = "COMPANY";
  } else if (orgViewScopes.has("DEPARTMENT") || membersViewScopes.has("DEPARTMENT")) {
    orgScope = "DEPARTMENT";
  } else if (membersViewScopes.has("SELF")) {
    orgScope = "SELF";
  }

  const canViewOrganization = orgScope === "COMPANY" || orgScope === "DEPARTMENT" || orgScope === "SELF";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <CrmSidebar
        userName={user.name || "مستخدم"}
        userRole={user.role || "VIEWER"}
        userPermissions={permissions}
        orgScope={orgScope}
        canViewOrganization={canViewOrganization}
        isSuperAdmin={isSuper}
        userId={user.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ImpersonationBanner context={impersonationContext} />
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center md:hidden rtl:pr-12 ltr:pl-12">
            <h1 className="text-xl font-bold text-primary">نحت العقارية</h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center">
            <Link href="/api/auth/signout" className="text-sm text-gray-600 hover:text-red-600 font-medium">
              تسجيل الخروج
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
