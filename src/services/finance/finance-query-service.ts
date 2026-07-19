import { prisma } from "@/lib/prisma";
import { Prisma, FinanceFiscalPeriod, FinanceJournalEntry } from "@prisma/client";
import { requireFinanceServicePermission } from "@/lib/finance-auth";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";
import { FinanceActionContext } from "@/lib/finance-context";
import { FinanceDomainError } from "@/lib/finance-errors";

function verifyContext(context: FinanceActionContext) {
  if (!context.actorId) throw new FinanceDomainError("F_VALIDATION_ERROR", "actorId is required");
  if (!context.correlationId) throw new FinanceDomainError("F_VALIDATION_ERROR", "correlationId is required");
}

export class FinanceQueryService {
  /**
   * List periods with optional filtering
   */
  static async listPeriods(
    context: FinanceActionContext,
    filter: { fiscalYearId?: string },
    pagination: { skip?: number; take?: number } = {}
  ): Promise<{ items: FinanceFiscalPeriod[]; total: number }> {
    verifyContext(context);
    // Requires basic read permission for periods
    await requireFinanceServicePermission(context.actorId, "finance.period.view", context.actorId);

    const where: Prisma.FinanceFiscalPeriodWhereInput = {};
    if (filter.fiscalYearId) where.fiscalYearId = filter.fiscalYearId;

    const skip = pagination.skip ?? 0;
    const take = pagination.take ?? 50;

    const [items, total] = await Promise.all([
      prisma.financeFiscalPeriod.findMany({
        where,
        orderBy: { periodNumber: "asc" },
        skip,
        take,
      }),
      prisma.financeFiscalPeriod.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Retrieves high-level summary metrics for the finance dashboard.
   */
  static async getFinanceDashboardSummary(
    context: FinanceActionContext
  ): Promise<{
    totalDrafts: number;
    totalPendingReview: number;
    totalApproved: number;
    openPeriodsCount: number;
  }> {
    verifyContext(context);
    // Requires basic read permission
    await requireFinanceServicePermission(context.actorId, "finance.journal.view", context.actorId);

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const scopes = scopedPerms.get("finance.journal.view");
    const hasCompanyScope = isSuper || (scopes && scopes.has("COMPANY"));

    const whereClause: Prisma.FinanceJournalEntryWhereInput = hasCompanyScope ? {} : { createdById: context.actorId };

    const [totalDrafts, totalPendingReview, totalApproved] = await Promise.all([
      prisma.financeJournalEntry.count({ where: { ...whereClause, status: "DRAFT" } }),
      prisma.financeJournalEntry.count({ where: { ...whereClause, status: "PENDING_REVIEW" } }),
      prisma.financeJournalEntry.count({ where: { ...whereClause, status: "APPROVED" } }),
    ]);

    let openPeriodsCount = 0;
    const permissions = await getCurrentUserScopedPermissions(context.actorId);
    if (isSuper || permissions.has("finance.period.view")) {
      openPeriodsCount = await prisma.financeFiscalPeriod.count({ where: { status: "OPEN" } });
    }

    return {
      totalDrafts,
      totalPendingReview,
      totalApproved,
      openPeriodsCount,
    };
  }
}
