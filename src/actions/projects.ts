"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { actionRequireRole } from "@/lib/auth-helpers";

export async function createProject(formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = formData.get("shortDesc") as string;
  const mainImage = formData.get("mainImage") as string;
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
      mainImage,
      isFeatured,
      isVisible,
    },
  });

  revalidatePath("/crm/projects");
  revalidatePath("/projects");
  redirect("/crm/projects");
}

export async function updateProject(id: string, formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = formData.get("shortDesc") as string;
  const mainImage = formData.get("mainImage") as string;
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
      mainImage,
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
  await actionRequireRole(["ADMIN"]);

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/crm/projects");
  revalidatePath("/projects");
}
