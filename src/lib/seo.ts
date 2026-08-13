import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export async function getBaseMetadata(customOverrides: Partial<Metadata> = {}): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });

  const defaultTitle = settings?.defaultSeoTitle || settings?.siteName || "نحت العقارية";
  const defaultDescription = settings?.defaultSeoDescription || "نظام إدارة علاقات العملاء لشركة نحت العقارية";
  const images = settings?.defaultOgImage ? [settings.defaultOgImage] : [];
  const robots = settings?.defaultRobotsIndex ? "index, follow" : "noindex, nofollow";

  const metadataBase = settings?.canonicalBaseUrl ? new URL(settings.canonicalBaseUrl) : undefined;

  const finalTitle = (typeof customOverrides.title === "string" && customOverrides.title) ? customOverrides.title : defaultTitle;
  const finalDescription = (typeof customOverrides.description === "string" && customOverrides.description) ? customOverrides.description : defaultDescription;

  const cleanOverrides = Object.fromEntries(
    Object.entries(customOverrides).filter(([k, v]) => Boolean(k) && v !== undefined)
  );

  return {
    metadataBase,
    robots,
    ...cleanOverrides,
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      siteName: settings?.siteName || "نحت العقارية",
      images: customOverrides.openGraph?.images || images,
      locale: "ar_SA",
      type: "website",
      ...(customOverrides.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: customOverrides.twitter?.images || images,
      ...(customOverrides.twitter || {}),
    },
  };
}
