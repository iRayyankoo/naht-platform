"use server";

import { prisma } from "@/lib/prisma";
import { actionRequireRole } from "@/lib/auth-helpers";
import { requirePermission } from "@/lib/rbac-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDepartment(formData: FormData) {
  await actionRequireRole(["ADMIN"]);
  const hasAccess = await requirePermission("ORG_MANAGE", { context: "createDepartment Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const sortOrderStr = formData.get("sortOrder") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  await prisma.department.create({
    data: {
      name,
      code,
      description: description || null,
      sortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : 0,
      isActive,
    },
  });

  revalidatePath("/crm/settings/departments");
  redirect("/crm/settings/departments");
}

export async function updateDepartment(id: string, formData: FormData) {

  await actionRequireRole(["ADMIN"]);
  const hasAccess = await requirePermission("ORG_MANAGE", { context: "updateDepartment Action" });
  if (!hasAccess) throw new Error("ليس لديك صلاحية لإجراء هذه العملية");

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const sortOrderStr = formData.get("sortOrder") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  await prisma.department.update({
    where: { id },
    data: {
      name,
      code,
      description: description || null,
      sortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : 0,
      isActive,
    },
  });

  revalidatePath("/crm/settings/departments");
  redirect("/crm/settings/departments");
}
