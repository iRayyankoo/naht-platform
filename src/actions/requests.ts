"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== "ADMIN") {
    throw new Error("غير مصرح لك بإجراء هذه العملية. هذه الصلاحية للمدير العام فقط.");
  }
  return { session, userRole };
}

export async function updateMaintenanceStatus(id: string, status: string, notes?: string) {
  await requireAdmin();
  await prisma.maintenanceRequest.update({
    where: { id },
    data: { status, notes: notes !== undefined ? notes : undefined }
  });
  revalidatePath("/crm/requests/maintenance");
}

export async function updateVendorStatus(id: string, status: string, notes?: string) {
  await requireAdmin();
  await prisma.vendorApplication.update({
    where: { id },
    data: { status, notes: notes !== undefined ? notes : undefined }
  });
  revalidatePath("/crm/requests/vendors");
}

export async function updateJobStatus(id: string, status: string, notes?: string) {
  await requireAdmin();
  await prisma.jobApplication.update({
    where: { id },
    data: { status, notes: notes !== undefined ? notes : undefined }
  });
  revalidatePath("/crm/requests/careers");
}
