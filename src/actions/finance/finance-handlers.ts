import { JournalService } from "@/services/finance/journal-service";
import { PeriodService } from "@/services/finance/period-service";
import { FinanceQueryService } from "@/services/finance/finance-query-service";
import {
  FinanceActionResult,
  withFinanceActionErrorHandler,
  SessionDependencies,
} from "./finance-action-utils";
import {
  CreateDraftInputSchema,
  UpdateDraftInputSchema,
  AddLineInputSchema,
  UpdateLineInputSchema,
  RemoveLineInputSchema,
  ActionReasonInputSchema,
  ReverseJournalInputSchema,
  IdInputSchema,
  ListJournalsInputSchema,
  ListPeriodsInputSchema,
  FinanceJournalEntryDTO,
  FinanceJournalLineDTO,
  FinanceFiscalPeriodDTO,
  FinanceDashboardSummaryDTO,
  mapJournalToDTO,
  mapJournalLineToDTO,
  mapJournalToDTOWithoutLines,
  mapPeriodToDTO,
} from "./finance-dtos";

export async function handleCreateDraft(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = CreateDraftInputSchema.parse(input);
    const result = await JournalService.createDraft(context, {
      ledgerId: data.ledgerId,
      fiscalPeriodId: data.fiscalPeriodId,
      entryDate: new Date(data.entryDate),
      currencyId: data.currencyId,
      description: data.description,
      exchangeRate: data.exchangeRate,
      reference: data.reference,
    });
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleUpdateDraft(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = UpdateDraftInputSchema.parse(input);
    const result = await JournalService.updateDraft(context, data.journalId, {
      description: data.description,
      reference: data.reference,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
    });
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleAddLine(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalLineDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = AddLineInputSchema.parse(input);
    const result = await JournalService.addLine(context, data.journalId, {
      accountId: data.accountId,
      costCenterId: data.costCenterId ?? undefined,
      description: data.description,
      debitAmount: data.debitAmount ?? "0",
      creditAmount: data.creditAmount ?? "0",
    });
    return mapJournalLineToDTO(result);
  }, deps);
}

export async function handleUpdateLine(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalLineDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = UpdateLineInputSchema.parse(input);
    const result = await JournalService.updateLine(context, data.journalId, data.lineId, {
      accountId: data.accountId,
      costCenterId: data.costCenterId === null ? null : data.costCenterId,
      description: data.description,
      debitAmount: data.debitAmount,
      creditAmount: data.creditAmount,
    });
    return mapJournalLineToDTO(result);
  }, deps);
}

export async function handleRemoveLine(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<void>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = RemoveLineInputSchema.parse(input);
    await JournalService.removeLine(context, data.journalId, data.lineId);
  }, deps);
}

export async function handleSubmitForReview(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.submitForReview(context, data.id);
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleReviewJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.reviewJournal(context, data.id);
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleReturnForModification(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ActionReasonInputSchema.parse(input);
    const result = await JournalService.returnForModification(context, data.journalId, data.reason);
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleApproveJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.approveJournal(context, data.id);
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleVoidJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ActionReasonInputSchema.parse(input);
    const result = await JournalService.voidJournal(context, data.journalId, data.reason);
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handleReverseJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ReverseJournalInputSchema.parse(input);
    const result = await JournalService.reverseJournal(
      context,
      data.journalId,
      data.targetFiscalPeriodId,
      data.reversalReason
    );
    return mapJournalToDTOWithoutLines(result);
  }, deps);
}

export async function handlePostJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ entryNumber: string }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.postJournal(context, data.id);
    return result;
  }, deps);
}

export async function handleGetJournal(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.getJournal(context, data.id);
    const dto = mapJournalToDTO(result);
    dto.permissions = await calculateJournalPermissions(context, result);
    return dto;
  }, deps);
}

