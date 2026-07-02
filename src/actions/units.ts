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
  
  const modelId = formData.get("modelId") as string || null;

  // Verify model belongs to project if provided
  if (modelId) {
    const model = await prisma.projectModel.findUnique({ where: { id: modelId } });
    if (!model || model.projectId !== projectId) {
      throw new Error("النموذج غير موجود أو لا يتبع لهذا المشروع");
    }
  }

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
      modelId,
    },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath(`/crm/projects/${projectId}/models`);
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

export async function updateUnitModelDetails(formData: FormData) {
  await checkAdminOrMarketing();

  const unitId = formData.get("unitId") as string;
  const projectId = formData.get("projectId") as string;
  
  if (!unitId || !projectId) {
    throw new Error("بيانات الوحدة أو المشروع مفقودة");
  }

  // Verify unit belongs to project
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit || unit.projectId !== projectId) {
    throw new Error("الوحدة غير موجودة أو لا تتبع لهذا المشروع");
  }

  const modelId = formData.get("modelId") as string || null;

  // Verify model belongs to project if provided
  if (modelId) {
    const model = await prisma.projectModel.findUnique({ where: { id: modelId } });
    if (!model || model.projectId !== projectId) {
      throw new Error("النموذج غير موجود أو لا يتبع لهذا المشروع");
    }
  }

  const floor = formData.get("floor") as string || null;
  const facade = formData.get("facade") as string || null;
  const unitPlanImage = formData.get("unitPlanImage") as string || null;
  const sortOrderRaw = formData.get("sortOrder");
  const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw as string) : 0;

  await prisma.unit.update({
    where: { id: unitId },
    data: {
      modelId,
      floor,
      facade,
      unitPlanImage,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
    },
  });

  revalidatePath(`/crm/projects/${projectId}/units`);
  revalidatePath(`/crm/projects/${projectId}/models`);
  revalidatePath("/projects");
}
