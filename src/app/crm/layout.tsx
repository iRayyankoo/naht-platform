import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/auth/login");
  // }

  const impersonationContext = await getImpersonationRuntimeContext();
  const permissions = session?.user ? await getCurrentUserPermissions(session?.user.id) : [];

  let orgScope = "NONE";
  let isSuper = false;
  if (session?.user) {
    isSuper = await isSuperAdmin(session.user.id);
    const scopedPerms = await getCurrentUserScopedPermissions(session.user.id);
    const orgViewScopes = scopedPerms.get("org.departments.view") || new Set();
    const membersViewScopes = scopedPerms.get("org.members.view") || new Set();

    if (isSuper || orgViewScopes.has("COMPANY") || membersViewScopes.has("COMPANY")) {
      orgScope = "COMPANY";
    } else if (orgViewScopes.has("DEPARTMENT") || membersViewScopes.has("DEPARTMENT")) {
      orgScope = "DEPARTMENT";
    } else if (membersViewScopes.has("SELF")) {
      orgScope = "SELF";
    }
  }

  const canViewOrganization = orgScope === "COMPANY" || orgScope === "DEPARTMENT" || orgScope === "SELF";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <CrmSidebar
        userName={session?.user?.name || "مستخدم"}
        userRole={(session?.user as any)?.role || "VIEWER"}
        userPermissions={permissions}
        orgScope={orgScope}
        canViewOrganization={canViewOrganization}
        isSuperAdmin={isSuper}
        userId={session?.user?.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ImpersonationBanner context={impersonationContext} />
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center md:hidden">
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