export async function handleListJournals(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceJournalEntryDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListJournalsInputSchema.parse(input);
    const result = await JournalService.listJournals(
      context,
      { ledgerId: data.ledgerId, status: data.status as "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "POSTED" | "VOIDED" | undefined },
      { skip: data.skip, take: data.take }
    );
    return {
      items: result.items.map((j) => mapJournalToDTOWithoutLines(j)),
      total: result.total,
    };
  }, deps);
}

export async function handleFreezePeriod(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.freezePeriod(context, data.id);
    return mapPeriodToDTO(result);
  }, deps);
}

export async function handleUnfreezePeriod(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.unfreezePeriod(context, data.id);
    return mapPeriodToDTO(result);
  }, deps);
}

export async function handleClosePeriod(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.closePeriod(context, data.id);
    return mapPeriodToDTO(result);
  }, deps);
}

export async function handleListPeriods(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceFiscalPeriodDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListPeriodsInputSchema.parse(input);
    const result = await FinanceQueryService.listPeriods(
      context,
      { fiscalYearId: data.fiscalYearId },
      { skip: data.skip, take: data.take }
    );
    return {
      items: result.items.map((p) => mapPeriodToDTO(p)),
      total: result.total,
    };
  }, deps);
}

export async function handleGetFinanceDashboardSummary(
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceDashboardSummaryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const result = await FinanceQueryService.getFinanceDashboardSummary(context);
    return {
      totalDrafts: result.totalDrafts,
      totalPendingReview: result.totalPendingReview,
      totalApproved: result.totalApproved,
      openPeriodsCount: result.openPeriodsCount,
    };
  }, deps);
}

// ----------------------------------------------------------------------------
// Chunk 2A Additions: Reference Data Handlers
// ----------------------------------------------------------------------------

import { LedgerService } from "@/services/finance/ledger-service";
import { AccountService } from "@/services/finance/account-service";
import {
  ListLedgersInputSchema,
  ListCurrenciesInputSchema,
  ListAccountsInputSchema,
  ListCostCentersInputSchema,
  ListOpenPeriodsInputSchema,
  CreateDraftWithLinesInputSchema,
  FinanceLedgerReferenceDTO,
  FinanceCurrencyReferenceDTO,
  FinanceAccountReferenceDTO,
  FinanceCostCenterReferenceDTO,
  FinancePeriodReferenceDTO,
  FinanceJournalPermissionsDTO
} from "./finance-dtos";

export async function handleListLedgers(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceLedgerReferenceDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListLedgersInputSchema.parse(input);
    const ledgers = await LedgerService.listLedgers(context.actorId!, { onlyActive: true, search: data.search });
    // Apply pagination manually since LedgerService.listLedgers doesn't take pagination
    const items = ledgers.items.slice(data.skip, data.skip + data.take).map(l => ({
      id: l.id,
      code: l.code,
      nameAr: l.nameAr,
      nameEn: l.nameEn,
      baseCurrencyId: l.settings?.baseCurrencyId || "",
    }));
    return { items, total: ledgers.total };
  }, deps);
}

export async function handleListCurrencies(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceCurrencyReferenceDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListCurrenciesInputSchema.parse(input);
    const result = await FinanceQueryService.listCurrencies(context, { search: data.search }, { skip: data.skip, take: data.take });
    return {
      items: result.items.map(c => ({
        id: c.id,
        code: c.code,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        decimals: c.decimals,
      })),
      total: result.total,
    };
  }, deps);
}

export async function handleListAccounts(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceAccountReferenceDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListAccountsInputSchema.parse(input);
    const accounts = await AccountService.listAccounts(context.actorId!, data.ledgerId, data.skip, data.take, {
      search: data.search,
      onlyActive: true,
      onlyPosting: true,
    });
    return {
      items: accounts.items.map(a => ({
        id: a.id,
        code: a.code,
        nameAr: a.nameAr,
        nameEn: a.nameEn,
      })),
      total: accounts.total,
    };
  }, deps);
}

