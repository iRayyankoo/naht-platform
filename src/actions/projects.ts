"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionRequireRole } from "@/lib/auth-helpers";

export async function parseFeaturesJSON(jsonStr: string | null): Promise<Prisma.ProjectFeatureCreateWithoutProjectInput[]> {
  if (!jsonStr || !jsonStr.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("بيانات المميزات المزودة غير صالحة");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("تنسيق قائمة المميزات غير صالح");
  }
  return parsed.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("عنصر الميزة غير صالح");
    }
    const obj = item as Record<string, unknown>;
    const title = typeof obj.title === "string" ? obj.title.trim() : "";
    if (!title) {
      throw new Error("عنوان الميزة مطلوب لكل عنصر");
    }
    const desc = typeof obj.desc === "string" ? obj.desc.trim() : null;
    const icon = typeof obj.icon === "string" ? obj.icon.trim() : null;
    return {
      title,
      desc,
      icon,
      order: index,
    };
  });
}

export async function parseWarrantiesJSON(jsonStr: string | null): Promise<Prisma.ProjectWarrantyCreateWithoutProjectInput[]> {
  if (!jsonStr || !jsonStr.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("بيانات الضمانات المزودة غير صالحة");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("تنسيق قائمة الضمانات غير صالح");
  }
  return parsed.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("عنصر الضمان غير صالح");
    }
    const obj = item as Record<string, unknown>;
    const title = typeof obj.title === "string" ? obj.title.trim() : "";
    if (!title) {
      throw new Error("عنوان الضمان مطلوب لكل عنصر");
    }
    const desc = typeof obj.desc === "string" ? obj.desc.trim() : null;
    const duration = typeof obj.duration === "string" ? obj.duration.trim() : null;
    return {
      title,
      desc,
      duration,
      order: index,
    };
  });
}

export async function parseGalleryImagesJSON(jsonStr: string | null): Promise<Prisma.ProjectGalleryImageCreateWithoutProjectInput[]> {
  if (!jsonStr || !jsonStr.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("بيانات معرض الصور المزودة غير صالحة");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("تنسيق معرض الصور غير صالح");
  }
  return parsed.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("عنصر معرض الصور غير صالح");
    }
    const obj = item as Record<string, unknown>;
    const url = typeof obj.url === "string" ? obj.url.trim() : "";
    if (!url) {
      throw new Error("رابط الصورة مطلوب لكل عنصر في المعرض");
    }
    const alt = typeof obj.alt === "string" ? obj.alt.trim() : null;
    return {
      url,
      alt,
      order: index,
    };
  });
}

export async function validateProjectMapCoordinates(data: {
  showOnHomeMap?: boolean;
  mapLat?: number | null;
  mapLng?: number | null;
  mapX?: number | null;
  mapY?: number | null;
}) {
  const hasLat = data.mapLat !== null && data.mapLat !== undefined;
  const hasLng = data.mapLng !== null && data.mapLng !== undefined;

  // Strict rule: If showOnHomeMap is enabled, both coordinates MUST be present and valid
  if (data.showOnHomeMap) {
    if (!hasLat || !hasLng) {
      throw new Error("يجب تزويد كلا إحداثيي دائرة العرض وخط الطول معاً لتفعيل إظهار المشروع على الخريطة");
    }
  }

  // Strict rule: One coordinate cannot be supplied without the other
  if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
    throw new Error("يجب تزويد دائرة العرض وخط الطول معاً كزوج إحداثيات مكتمل أو إزالتهم معاً");
  }

  if (hasLat && data.mapLat !== null && data.mapLat !== undefined) {
    if (!Number.isFinite(data.mapLat) || data.mapLat < -90 || data.mapLat > 90) {
      throw new Error("دائرة العرض (Latitude) غير صالحة، يجب أن تكون بين -90 و 90");
    }
  }

  if (hasLng && data.mapLng !== null && data.mapLng !== undefined) {
    if (!Number.isFinite(data.mapLng) || data.mapLng < -180 || data.mapLng > 180) {
      throw new Error("خط الطول (Longitude) غير صالح، يجب أن يكون بين -180 و 180");
    }
  }

  if (data.mapX !== null && data.mapX !== undefined) {
    if (!Number.isFinite(data.mapX) || data.mapX < 0 || data.mapX > 100) {
      throw new Error("الإحداثي X غير صالح، يجب أن يكون نسبة بين 0 و 100");
    }
  }

  if (data.mapY !== null && data.mapY !== undefined) {
    if (!Number.isFinite(data.mapY) || data.mapY < 0 || data.mapY > 100) {
      throw new Error("الإحداثي Y غير صالح، يجب أن يكون نسبة بين 0 و 100");
    }
  }
}

