import { getOrganizationOverview } from "@/actions/org-departments";
import OrganizationDashboardClient from "./OrganizationDashboardClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";

export const dynamic = "force-dynamic";

export default async function OrganizationDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  const orgViewScopes = scopedPerms.get("org.departments.view") || new Set();
  const membersViewScopes = scopedPerms.get("org.members.view") || new Set();

  const isCompany = isSuper || orgViewScopes.has("COMPANY") || membersViewScopes.has("COMPANY");
  const isDepartment = !isCompany && (orgViewScopes.has("DEPARTMENT") || membersViewScopes.has("DEPARTMENT"));
  const isSelf = !isCompany && !isDepartment && membersViewScopes.has("SELF");

  if (!isCompany && !isDepartment && !isSelf) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl font-bold text-red-600 mb-2">عذراً، لا تملك الصلاحية</h2>
        <p>ليس لديك صلاحية لعرض الهيكل التنظيمي.</p>
      </div>
    );
  }

  // SELF only sees their own profile, so redirect directly there.
  if (isSelf && !isCompany && !isDepartment) {
    redirect(`/crm/organization/members/${user.id}`);
  }

  const overview = await getOrganizationOverview();

  return (
    <OrganizationDashboardClient 
      overview={overview} 
      scope={isCompany ? "COMPANY" : "DEPARTMENT"} 
    />
  );
}
