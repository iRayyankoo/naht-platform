"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== "ADMIN" && userRole !== "MARKETING") {
    throw new Error("غير مصرح لك بإضافة مشاريع");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = formData.get("shortDesc") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  await prisma.project.create({
    data: {
      name,
      slug,
      type,
      city,
      neighborhood,
      status,
      shortDesc,
      isFeatured,
      isVisible,
    },
  });

  revalidatePath("/crm/projects");
  revalidatePath("/projects");
  redirect("/crm/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== "ADMIN" && userRole !== "MARKETING") {
    throw new Error("غير مصرح لك بتعديل المشاريع");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = formData.get("shortDesc") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  await prisma.project.update({
    where: { id },
    data: {
      name,
      slug,
      type,
      city,
      neighborhood,
      status,
      shortDesc,
      isFeatured,
      isVisible,
    },
  });

  revalidatePath("/crm/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/projects");
  redirect("/crm/projects");
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  // Only ADMIN can delete projects
  if (userRole !== "ADMIN") {
    throw new Error("غير مصرح لك بحذف المشاريع");
  }

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/crm/projects");
  revalidatePath("/projects");
}
