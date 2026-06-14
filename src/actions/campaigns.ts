"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { actionRequireRole } from "@/lib/auth-helpers";

export async function createCampaignLink(data: any) {
  const user = await actionRequireRole(["ADMIN", "MARKETING"]);
  
  // Clean empty strings to null
  const cleanData: Record<string, string | null> = {};
  Object.keys(data).forEach(key => {
    cleanData[key] = data[key] === "" ? null : data[key];
  });

  const campaign = await prisma.campaignLink.create({
    data: {
      campaignName: cleanData.campaignName as string,
      destinationUrl: cleanData.destinationUrl as string,
      platform: cleanData.platform as string,
      utmSource: cleanData.utmSource as string,
      utmMedium: cleanData.utmMedium as string,
      utmCampaign: cleanData.utmCampaign as string,
      utmContent: cleanData.utmContent,
      utmTerm: cleanData.utmTerm,
      finalUrl: cleanData.finalUrl as string,
      notes: cleanData.notes,
      shortCode: cleanData.shortCode,
      projectId: cleanData.projectId,
      createdByUserId: user.id,
    },
  });

  revalidatePath("/crm/campaigns");
  return campaign;
}

export async function deleteCampaignLink(id: string) {
  await actionRequireRole(["ADMIN"]); // Only Admin can delete
  await prisma.campaignLink.delete({
    where: { id },
  });
  revalidatePath("/crm/campaigns");
}