export async function createProject(formData: FormData) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  const name = (formData.get("name") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const type = (formData.get("type") as string) || "";
  const city = (formData.get("city") as string) || "";
  const neighborhood = (formData.get("neighborhood") as string) || "";
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = (formData.get("shortDesc") as string) || "";
  const fullDesc = (formData.get("fullDesc") as string) || "";
  const mainImage = (formData.get("mainImage") as string) || "";
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  // Phase 14 Fields
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const progressPercent = formData.get("progressPercent") ? parseInt(formData.get("progressPercent") as string) : null;
  const progressLabel = (formData.get("progressLabel") as string) || null;
  const googleMapsUrl = (formData.get("googleMapsUrl") as string) || null;
  const locationText = (formData.get("locationText") as string) || null;
  const pdfUrl = (formData.get("pdfUrl") as string) || null;
  const planImage = (formData.get("planImage") as string) || null;

  const showOnHomeMap = formData.get("showOnHomeMap") === "on";
  const mapLat = formData.get("mapLat") ? parseFloat(formData.get("mapLat") as string) : null;
  const mapLng = formData.get("mapLng") ? parseFloat(formData.get("mapLng") as string) : null;
  const mapX = formData.get("mapX") ? parseFloat(formData.get("mapX") as string) : null;
  const mapY = formData.get("mapY") ? parseFloat(formData.get("mapY") as string) : null;

  const features = await parseFeaturesJSON(formData.get("features") as string);
  const warranties = await parseWarrantiesJSON(formData.get("warranties") as string);
  const galleryImages = await parseGalleryImagesJSON(formData.get("galleryImages") as string);

  await prisma.project.create({
    data: {
      name, slug, type, city, neighborhood, status, shortDesc, fullDesc, mainImage, planImage, isFeatured, isVisible,
      area, price, rooms, baths, progressPercent, progressLabel, googleMapsUrl, locationText, pdfUrl,
      showOnHomeMap, mapLat, mapLng, mapX, mapY,
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

  const name = (formData.get("name") as string) || "";
  const slug = (formData.get("slug") as string) || "";
  const type = (formData.get("type") as string) || "";
  const city = (formData.get("city") as string) || "";
  const neighborhood = (formData.get("neighborhood") as string) || "";
  const status = formData.get("status") as "AVAILABLE" | "SOLD" | "COMING_SOON";
  const shortDesc = (formData.get("shortDesc") as string) || "";
  const fullDesc = (formData.get("fullDesc") as string) || "";
  const mainImage = (formData.get("mainImage") as string) || "";
  const isFeatured = formData.get("isFeatured") === "on";
  const isVisible = formData.get("isVisible") === "on";

  // Phase 14 Fields
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const rooms = formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null;
  const baths = formData.get("baths") ? parseInt(formData.get("baths") as string) : null;
  const progressPercent = formData.get("progressPercent") ? parseInt(formData.get("progressPercent") as string) : null;
  const progressLabel = (formData.get("progressLabel") as string) || null;
  const googleMapsUrl = (formData.get("googleMapsUrl") as string) || null;
  const locationText = (formData.get("locationText") as string) || null;
  const pdfUrl = (formData.get("pdfUrl") as string) || null;
  const planImage = (formData.get("planImage") as string) || null;

  const showOnHomeMap = formData.get("showOnHomeMap") === "on";
  const mapLat = formData.get("mapLat") ? parseFloat(formData.get("mapLat") as string) : null;
  const mapLng = formData.get("mapLng") ? parseFloat(formData.get("mapLng") as string) : null;
  const mapX = formData.get("mapX") ? parseFloat(formData.get("mapX") as string) : null;
  const mapY = formData.get("mapY") ? parseFloat(formData.get("mapY") as string) : null;

  const features = await parseFeaturesJSON(formData.get("features") as string);
  const warranties = await parseWarrantiesJSON(formData.get("warranties") as string);
  const galleryImages = await parseGalleryImagesJSON(formData.get("galleryImages") as string);

  await prisma.project.update({
    where: { id },
    data: {
      name, slug, type, city, neighborhood, status, shortDesc, fullDesc, mainImage, planImage, isFeatured, isVisible,
      area, price, rooms, baths, progressPercent, progressLabel, googleMapsUrl, locationText, pdfUrl,
      showOnHomeMap, mapLat, mapLng, mapX, mapY,
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

export async function updateProjectMapData(
  id: string,
  data: {
    showOnHomeMap: boolean;
    mapLat: number | null;
    mapLng: number | null;
    mapX: number | null;
    mapY: number | null;
  }
) {
  await actionRequireRole(["ADMIN", "MARKETING"]);

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("معرف المشروع غير صالح");
  }

  await validateProjectMapCoordinates(data);

  await prisma.project.update({
    where: { id },
    data: {
      showOnHomeMap: Boolean(data.showOnHomeMap),
      mapLat: data.mapLat ?? null,
      mapLng: data.mapLng ?? null,
      mapX: data.mapX ?? null,
      mapY: data.mapY ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/crm/projects-map");
}
