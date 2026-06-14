"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateTrackingSettings(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("غير مصرح لك بإجراء هذا التعديل");
  }

  // Sanitize Boolean Values
  const sanitizedData = {
    ...data,
    isGtmEnabled: data.isGtmEnabled === true || data.isGtmEnabled === "true",
    isGa4Enabled: data.isGa4Enabled === true || data.isGa4Enabled === "true",
    isGoogleAdsEnabled: data.isGoogleAdsEnabled === true || data.isGoogleAdsEnabled === "true",
    isMetaPixelEnabled: data.isMetaPixelEnabled === true || data.isMetaPixelEnabled === "true",
    isTiktokPixelEnabled: data.isTiktokPixelEnabled === true || data.isTiktokPixelEnabled === "true",
    isSnapchatPixelEnabled: data.isSnapchatPixelEnabled === true || data.isSnapchatPixelEnabled === "true",
    isLinkedinEnabled: data.isLinkedinEnabled === true || data.isLinkedinEnabled === "true",
    isXPixelEnabled: data.isXPixelEnabled === true || data.isXPixelEnabled === "true",
    isCustomScriptsEnabled: data.isCustomScriptsEnabled === true || data.isCustomScriptsEnabled === "true",
  };

  await prisma.trackingSettings.upsert({
    where: { id: "global" },
    update: sanitizedData,
    create: {
      id: "global",
      ...sanitizedData,
    },
  });

  revalidatePath("/");
  revalidatePath("/crm/cms/tracking");
}
