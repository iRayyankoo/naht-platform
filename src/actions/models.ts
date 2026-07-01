"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { actionRequireRole } from "@/lib/auth-helpers";

export async function createProjectModel(formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const projectId = formData.get("projectId") as string;
  if (!projectId) throw new Error("Missing projectId");

  const name = formData.get("name") as string;
  if (!name) throw new Error("Name is required");

  const code = formData.get("code") as string || null;
  const description = formData.get("description") as string || null;
  const planImage = formData.get("planImage") as string || null;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON" | null;
  
  const area = formData.get("area") as string || null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const sortOrder = formData.get("sortOrder") ? parseInt(formData.get("sortOrder") as string) : 0;
  
  const isVisible = formData.get("isVisible") === "on";

  await prisma.projectModel.create({
    data: {
      projectId,
      name,
      code,
      description,
      planImage,
      status,
      area,
      rooms: isNaN(rooms as number) ? null : rooms,
      baths: isNaN(baths as number) ? null : baths,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      isVisible
    }
  });

  revalidatePath(`/crm/projects/${projectId}/models`);
}

export async function updateProjectModel(id: string, formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const projectId = formData.get("projectId") as string;
  if (!projectId) throw new Error("Missing projectId");

  const name = formData.get("name") as string;
  if (!name) throw new Error("Name is required");

  const code = formData.get("code") as string || null;
  const description = formData.get("description") as string || null;
  const planImage = formData.get("planImage") as string || null;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON" | null;
  
  const area = formData.get("area") as string || null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const sortOrder = formData.get("sortOrder") ? parseInt(formData.get("sortOrder") as string) : 0;
  
  const isVisible = formData.get("isVisible") === "on";

  await prisma.projectModel.update({
    where: { id },
    data: {
      name,
      code,
      description,
      planImage,
      status,
      area,
      rooms: isNaN(rooms as number) ? null : rooms,
      baths: isNaN(baths as number) ? null : baths,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      isVisible
    }
  });

  revalidatePath(`/crm/projects/${projectId}/models`);
}

export async function deleteProjectModel(id: string) {
  await actionRequireRole(["ADMIN"]);
  
  // First, verify units count
  const model = await prisma.projectModel.findUnique({
    where: { id },
    include: { _count: { select: { units: true } } }
  });

  if (!model) {
    throw new Error("Model not found");
  }

  if (model._count.units > 0) {
    throw new Error("Cannot delete a model that has linked units. Please unassign the units first.");
  }

  await prisma.projectModel.delete({ where: { id } });
  revalidatePath(`/crm/projects/${model.projectId}/models`);
}
