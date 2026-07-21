import { prisma } from "@/lib/prisma";
import { Prisma, FinanceFiscalPeriod } from "@prisma/client";
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
   * List open periods restricted by ledgerId
   */
  static async listOpenPeriods(
    context: FinanceActionContext,
    filter: { ledgerId: string },
    pagination: { skip?: number; take?: number } = {}
  ): Promise<{ items: FinanceFiscalPeriod[]; total: number }> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.period.view", context.actorId);

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const scopes = scopedPerms.get("finance.period.view");
    const hasCompanyScope = isSuper || (scopes && scopes.has("COMPANY"));

    if (!hasCompanyScope) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Insufficient scope to list open periods");
    }

    const where: Prisma.FinanceFiscalPeriodWhereInput = {
      status: "OPEN",
      fiscalYear: {
        ledgerId: filter.ledgerId,
        ledger: { isActive: true }
      }
    };

    const skip = pagination.skip ?? 0;
    const take = pagination.take ?? 50;

    const [items, total] = await Promise.all([
      prisma.financeFiscalPeriod.findMany({
        where,
        orderBy: { startDate: "asc" },
        skip,
        take,
      }),
      prisma.financeFiscalPeriod.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * List active currencies
   */
  static async listCurrencies(
    context: FinanceActionContext,
    filter?: { search?: string },
    pagination: { skip?: number; take?: number } = {}
  ): Promise<{ items: Prisma.FinanceCurrencyGetPayload<Prisma.FinanceCurrencyDefaultArgs>[]; total: number }> {
    verifyContext(context);
    // Currency is a global reference, check if user has access to view ledgers/journals
    await requireFinanceServicePermission(context.actorId, "finance.journal.view", context.actorId);

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const scopes = scopedPerms.get("finance.journal.view");
    const hasCompanyScope = isSuper || (scopes && scopes.has("COMPANY"));

    if (!hasCompanyScope) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Insufficient scope to list currencies");
    }

    const where: Prisma.FinanceCurrencyWhereInput = { isActive: true };
    if (filter?.search) {
      where.OR = [
        { code: { contains: filter.search, mode: "insensitive" } },
        { nameEn: { contains: filter.search, mode: "insensitive" } },
        { nameAr: { contains: filter.search, mode: "insensitive" } }
      ];
    }
    const skip = pagination.skip ?? 0;
    const take = pagination.take ?? 50;

    const [items, total] = await Promise.all([
      prisma.financeCurrency.findMany({ where, orderBy: { code: "asc" }, skip, take }),
      prisma.financeCurrency.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * List active cost centers for a given ledger
   */
  static async listCostCenters(
    context: FinanceActionContext,
    filter: { ledgerId: string; search?: string },
    pagination: { skip?: number; take?: number } = {}
  ): Promise<{ items: Prisma.FinanceCostCenterGetPayload<Prisma.FinanceCostCenterDefaultArgs>[]; total: number }> {
    verifyContext(context);
    await requireFinanceServicePermission(context.actorId, "finance.journal.view", context.actorId);

    const isSuper = await isSuperAdmin(context.actorId);
    const scopedPerms = await getCurrentUserScopedPermissions(context.actorId);
    const scopes = scopedPerms.get("finance.journal.view");
    const hasCompanyScope = isSuper || (scopes && scopes.has("COMPANY"));

    if (!hasCompanyScope) {
      throw new FinanceDomainError("F_PERMISSION_DENIED", "Insufficient scope to list cost centers");
    }

    const where: Prisma.FinanceCostCenterWhereInput = {
      ledgerId: filter.ledgerId,
      isActive: true,
    };

    if (filter.search) {
      where.OR = [
        { code: { contains: filter.search, mode: "insensitive" } },
        { nameAr: { contains: filter.search, mode: "insensitive" } },
        { nameEn: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const skip = pagination.skip ?? 0;
    const take = pagination.take ?? 50;

    const [items, total] = await Promise.all([
      prisma.financeCostCenter.findMany({ where, orderBy: { code: "asc" }, skip, take }),
      prisma.financeCostCenter.count({ where }),
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
