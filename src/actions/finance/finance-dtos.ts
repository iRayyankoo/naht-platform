import { z } from "zod";
import { Prisma } from "@prisma/client";

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface FinanceFiscalPeriodDTO {
  id: string;
  fiscalYearId: string;
  periodNumber: number;
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
  closedAt: string | null;
}

export interface FinanceJournalLineDTO {
  id: string;
  journalEntryId: string;
  lineNumber: number;
  accountId: string;
  costCenterId: string | null;
  description: string | null;
  debitAmount: string;
  creditAmount: string;
  baseDebitAmount: string;
  baseCreditAmount: string;
}

export interface FinanceJournalEntryDTO {
  id: string;
  ledgerId: string;
  fiscalPeriodId: string;
  entryNumber: string | null;
  entryDate: string;
  description: string;
  reference: string | null;
  sourceModule: string;
  status: string;
  currencyId: string;
  exchangeRate: string;
  rejectionReason: string | null;
  lines?: FinanceJournalLineDTO[];
}

export interface FinanceDashboardSummaryDTO {
  totalDrafts: number;
  totalPendingReview: number;
  totalApproved: number;
  openPeriodsCount: number;
}

// ============================================================================
// Mappers
// ============================================================================

export function mapPeriodToDTO(
  period: Prisma.FinanceFiscalPeriodGetPayload<{}>
): FinanceFiscalPeriodDTO {
  return {
    id: period.id,
    fiscalYearId: period.fiscalYearId,
    periodNumber: period.periodNumber,
    periodName: period.periodName,
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    status: period.status,
    closedAt: period.closedAt ? period.closedAt.toISOString() : null,
  };
}

export function mapJournalLineToDTO(
  line: Prisma.FinanceJournalLineGetPayload<{}>
): FinanceJournalLineDTO {
  return {
    id: line.id,
    journalEntryId: line.journalEntryId,
    lineNumber: line.lineNumber,
    accountId: line.accountId,
    costCenterId: line.costCenterId,
    description: line.description,
    debitAmount: line.debitAmount.toString(),
    creditAmount: line.creditAmount.toString(),
    baseDebitAmount: line.baseDebitAmount.toString(),
    baseCreditAmount: line.baseCreditAmount.toString(),
  };
}

export function mapJournalToDTO(
  journal: Prisma.FinanceJournalEntryGetPayload<{
    include: { lines: true };
  }>
): FinanceJournalEntryDTO {
  return {
    id: journal.id,
    ledgerId: journal.ledgerId,
    fiscalPeriodId: journal.fiscalPeriodId,
    entryNumber: journal.entryNumber,
    entryDate: journal.entryDate.toISOString(),
    description: journal.description,
    reference: journal.reference,
    sourceModule: journal.sourceModule,
    status: journal.status,
    currencyId: journal.currencyId,
    exchangeRate: journal.exchangeRate.toString(),
    rejectionReason: journal.rejectionReason,
    lines: journal.lines ? journal.lines.map(mapJournalLineToDTO) : undefined,
  };
}

export function mapJournalToDTOWithoutLines(
  journal: Prisma.FinanceJournalEntryGetPayload<{}>
): FinanceJournalEntryDTO {
  return {
    id: journal.id,
    ledgerId: journal.ledgerId,
    fiscalPeriodId: journal.fiscalPeriodId,
    entryNumber: journal.entryNumber,
    entryDate: journal.entryDate.toISOString(),
    description: journal.description,
    reference: journal.reference,
    sourceModule: journal.sourceModule,
    status: journal.status,
    currencyId: journal.currencyId,
    exchangeRate: journal.exchangeRate.toString(),
    rejectionReason: journal.rejectionReason,
  };
}

// ============================================================================
// Input Validation Schemas
// ============================================================================

// A strict decimal string regex (e.g. "100.50", "0.01", "1000")
const DecimalStringSchema = z
  .string()
  .regex(/^[0-9]+(\.[0-9]+)?$/, "Invalid decimal format");

export const CreateDraftInputSchema = z.object({
  ledgerId: z.string().min(1).max(100),
  fiscalPeriodId: z.string().min(1).max(100),
  entryDate: z.string().datetime(), // ISO Date String
  currencyId: z.string().min(1).max(100),
  exchangeRate: DecimalStringSchema.optional(),
  description: z.string().min(1).max(500),
  reference: z.string().max(100).optional(),
});

export const UpdateDraftInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional(),
  reference: z.string().max(100).optional(),
  entryDate: z.string().datetime().optional(),
});

export const AddLineInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  accountId: z.string().min(1).max(100),
  costCenterId: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  debitAmount: DecimalStringSchema.optional(),
  creditAmount: DecimalStringSchema.optional(),
});

export const UpdateLineInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  lineId: z.string().min(1).max(100),
  accountId: z.string().min(1).max(100).optional(),
  costCenterId: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  debitAmount: DecimalStringSchema.optional(),
  creditAmount: DecimalStringSchema.optional(),
});

export const RemoveLineInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  lineId: z.string().min(1).max(100),
});

export const ActionReasonInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  reason: z.string().min(1).max(500),
});

export const ReverseJournalInputSchema = z.object({
  journalId: z.string().min(1).max(100),
  targetFiscalPeriodId: z.string().min(1).max(100),
  reversalReason: z.string().min(1).max(500),
});

export const IdInputSchema = z.object({
  id: z.string().min(1).max(100),
});

export const ListJournalsInputSchema = z.object({
  ledgerId: z.string().min(1).max(100).optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "POSTED", "VOIDED"]).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
});

export const ListPeriodsInputSchema = z.object({
  fiscalYearId: z.string().min(1).max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
});
