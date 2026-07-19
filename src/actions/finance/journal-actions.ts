"use server";

import { JournalService } from "@/services/finance/journal-service";
import {
  FinanceActionResult,
  withFinanceActionErrorHandler,
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
  FinanceJournalEntryDTO,
  FinanceJournalLineDTO,
  mapJournalToDTO,
  mapJournalLineToDTO,
  mapJournalToDTOWithoutLines,
} from "./finance-dtos";

export async function createDraftAction(
  input: unknown
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
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function updateDraftAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = UpdateDraftInputSchema.parse(input);
    const result = await JournalService.updateDraft(context, data.journalId, {
      description: data.description,
      reference: data.reference,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
    });
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function addLineAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalLineDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = AddLineInputSchema.parse(input);
    const result = await JournalService.addLine(context, data.journalId, {
      accountId: data.accountId,
      costCenterId: data.costCenterId,
      description: data.description,
      debitAmount: data.debitAmount ?? "0",
      creditAmount: data.creditAmount ?? "0",
    });
    return mapJournalLineToDTO(result as any);
  });
}

export async function updateLineAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalLineDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = UpdateLineInputSchema.parse(input);
    const result = await JournalService.updateLine(context, data.journalId, data.lineId, {
      accountId: data.accountId,
      costCenterId: data.costCenterId,
      description: data.description,
      debitAmount: data.debitAmount,
      creditAmount: data.creditAmount,
    });
    return mapJournalLineToDTO(result as any);
  });
}

export async function removeLineAction(
  input: unknown
): Promise<FinanceActionResult<void>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = RemoveLineInputSchema.parse(input);
    await JournalService.removeLine(context, data.journalId, data.lineId);
  });
}

export async function submitForReviewAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.submitForReview(context, data.id);
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function reviewJournalAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.reviewJournal(context, data.id);
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function returnForModificationAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ActionReasonInputSchema.parse(input);
    const result = await JournalService.returnForModification(context, data.journalId, data.reason);
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function approveJournalAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.approveJournal(context, data.id);
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function voidJournalAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ActionReasonInputSchema.parse(input);
    const result = await JournalService.voidJournal(context, data.journalId, data.reason);
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function reverseJournalAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ReverseJournalInputSchema.parse(input);
    const result = await JournalService.reverseJournal(
      context,
      data.journalId,
      data.targetFiscalPeriodId,
      data.reversalReason
    );
    return mapJournalToDTOWithoutLines(result as any);
  });
}

export async function postJournalAction(
  input: unknown
): Promise<FinanceActionResult<{ entryNumber: string }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.postJournal(context, data.id);
    return result;
  });
}

export async function getJournalAction(
  input: unknown
): Promise<FinanceActionResult<FinanceJournalEntryDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await JournalService.getJournal(context, data.id);
    return mapJournalToDTO(result as any);
  });
}

export async function listJournalsAction(
  input: unknown
): Promise<FinanceActionResult<{ items: FinanceJournalEntryDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListJournalsInputSchema.parse(input);
    const result = await JournalService.listJournals(
      context,
      { ledgerId: data.ledgerId, status: data.status },
      { skip: data.skip, take: data.take }
    );
    return {
      items: result.items.map((j) => mapJournalToDTOWithoutLines(j as any)),
      total: result.total,
    };
  });
}
