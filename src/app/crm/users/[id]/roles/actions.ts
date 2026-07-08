"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { actionRequireRole } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";

export async function assignUserRoles(userId: string, formData: FormData) {
  await actionRequireRole(["ADMIN"]);
  const hasAccess = await requirePermission("USERS_MANAGE_ROLES", { context: "assignUserRoles Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  // 1. Fetch the user to ensure they exist and check for SUPER_ADMIN protection
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  });

  if (!targetUser) throw new Error("المستخدم غير موجود");

  // 2. Parse the submitted roles
  // We assume checkboxes have name="roleIds" and value="{roleId}"
  const submittedRoleIds = formData.getAll("roleIds") as string[];

  // 3. Find current roles
  const currentRoleIds = targetUser.userRoles.map(ur => ur.roleId);

  // 4. Calculate Delta (toAdd, toRemove)
  const toAdd = submittedRoleIds.filter(id => !currentRoleIds.includes(id));
  const toRemove = currentRoleIds.filter(id => !submittedRoleIds.includes(id));

  // 5. SUPER_ADMIN Protection Logic
  const superAdminRole = await prisma.appRole.findUnique({ where: { code: "SUPER_ADMIN" } });
  
  if (superAdminRole && toRemove.includes(superAdminRole.id)) {
    // Rule A: Cannot remove SUPER_ADMIN from nahtmkt@gmail.com
    if (targetUser.email === "nahtmkt@gmail.com") {
      throw new Error("عملية مرفوضة: لا يمكن إزالة صلاحية المشرف العام عن الحساب الأساسي للنظام.");
    }

    // Rule B: Cannot leave the system without a SUPER_ADMIN
    // Count how many ACTIVE users currently have SUPER_ADMIN
    const superAdminUsersCount = await prisma.userRole.count({
      where: {
        roleId: superAdminRole.id,
        user: { isActive: true }
      }
    });

    if (superAdminUsersCount <= 1) {
      throw new Error("عملية مرفوضة: لا يمكن إزالة المشرف العام الوحيد المتبقي في النظام.");
    }
    
    // (Self-stripping SUPER_ADMIN is generally a bad idea, we rely on the above checks mostly, 
    // but if the logged-in user is the targetUser, we might block it. Currently we don't have session user easily here without getting session, 
    // but Rule A and B cover the catastrophic lockouts).
  }

  // 6. Safe DB Mutations using Transaction
  await prisma.$transaction(async (tx) => {
    // Add new roles
    for (const roleId of toAdd) {
      await tx.userRole.create({
        data: {
          userId,
          roleId
        }
      });
    }

    // Remove old roles using specific compound key
    for (const roleId of toRemove) {
      await tx.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId
          }
        }
      });
    }
  });

  // 7. Revalidate
  revalidatePath("/crm/users");
  revalidatePath(`/crm/users/${userId}/edit`);
  revalidatePath(`/crm/users/${userId}/roles`);
}
