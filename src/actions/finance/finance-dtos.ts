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
  period: Prisma.FinanceFiscalPeriodGetPayload<Prisma.FinanceFiscalPeriodDefaultArgs>
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
  line: Prisma.FinanceJournalLineGetPayload<Prisma.FinanceJournalLineDefaultArgs>
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
  journal: Prisma.FinanceJournalEntryGetPayload<Prisma.FinanceJournalEntryDefaultArgs>
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

const DecimalStringSchema = z
  .string()
  .regex(/^[0-9]{1,15}(\.[0-9]{1,4})?$/, "Invalid decimal format, max 19,4")
  .refine((val) => !/[\x00-\x1F\x7F]/.test(val), "Control characters not allowed");

const IdSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((val) => !/[\x00-\x1F\x7F]/.test(val), "Control characters not allowed");

export const CreateDraftInputSchema = z.object({
  ledgerId: IdSchema,
  fiscalPeriodId: IdSchema,
  entryDate: z.string().datetime(), // ISO Date String
  currencyId: IdSchema,
  exchangeRate: DecimalStringSchema.optional(),
  description: z.string().min(1).max(500),
  reference: z.string().max(100).optional(),
}).strict();

export const UpdateDraftInputSchema = z.object({
  journalId: IdSchema,
  description: z.string().min(1).max(500).optional(),
  reference: z.string().max(100).optional(),
  entryDate: z.string().datetime().optional(),
}).strict();



function validateLineAmounts(data: { debitAmount?: string; creditAmount?: string }) {
  let debit = false;
  let credit = false;
  if (data.debitAmount) {
    try { debit = new Prisma.Decimal(data.debitAmount).gt(0); } catch { debit = false; }
  }
  if (data.creditAmount) {
    try { credit = new Prisma.Decimal(data.creditAmount).gt(0); } catch { credit = false; }
  }
  if (debit && credit) return false;
  if (!debit && !credit) return false;
  return true;
}

export const AddLineInputSchema = z.object({
  journalId: IdSchema,
  accountId: IdSchema,
  costCenterId: IdSchema.nullable().optional(),
  description: z.string().max(500).optional(),
  debitAmount: DecimalStringSchema.optional(),
  creditAmount: DecimalStringSchema.optional(),
}).strict().refine(validateLineAmounts, { message: "Exactly one of debitAmount or creditAmount must be provided and > 0" });

export const UpdateLineInputSchema = z.object({
  journalId: IdSchema,
  lineId: IdSchema,
  accountId: IdSchema.optional(),
  costCenterId: IdSchema.nullable().optional(),
  description: z.string().max(500).optional(),
  debitAmount: DecimalStringSchema.optional(),
  creditAmount: DecimalStringSchema.optional(),
}).strict().refine((data) => {
  // If neither is provided, that means we are not updating amounts.
  if (data.debitAmount === undefined && data.creditAmount === undefined) return true;
  return validateLineAmounts(data);
}, { message: "Exactly one of debitAmount or creditAmount must be provided and > 0" });

export const RemoveLineInputSchema = z.object({
  journalId: IdSchema,
  lineId: IdSchema,
}).strict();

export const ActionReasonInputSchema = z.object({
  journalId: IdSchema,
  reason: z.string().min(1).max(500),
}).strict();

export const ReverseJournalInputSchema = z.object({
  journalId: IdSchema,
  targetFiscalPeriodId: IdSchema,
  reversalReason: z.string().min(1).max(500),
}).strict();

export const IdInputSchema = z.object({
  id: IdSchema,
}).strict();

export const ListJournalsInputSchema = z.object({
  ledgerId: IdSchema.optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "POSTED", "VOIDED"]).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

export const ListPeriodsInputSchema = z.object({
  fiscalYearId: IdSchema.optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();