export async function handleListCostCenters(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinanceCostCenterReferenceDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListCostCentersInputSchema.parse(input);
    const result = await FinanceQueryService.listCostCenters(context, { ledgerId: data.ledgerId, search: data.search }, { skip: data.skip, take: data.take });
    return {
      items: result.items.map(c => ({
        id: c.id,
        code: c.code,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        type: c.type,
      })),
      total: result.total,
    };
  }, deps);
}

export async function handleListOpenPeriods(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<{ items: FinancePeriodReferenceDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListOpenPeriodsInputSchema.parse(input);
    const result = await FinanceQueryService.listOpenPeriods(context, { ledgerId: data.ledgerId }, { skip: data.skip, take: data.take });
    return {
      items: result.items.map(p => ({
        id: p.id,
        periodName: p.periodName,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
        status: p.status,
      })),
      total: result.total,
    };
  }, deps);
}

export async function handleCreateDraftWithLines(
  input: unknown,
  deps?: SessionDependencies
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = CreateDraftWithLinesInputSchema.parse(input);
    const result = await JournalService.createDraftWithLines(context, {
      idempotencyKey: data.idempotencyKey,
      ledgerId: data.ledgerId,
      fiscalPeriodId: data.fiscalPeriodId,
      entryDate: new Date(data.entryDate),
      currencyId: data.currencyId,
      description: data.description,
      exchangeRate: data.exchangeRate,
      reference: data.reference,
      lines: data.lines,
    });
    const dto = mapJournalToDTO(result);
    dto.permissions = await calculateJournalPermissions(context, result);
    return dto;
  }, deps);
}

async function calculateJournalPermissions(
  context: import("@/lib/finance-context").FinanceActionContext,
  journal: { status: string; createdById: string }
): Promise<FinanceJournalPermissionsDTO> {
  const { getCurrentUserScopedPermissions, isSuperAdmin } = await import("@/lib/rbac-helpers");

  const isSuper = await isSuperAdmin(context.actorId!);
  const perms = await getCurrentUserScopedPermissions(context.actorId!);

  const hasReview = isSuper || (perms.has("finance.journal.review") && !!perms.get("finance.journal.review")?.has("COMPANY"));
  const hasApprove = isSuper || (perms.has("finance.journal.approve") && !!perms.get("finance.journal.approve")?.has("COMPANY"));
  const hasCreateBase = isSuper || (perms.has("finance.journal.create") && !!perms.get("finance.journal.create")?.has("COMPANY"));
  const hasPost = isSuper || (perms.has("finance.journal.post") && !!perms.get("finance.journal.post")?.has("COMPANY"));
  const hasVoidBase = isSuper || (perms.has("finance.journal.void") && !!perms.get("finance.journal.void")?.has("COMPANY"));
  const hasReverseBase = isSuper || (perms.has("finance.journal.reverse") && !!perms.get("finance.journal.reverse")?.has("COMPANY"));

  // Assuming create means edit for company. If self, must be createdById
  const isCreator = context.actorId === journal.createdById;
  const isImpersonatorAndCreator = context.impersonatorId === journal.createdById;

  const canEditBase = hasCreateBase || (perms.has("finance.journal.create") && isCreator);
  const canVoidSelf = perms.has("finance.journal.void") && isCreator;
  const canReverseSelf = perms.has("finance.journal.reverse") && isCreator;

  const isDraft = journal.status === "DRAFT";
  const isPending = journal.status === "PENDING_REVIEW";

  // SoD: Approver cannot be creator (unless superadmin, but usually enforced regardless)
  const isSoDViolated = isCreator || isImpersonatorAndCreator;

  return {
    canEdit: isDraft && canEditBase,
    canSubmit: isDraft && canEditBase,
    canReview: isPending && hasReview && !isSoDViolated,
    canReturn: isPending && hasReview && !isSoDViolated,
    canApprove: isPending && hasApprove && !isSoDViolated,
    canPost: journal.status === "APPROVED" && hasPost && !isSoDViolated,
    canVoid: (isDraft && (hasVoidBase || canVoidSelf)) || (isPending && hasVoidBase),
    canReverse: journal.status === "POSTED" && (hasReverseBase || canReverseSelf),
  };
}
