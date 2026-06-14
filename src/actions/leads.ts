"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to check Auth
async function requireAuth(roles: string[]) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || !roles.includes(userRole)) {
    throw new Error("غير مصرح لك بإجراء هذه العملية");
  }
  return { session, userRole };
}

export async function updateLeadStatus(id: string, newStatus: string) {
  const { session } = await requireAuth(["ADMIN", "SALES"]);
  
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return;

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      "NEW": "جديد",
      "CONTACTED": "تم التواصل",
      "NO_ANSWER": "لم يتم الرد",
      "INTERESTED": "مهتم",
      "DETAILS_SENT": "تم إرسال التفاصيل",
      "VISIT_SCHEDULED": "تم جدولة زيارة",
      "VISIT_DONE": "تمت الزيارة",
      "NEGOTIATION": "تفاوض",
      "SOLD": "تم البيع",
      "LOST": "خاسر",
      "UNQUALIFIED": "غير مؤهل",
      "DUPLICATE": "مكرر",
      "POSTPONED": "مؤجل",
    };
    return map[status] || status;
  };

  if (lead.status !== newStatus) {
    await prisma.lead.update({
      where: { id },
      data: { status: newStatus, updatedAt: new Date() },
    });

    const oldLabel = getStatusLabel(lead.status);
    const newLabel = getStatusLabel(newStatus);

    // Add automatic note
    await prisma.leadNote.create({
      data: {
        leadId: id,
        userId: (session.user as any).id,
        noteType: "INTERNAL_NOTE",
        content: `تم تغيير حالة العميل من "${oldLabel}" إلى "${newLabel}"`,
      },
    });
  }

  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
}

export async function assignLead(id: string, assignedToId: string | null) {
  const { session } = await requireAuth(["ADMIN"]); // Only Admin can assign leads
  
  const lead = await prisma.lead.findUnique({ where: { id }, include: { assignedTo: true } });
  if (!lead) return;

  await prisma.lead.update({
    where: { id },
    data: { assignedToId, updatedAt: new Date() },
  });

  // Fetch the new user's name if assigned
  let newName = "غير معين";
  if (assignedToId) {
    const newUser = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (newUser) newName = newUser.name || "مجهول";
  }

  // Add automatic note
  await prisma.leadNote.create({
    data: {
      leadId: id,
      userId: (session.user as any).id,
      noteType: "INTERNAL_NOTE",
      content: `تم تعيين العميل إلى الموظف: ${newName}`,
    },
  });

  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
}

export async function addLeadNote(leadId: string, noteType: string, content: string) {
  const { session } = await requireAuth(["ADMIN", "SALES"]);
  
  await prisma.leadNote.create({
    data: {
      leadId,
      userId: (session.user as any).id,
      noteType,
      content,
    },
  });

  // Automatically update lead's updated timestamp when a note is added
  await prisma.lead.update({
    where: { id: leadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/leads");
}

export async function deleteLead(id: string) {
  await requireAuth(["ADMIN"]);
  
  await prisma.lead.delete({
    where: { id },
  });
  
  revalidatePath("/crm/leads");
}
