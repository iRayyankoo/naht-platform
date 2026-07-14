import { getUserMembershipHistory } from "@/actions/org-departments";
import MemberDetailsClient from "./MemberDetailsClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MemberDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/auth/login");
  }

  let history;
  try {
    history = await getUserMembershipHistory(id);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Access Denied") {
      throw err; // Trigger error boundary
    }
    notFound();
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: id },
    select: { id: true, name: true, email: true, status: true }
  });

  if (!targetUser) {
    notFound();
  }

  const isSuper = await isSuperAdmin(currentUser.id);
  const scopedPerms = await getCurrentUserScopedPermissions(currentUser.id);
  
  const hasScope = (permCode: string) => {
    if (isSuper) return true;
    const scopes = scopedPerms.get(permCode) || new Set();
    if (scopes.has("COMPANY")) return true;
    if (scopes.has("DEPARTMENT")) {
      // If DEPARTMENT scope, they can manage if they manage any of the departments this user is in.
      // We pass the raw boolean, and the client component will further restrict buttons based on the specific department.
      return true;
    }
    return false;
  };

  const permissions = {
    canManageMembers: hasScope("org.members.manage"),
    isCompanyScope: isSuper || (scopedPerms.get("org.members.manage") || new Set()).has("COMPANY")
  };

  // We need to know which departments the current user manages to allow DEPARTMENT scope to act
  let managedDepartmentIds: string[] = [];
  if (!permissions.isCompanyScope && permissions.canManageMembers) {
    const myDepts = await prisma.department.findMany({
      where: { managerId: currentUser.id },
      select: { id: true }
    });
    managedDepartmentIds = myDepts.map(d => d.id);
  }

  const mappedTargetUser = {
    id: targetUser.id,
    name: targetUser.name || "",
    email: targetUser.email || "",
    status: targetUser.status
  };

  return (
    <MemberDetailsClient 
      user={mappedTargetUser}
      history={history} 
      permissions={permissions} 
      managedDepartmentIds={managedDepartmentIds}
      currentUserId={currentUser.id}
    />
  );
}
