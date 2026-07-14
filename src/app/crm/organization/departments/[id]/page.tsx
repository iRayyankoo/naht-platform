import { getDepartmentDetails } from "@/actions/org-departments";
import DepartmentDetailsClient from "./DepartmentDetailsClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DepartmentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  let dept;
  try {
    dept = await getDepartmentDetails(id);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Access Denied") {
      throw err; // Trigger error boundary
    }
    notFound();
  }

  if (!dept) {
    notFound();
  }

  const isSuper = await isSuperAdmin(user.id);
  const scopedPerms = await getCurrentUserScopedPermissions(user.id);
  
  const hasScope = (permCode: string) => {
    if (isSuper) return true;
    const scopes = scopedPerms.get(permCode) || new Set();
    if (scopes.has("COMPANY")) return true;
    if (scopes.has("DEPARTMENT") && dept.manager?.id === user.id) return true;
    return false;
  };

  const permissions = {
    canAssign: hasScope("org.members.assign"),
    canAssignManager: hasScope("org.departments.manager"),
    canManageMembers: hasScope("org.members.manage") // For changing role/ending membership
  };

  const mappedDept = {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    manager: dept.manager ? { id: dept.manager.id, name: dept.manager.name || "" } : null,
    members: dept.members.map(m => ({
      id: m.id,
      userId: m.user.id,
      userName: m.user.name || "",
      userEmail: m.user.email || "",
      isPrimary: m.isPrimary,
      membershipRole: m.membershipRole,
      status: m.user.status
    }))
  };

  return <DepartmentDetailsClient data={mappedDept} permissions={permissions} currentUserId={user.id} />;
}
