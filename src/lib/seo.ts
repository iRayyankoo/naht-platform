import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export async function getBaseMetadata(customOverrides: Partial<Metadata> = {}): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });

  const title = settings?.defaultSeoTitle || settings?.siteName || "نحت العقارية";
  const description = settings?.defaultSeoDescription || "نظام إدارة علاقات العملاء لشركة نحت العقارية";
  const images = settings?.defaultOgImage ? [settings.defaultOgImage] : [];
  const robots = settings?.defaultRobotsIndex ? "index, follow" : "noindex, nofollow";

  const metadataBase = settings?.canonicalBaseUrl ? new URL(settings.canonicalBaseUrl) : undefined;

  return {
    metadataBase,
    title: customOverrides.title || title,
    description: customOverrides.description || description,
    robots,
    openGraph: {
      title: customOverrides.title || title,
      description: customOverrides.description || description,
      siteName: settings?.siteName || "نحت العقارية",
      images: customOverrides.openGraph?.images || images,
      locale: "ar_SA",
      type: "website",
      ...customOverrides.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: customOverrides.title || title,
      description: customOverrides.description || description,
      images: customOverrides.twitter?.images || images,
      ...customOverrides.twitter,
    },
    ...customOverrides,
  };
}
