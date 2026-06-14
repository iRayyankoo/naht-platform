"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    throw new Error("غير مصرح لك بإجراء هذه العملية");
  }
  return { session, userRole };
}

// === Site Settings ===
export async function updateSiteSettings(data: any) {
  await requireAuth();

  const sanitizedData = {
    ...data,
    defaultRobotsIndex: data.defaultRobotsIndex === "true" || data.defaultRobotsIndex === true,
  };

  await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: sanitizedData,
    create: { id: "global", ...sanitizedData },
  });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/services");
  revalidatePath("/crm/cms/settings");
}

// === Home Page Content ===
export async function updateHomePageContent(data: any) {
  await requireAuth();
  await prisma.homePageContent.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", ...data },
  });
  revalidatePath("/");
  revalidatePath("/crm/cms/homepage");
}

// === About Page Content ===
export async function updateAboutPageContent(data: any) {
  await requireAuth();
  await prisma.aboutPageContent.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", ...data },
  });
  revalidatePath("/about");
  revalidatePath("/crm/cms/about");
}

// === Social Links ===
export async function upsertSocialLink(data: { id?: string; platformName: string; url: string; icon?: string | null; order?: number; isVisible?: boolean }) {
  await requireAuth();
  if (data.id) {
    await prisma.socialLink.update({ where: { id: data.id }, data });
  } else {
    await prisma.socialLink.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/crm/cms/social-links");
}

export async function deleteSocialLink(id: string) {
  await requireAuth();
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/crm/cms/social-links");
}

// === Services ===
export async function upsertService(data: { id?: string; slug?: string | null; title: string; description: string; fullDescription?: string | null; icon?: string | null; image?: string | null; order?: number; isVisible?: boolean; seoTitle?: string | null; seoDescription?: string | null }) {
  await requireAuth();
  if (data.id) {
    await prisma.service.update({ where: { id: data.id }, data });
  } else {
    await prisma.service.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/crm/cms/services");
}

export async function deleteService(id: string) {
  await requireAuth();
  await prisma.service.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/crm/cms/services");
}

// === FAQs ===
export async function upsertFaq(data: { id?: string; category?: string | null; question: string; answer: string; order?: number; isVisible?: boolean }) {
  await requireAuth();
  if (data.id) {
    await prisma.faq.update({ where: { id: data.id }, data });
  } else {
    await prisma.faq.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/crm/cms/faqs");
}

export async function deleteFaq(id: string) {
  await requireAuth();
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/crm/cms/faqs");
}
