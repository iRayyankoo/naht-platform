"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/audit-logger";

export async function createRole(formData: FormData) {
  const currentUser = await requireRole(["ADMIN"]);
  const hasAccess = await requirePermission("RBAC_MANAGE", { context: "createRole Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  const newRole = await prisma.appRole.create({
    data: {
      name,
      code,
      description: description || null,
      isActive,
    },
  });

  try {
    await logAuditEvent({
      action: "ROLE_CREATED",
      actorUserId: currentUser.id,
      entityType: "ROLE",
      entityId: newRole.id,
      metadata: {
        roleId: newRole.id,
        roleName: newRole.name,
      }
    });
  } catch (error) {
    console.error("Failed to log ROLE_CREATED:", error);
  }

  revalidatePath("/crm/settings/roles");
  redirect("/crm/settings/roles");
}

export async function updateRole(id: string, formData: FormData) {
  const currentUser = await requireRole(["ADMIN"]);
  const hasAccess = await requirePermission("RBAC_MANAGE", { context: "updateRole Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  const updatedRole = await prisma.appRole.update({
    where: { id },
    data: {
      name,
      code,
      description: description || null,
      isActive,
    },
  });

  try {
    await logAuditEvent({
      action: "ROLE_UPDATED",
      actorUserId: currentUser.id,
      entityType: "ROLE",
      entityId: updatedRole.id,
      metadata: {
        roleId: updatedRole.id,
        roleName: updatedRole.name,
        changedFields: { name, code, isActive },
      }
    });
  } catch (error) {
    console.error("Failed to log ROLE_UPDATED:", error);
  }

  revalidatePath("/crm/settings/roles");
  redirect("/crm/settings/roles");
}
