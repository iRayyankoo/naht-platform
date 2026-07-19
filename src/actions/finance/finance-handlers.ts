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
    return mapJournalToDTO(result);
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
