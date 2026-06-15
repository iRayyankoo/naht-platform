"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { actionRequireRole } from "@/lib/auth-helpers";

function parseRelatedList(jsonStr: string | null) {
  if (!jsonStr) return [];
  try {
    const list = JSON.parse(jsonStr);
    return list.map((item: any, index: number) => {
      const { id, projectId, ...rest } = item;
      return { ...rest, order: index };
    });
  } catch (e) {
    return [];
  }
}

export async function createProject(formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = formData.get("shortDesc") as string;
  const fullDesc = formData.get("fullDesc") as string;
  const mainImage = formData.get("mainImage") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  // Phase 14 Fields
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const progressPercent = formData.get("progressPercent") ? parseInt(formData.get("progressPercent") as string) : null;
  const progressLabel = formData.get("progressLabel") as string || null;
  const googleMapsUrl = formData.get("googleMapsUrl") as string || null;
  const locationText = formData.get("locationText") as string || null;
  const pdfUrl = formData.get("pdfUrl") as string || null;

  const features = parseRelatedList(formData.get("features") as string);
  const warranties = parseRelatedList(formData.get("warranties") as string);
  const galleryImages = parseRelatedList(formData.get("galleryImages") as string);

  await prisma.project.create({
    data: {
      name, slug, type, city, neighborhood, status, shortDesc, fullDesc, mainImage, isFeatured, isVisible,
      area, price, rooms, baths, progressPercent, progressLabel, googleMapsUrl, locationText, pdfUrl,
      features: { create: features },
      warranties: { create: warranties },
      galleryImages: { create: galleryImages },
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
  const fullDesc = formData.get("fullDesc") as string;
  const mainImage = formData.get("mainImage") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  // Phase 14 Fields
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const progressPercent = formData.get("progressPercent") ? parseInt(formData.get("progressPercent") as string) : null;
  const progressLabel = formData.get("progressLabel") as string || null;
  const googleMapsUrl = formData.get("googleMapsUrl") as string || null;
  const locationText = formData.get("locationText") as string || null;
  const pdfUrl = formData.get("pdfUrl") as string || null;

  const features = parseRelatedList(formData.get("features") as string);
  const warranties = parseRelatedList(formData.get("warranties") as string);
  const galleryImages = parseRelatedList(formData.get("galleryImages") as string);

  await prisma.project.update({
    where: { id },
    data: {
      name, slug, type, city, neighborhood, status, shortDesc, fullDesc, mainImage, isFeatured, isVisible,
      area, price, rooms, baths, progressPercent, progressLabel, googleMapsUrl, locationText, pdfUrl,
      features: { deleteMany: {}, create: features },
      warranties: { deleteMany: {}, create: warranties },
      galleryImages: { deleteMany: {}, create: galleryImages },
    },
  });

  revalidatePath("/crm/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/projects");
  redirect("/crm/projects");
}

export async function deleteProject(id: string) {
  await actionRequireRole(["ADMIN"]);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/crm/projects");
  revalidatePath("/projects");
}
