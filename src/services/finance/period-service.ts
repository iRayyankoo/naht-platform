import { PrismaClient, FinanceFiscalPeriod, Prisma } from "@prisma/client";
import { requireFinanceServicePermission } from "@/lib/finance-auth";
import { FinanceDomainError } from "@/lib/finance-errors";
import { auditWriter } from "@/lib/finance-audit";
import { FinanceActionContext } from "@/lib/finance-context";

const prisma = new PrismaClient();

function verifyContext(context: FinanceActionContext) {
  if (!context.actorId) throw new FinanceDomainError("F_VALIDATION_ERROR", "actorId is required");
  if (!context.correlationId) throw new FinanceDomainError("F_VALIDATION_ERROR", "correlationId is required");
}

export class PeriodService {
  static async freezePeriod(context: FinanceActionContext, periodId: string): Promise<FinanceFiscalPeriod> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.period.manage", context.actorId);

    return prisma.$transaction(async (tx) => {
      const periods = await tx.$queryRaw<FinanceFiscalPeriod[]>`SELECT * FROM "FinanceFiscalPeriod" WHERE id = ${periodId} FOR UPDATE`;
      if (!periods.length) throw new FinanceDomainError("F_VALIDATION_ERROR", "Period not found");
      const period = periods[0];

      if (period.status !== "OPEN") {
        throw new FinanceDomainError("F_INVALID_STATE", "Only OPEN periods can be frozen");
      }

      const updated = await tx.financeFiscalPeriod.update({
        where: { id: periodId },
        data: { status: "FROZEN" }
      });

      await auditWriter.log(tx, {
        action: "PERIOD_FROZEN",
        entityType: "FinanceFiscalPeriod",
        entityId: periodId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { previousStatus: period.status, newStatus: "FROZEN" },
      });

      return updated;
    }, { isolationLevel: "Serializable" });
  }

  static async unfreezePeriod(context: FinanceActionContext, periodId: string): Promise<FinanceFiscalPeriod> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.period.manage", context.actorId);

    return prisma.$transaction(async (tx) => {
      const periods = await tx.$queryRaw<FinanceFiscalPeriod[]>`SELECT * FROM "FinanceFiscalPeriod" WHERE id = ${periodId} FOR UPDATE`;
      if (!periods.length) throw new FinanceDomainError("F_VALIDATION_ERROR", "Period not found");
      const period = periods[0];

      if (period.status !== "FROZEN") {
        throw new FinanceDomainError("F_INVALID_STATE", "Only FROZEN periods can be unfrozen");
      }

      const updated = await tx.financeFiscalPeriod.update({
        where: { id: periodId },
        data: { status: "OPEN" }
      });

      await auditWriter.log(tx, {
        action: "PERIOD_UNFROZEN",
        entityType: "FinanceFiscalPeriod",
        entityId: periodId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { previousStatus: period.status, newStatus: "OPEN" },
      });

      return updated;
    }, { isolationLevel: "Serializable" });
  }

  static async closePeriod(context: FinanceActionContext, periodId: string): Promise<FinanceFiscalPeriod> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.period.manage", context.actorId);

    return prisma.$transaction(async (tx) => {
      const periods = await tx.$queryRaw<FinanceFiscalPeriod[]>`SELECT * FROM "FinanceFiscalPeriod" WHERE id = ${periodId} FOR UPDATE`;
      if (!periods.length) throw new FinanceDomainError("F_VALIDATION_ERROR", "Period not found");
      const period = periods[0];

      if (period.status !== "FROZEN") {
        throw new FinanceDomainError("F_INVALID_STATE", "Only FROZEN periods can be closed");
      }

      // Check for non-POSTED/VOIDED journals
      // Any journal in DRAFT, PENDING_REVIEW, APPROVED, REJECTED
      const openJournals = await tx.financeJournalEntry.count({
        where: {
          fiscalPeriodId: periodId,
          status: { notIn: ["POSTED", "VOIDED"] }
        }
      });

      if (openJournals > 0) {
        throw new FinanceDomainError("F_VALIDATION_ERROR", "Cannot close period with non-POSTED or non-VOIDED journals");
      }

      const updated = await tx.financeFiscalPeriod.update({
        where: { id: periodId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          closedById: context.actorId
        }
      });

      await auditWriter.log(tx, {
        action: "PERIOD_CLOSED",
        entityType: "FinanceFiscalPeriod",
        entityId: periodId,
        actorId: context.actorId,
        impersonatorUserId: context.impersonatorId,
        correlationId: context.correlationId,
        metadata: { previousStatus: period.status, newStatus: "CLOSED" },
      });

      return updated;
    }, { isolationLevel: "Serializable" });
  }
}
