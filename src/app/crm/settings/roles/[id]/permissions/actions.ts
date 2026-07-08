"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateRolePermissions(roleId: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const hasAccess = await requirePermission("RBAC_MANAGE", { context: "updateRolePermissions Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  // We are expecting checkboxes in format: permission_{id}=on
  const permissionIds: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("permission_") && value === "on") {
      permissionIds.push(key.replace("permission_", ""));
    }
  }

  // Use a transaction for safety
  await prisma.$transaction(async (tx) => {
    // Get existing permissions for this role
    const existingLinks = await tx.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true }
    });
    
    const existingIds = existingLinks.map(l => l.permissionId);
    
    // Find what needs to be added and what needs to be removed
    const toAdd = permissionIds.filter(id => !existingIds.includes(id));
    const toRemove = existingIds.filter(id => !permissionIds.includes(id));

    // Remove safely by explicitly matching roleId and permissionId, avoiding deleteMany entirely
    for (const pid of toRemove) {
      const link = await tx.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: pid
          }
        }
      });
      
      if (link) {
        await tx.rolePermission.delete({
          where: { id: link.id }
        });
      }
    }

    // Add new ones using create (since they don't exist yet)
    for (const pid of toAdd) {
      await tx.rolePermission.create({
        data: {
          roleId,
          permissionId: pid
        }
      });
    }
  });

  revalidatePath(`/crm/settings/roles/${roleId}/permissions`);
  revalidatePath(`/crm/settings/roles`);
  redirect(`/crm/settings/roles/${roleId}/permissions?success=true`);
}
