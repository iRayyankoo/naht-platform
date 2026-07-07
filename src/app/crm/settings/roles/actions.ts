"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRole(formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  await prisma.appRole.create({
    data: {
      name,
      code,
      description: description || null,
      isActive,
    },
  });

  revalidatePath("/crm/settings/roles");
  redirect("/crm/settings/roles");
}

export async function updateRole(id: string, formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) {
    throw new Error("Name and code are required");
  }

  await prisma.appRole.update({
    where: { id },
    data: {
      name,
      code,
      description: description || null,
      isActive,
    },
  });

  revalidatePath("/crm/settings/roles");
  redirect("/crm/settings/roles");
}
