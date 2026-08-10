import { prisma as defaultPrisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";

export const ALLOWED_LEAD_STATUSES = new Set([
  "NEW",
  "CONTACTED",
  "NO_ANSWER",
  "INTERESTED",
  "DETAILS_SENT",
  "VISIT_SCHEDULED",
  "VISIT_DONE",
  "NEGOTIATION",
  "SOLD",
  "LOST",
  "UNQUALIFIED",
  "DUPLICATE",
  "POSTPONED",
]);

export const ALLOWED_NOTE_TYPES = new Set([
  "WHATSAPP_SENT",
  "DETAILS_SENT",
  "VISIT_SCHEDULED",
  "VISITED",
  "CONTACT_LATER",
  "INTERNAL_NOTE",
]);

export interface LeadUserContext {
  id: string;
  role: string;
}

export type LeadActionResult =
  | { success: true }
  | { success: false; error: string };

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: "جديد",
    CONTACTED: "تم التواصل",
    NO_ANSWER: "لم يتم الرد",
    INTERESTED: "مهتم",
    DETAILS_SENT: "تم إرسال التفاصيل",
    VISIT_SCHEDULED: "تم جدولة زيارة",
    VISIT_DONE: "تمت الزيارة",
    NEGOTIATION: "تفاوض",
    SOLD: "تم البيع",
    LOST: "خاسر",
    UNQUALIFIED: "غير مؤهل",
    DUPLICATE: "مكرر",
    POSTPONED: "مؤجل",
  };
  return map[status] || status;
}

const SALES_UNAUTHORIZED_ERROR = "غير مصرح لك بتنفيذ العملية على هذا العميل";

export const leadService = {
  async updateLeadStatus(
    user: LeadUserContext,
    id: string,
    newStatus: string,
    db: PrismaClient = defaultPrisma
  ): Promise<LeadActionResult> {
    if (user.role !== "ADMIN" && user.role !== "SALES") {
      return { success: false, error: "غير مصرح لك بتعديل حالة العميل" };
    }

    if (!ALLOWED_LEAD_STATUSES.has(newStatus)) {
      return { success: false, error: "حالة عميل غير معتمدة" };
    }

    try {
      return await db.$transaction(async (tx) => {
        const leads = await tx.$queryRaw<
          Array<{ id: string; status: string; assignedToId: string | null }>
        >(
          Prisma.sql`SELECT "id", "status", "assignedToId" FROM "Lead" WHERE "id" = ${id} FOR UPDATE`
        );

        const lead = leads[0];
        if (!lead) {
          return {
            success: false,
            error: user.role === "SALES" ? SALES_UNAUTHORIZED_ERROR : "العميل غير موجود",
          };
        }

        if (
          user.role === "SALES" &&
          lead.assignedToId !== user.id &&
          lead.assignedToId !== null
        ) {
          return { success: false, error: SALES_UNAUTHORIZED_ERROR };
        }

        if (lead.status !== newStatus) {
          const oldLabel = getStatusLabel(lead.status);
          const newLabel = getStatusLabel(newStatus);

          await tx.lead.update({
            where: { id },
            data: { status: newStatus, updatedAt: new Date() },
          });

          await tx.leadNote.create({
            data: {
              leadId: id,
              userId: user.id,
              noteType: "INTERNAL_NOTE",
              content: `تم تغيير حالة العميل من "${oldLabel}" إلى "${newLabel}"`,
            },
          });
        }

        return { success: true };
      });
    } catch {
      return { success: false, error: "فشلت العملية أثناء الحفظ" };
    }
  },

  async addLeadNote(
    user: LeadUserContext,
    leadId: string,
    noteType: string,
    content: string,
    db: PrismaClient = defaultPrisma
  ): Promise<LeadActionResult> {
    if (user.role !== "ADMIN" && user.role !== "SALES") {
      return { success: false, error: "غير مصرح لك بإضافة ملاحظات" };
    }

    if (!ALLOWED_NOTE_TYPES.has(noteType)) {
      return { success: false, error: "نوع الملاحظة غير معتمد" };
    }

    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent || trimmedContent.length > 5000) {
      return { success: false, error: "محتوى الملاحظة غير صالح" };
    }

    try {
      return await db.$transaction(async (tx) => {
        const leads = await tx.$queryRaw<
          Array<{ id: string; assignedToId: string | null }>
        >(
          Prisma.sql`SELECT "id", "assignedToId" FROM "Lead" WHERE "id" = ${leadId} FOR UPDATE`
        );

        const lead = leads[0];
        if (!lead) {
          return {
            success: false,
            error: user.role === "SALES" ? SALES_UNAUTHORIZED_ERROR : "العميل غير موجود",
          };
        }

        if (
          user.role === "SALES" &&
          lead.assignedToId !== user.id &&
          lead.assignedToId !== null
        ) {
          return { success: false, error: SALES_UNAUTHORIZED_ERROR };
        }

        await tx.leadNote.create({
          data: {
            leadId,
            userId: user.id,
            noteType,
            content: trimmedContent,
          },
        });

        await tx.lead.update({
          where: { id: leadId },
          data: { updatedAt: new Date() },
        });

        return { success: true };
      });
    } catch {
      return { success: false, error: "فشلت العملية أثناء إضافة الملاحظة" };
    }
  },

  async assignLead(
    user: LeadUserContext,
    id: string,
    assignedToId: string | null,
    db: PrismaClient = defaultPrisma
  ): Promise<LeadActionResult> {
    if (user.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بتعيين الموظفين" };
    }

    try {
      return await db.$transaction(async (tx) => {
        const leads = await tx.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT "id" FROM "Lead" WHERE "id" = ${id} FOR UPDATE`
        );

        const lead = leads[0];
        if (!lead) {
          return { success: false, error: "العميل غير موجود" };
        }

        let newName = "غير معين";
        if (assignedToId) {
          const targetUser = await tx.user.findUnique({
            where: { id: assignedToId },
            select: { id: true, name: true, role: true, isActive: true },
          });

          if (!targetUser || !targetUser.isActive || targetUser.role !== "SALES") {
            return { success: false, error: "الموظف المعين غير صالح أو غير نشط" };
          }
          newName = targetUser.name || "مجهول";
        }

        await tx.lead.update({
          where: { id },
          data: { assignedToId, updatedAt: new Date() },
        });

        await tx.leadNote.create({
          data: {
            leadId: id,
            userId: user.id,
            noteType: "INTERNAL_NOTE",
            content: `تم تعيين العميل إلى الموظف: ${newName}`,
          },
        });

        return { success: true };
      });
    } catch {
      return { success: false, error: "فشلت عملية تعيين العميل" };
    }
  },

  async deleteLead(
    user: LeadUserContext,
    id: string,
    db: PrismaClient = defaultPrisma
  ): Promise<LeadActionResult> {
    if (user.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بحذف العميل" };
    }

    try {
      await db.lead.delete({ where: { id } });
      return { success: true };
    } catch {
      return { success: false, error: "فشلت عملية حذف العميل" };
    }
  },
};
