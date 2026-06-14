"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdminOrMarketing() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (userRole !== "ADMIN" && userRole !== "MARKETING") {
    throw new Error("غير مصرح لك بإدارة الوحدات");
  }
  return userRole;
}

export async function createUnit(projectId: string, formData: FormData) {
  await checkAdminOrMarketing();

  const unitNum = formData.get("unitNum") as string;
  const type = formData.get("type") as string;
  const area = parseFloat(formData.get("area") as string) || 0;
  const rooms = parseInt(formData.get("rooms") as string) || 0;
  const baths = parseInt(formData.get("baths") as string) || 0;
  const price = parseFloat(formData.get("price") as string) || 0;
  const status = formData.get("status") as string;
  const isVisible = formData.get("isVisible") === "true";

  await prisma.unit.create({
    data: {
      projectId,
      unitNum,
      type,
      area,
      rooms,
      baths,
      price,
      status,
      isVisible,
    },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath("/projects");
}

export async function updateUnitStatus(id: string, projectId: string, status: string) {
  await checkAdminOrMarketing();

  await prisma.unit.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath("/projects");
}

export async function toggleUnitVisibility(id: string, projectId: string, isVisible: boolean) {
  await checkAdminOrMarketing();

  await prisma.unit.update({
    where: { id },
    data: { isVisible },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath("/projects");
}

export async function deleteUnit(id: string, projectId: string) {
  const userRole = await checkAdminOrMarketing();
  
  if (userRole !== "ADMIN") {
    throw new Error("غير مصرح لك بحذف الوحدات، يحق للمدير فقط");
  }

  await prisma.unit.delete({
    where: { id },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath("/projects");
}
