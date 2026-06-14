"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAuth(roles: string[]) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || !roles.includes(userRole)) {
    throw new Error("غير مصرح لك بإجراء هذه العملية");
  }
  return { session, userRole };
}

export async function createCampaignLink(data: any) {
  const { session } = await requireAuth(["ADMIN", "MARKETING"]);
  
  // Clean empty strings to null
  const cleanData: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(data)) {
    cleanData[k] = v === "" ? null : (v as string);
  }

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
      createdByUserId: (session.user as any).id,
    },
  });

  revalidatePath("/crm/campaigns");
  return campaign;
}

export async function deleteCampaignLink(id: string) {
  await requireAuth(["ADMIN"]); // Only Admin can delete
  await prisma.campaignLink.delete({
    where: { id },
  });
  revalidatePath("/crm/campaigns");
}
