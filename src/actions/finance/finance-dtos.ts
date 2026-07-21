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

export interface FinanceCurrencyInfoDTO {
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface FinancePeriodInfoDTO {
  periodName: string;
}

export interface FinanceAccountInfoDTO {
  code: string;
  nameAr: string;
  nameEn: string;
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
  account?: FinanceAccountInfoDTO | null;
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
  currency?: FinanceCurrencyInfoDTO | null;
  period?: FinancePeriodInfoDTO | null;
  totalDebit?: string;
  totalCredit?: string;
  totalBaseDebit?: string;
  totalBaseCredit?: string;
  lines?: FinanceJournalLineDTO[];
  permissions?: FinanceJournalPermissionsDTO;
}

export interface FinanceLedgerReferenceDTO {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  baseCurrencyId: string;
}

export interface FinanceCurrencyReferenceDTO {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  decimals: number;
}

export interface FinanceAccountReferenceDTO {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface FinanceCostCenterReferenceDTO {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: string;
}

export interface FinancePeriodReferenceDTO {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface FinanceJournalPermissionsDTO {
  canEdit: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canReturn: boolean;
  canApprove: boolean;
  canPost: boolean;
  canVoid: boolean;
  canReverse: boolean;
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
  line: Prisma.FinanceJournalLineGetPayload<{
    include: { account: true };
  }> | Prisma.FinanceJournalLineGetPayload<Prisma.FinanceJournalLineDefaultArgs>
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
    account: "account" in line && line.account ? {
      code: line.account.code,
      nameAr: line.account.nameAr,
      nameEn: line.account.nameEn,
    } : null,
  };
}

export function mapJournalToDTO(
  journal: Prisma.FinanceJournalEntryGetPayload<{
    include: {
      lines: { include: { account: true } };
      currency: true;
      fiscalPeriod: true;
    };
  }> | Prisma.FinanceJournalEntryGetPayload<{
    include: { lines: true };
  }>
): FinanceJournalEntryDTO {
  let totalDebit = new Prisma.Decimal(0);
  let totalCredit = new Prisma.Decimal(0);
  let totalBaseDebit = new Prisma.Decimal(0);
  let totalBaseCredit = new Prisma.Decimal(0);

  if (journal.lines) {
    for (const line of journal.lines) {
      totalDebit = totalDebit.add(line.debitAmount);
      totalCredit = totalCredit.add(line.creditAmount);
      totalBaseDebit = totalBaseDebit.add(line.baseDebitAmount);
      totalBaseCredit = totalBaseCredit.add(line.baseCreditAmount);
    }
  }

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
    currency: "currency" in journal && journal.currency ? {
      code: journal.currency.code,
      nameAr: journal.currency.nameAr,
      nameEn: journal.currency.nameEn,
    } : null,
    period: "fiscalPeriod" in journal && journal.fiscalPeriod ? {
      periodName: journal.fiscalPeriod.periodName,
    } : null,
    totalDebit: totalDebit.toString(),
    totalCredit: totalCredit.toString(),
    totalBaseDebit: totalBaseDebit.toString(),
    totalBaseCredit: totalBaseCredit.toString(),
    lines: journal.lines ? journal.lines.map(mapJournalLineToDTO) : undefined,
  };
}

export function mapJournalToDTOWithoutLines(
  journal: Prisma.FinanceJournalEntryGetPayload<{
    include: {
      currency: true;
      fiscalPeriod: true;
      lines: { select: { debitAmount: true; creditAmount: true; baseDebitAmount: true; baseCreditAmount: true; } };
    };
  }> | Prisma.FinanceJournalEntryGetPayload<Prisma.FinanceJournalEntryDefaultArgs>
): FinanceJournalEntryDTO {
  let totalDebit = new Prisma.Decimal(0);
  let totalCredit = new Prisma.Decimal(0);
  let totalBaseDebit = new Prisma.Decimal(0);
  let totalBaseCredit = new Prisma.Decimal(0);

  if ("lines" in journal && Array.isArray(journal.lines)) {
    for (const line of journal.lines) {
      if (line.debitAmount) totalDebit = totalDebit.add(line.debitAmount);
      if (line.creditAmount) totalCredit = totalCredit.add(line.creditAmount);
      if (line.baseDebitAmount) totalBaseDebit = totalBaseDebit.add(line.baseDebitAmount);
      if (line.baseCreditAmount) totalBaseCredit = totalBaseCredit.add(line.baseCreditAmount);
    }
  }

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
    currency: "currency" in journal && journal.currency ? {
      code: journal.currency.code,
      nameAr: journal.currency.nameAr,
      nameEn: journal.currency.nameEn,
    } : null,
    period: "fiscalPeriod" in journal && journal.fiscalPeriod ? {
      periodName: journal.fiscalPeriod.periodName,
    } : null,
    totalDebit: totalDebit.toString(),
    totalCredit: totalCredit.toString(),
    totalBaseDebit: totalBaseDebit.toString(),
    totalBaseCredit: totalBaseCredit.toString(),
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

export const CreateDraftWithLinesInputSchema = z.object({
  idempotencyKey: z.string().min(1).max(100),
  ledgerId: IdSchema,
  fiscalPeriodId: IdSchema,
  entryDate: z.string().datetime(), // ISO Date String
  currencyId: IdSchema,
  exchangeRate: z
    .string()
    .regex(/^[0-9]{1,13}(\.[0-9]{1,6})?$/, "Invalid decimal format, max 19,6")
    .optional(),
  description: z.string().min(1).max(500),
  reference: z.string().max(100).optional(),
  lines: z.array(z.object({
    accountId: IdSchema,
    costCenterId: IdSchema.nullable().optional(),
    description: z.string().max(500).optional(),
    debitAmount: DecimalStringSchema.optional(),
    creditAmount: DecimalStringSchema.optional(),
  }).strict().refine(validateLineAmounts, { message: "Exactly one of debitAmount or creditAmount must be provided and > 0" }))
}).strict();

export const ListLedgersInputSchema = z.object({
  search: z.string().max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

export const ListCurrenciesInputSchema = z.object({
  search: z.string().max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

export const ListAccountsInputSchema = z.object({
  ledgerId: IdSchema,
  search: z.string().max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

export const ListCostCentersInputSchema = z.object({
  ledgerId: IdSchema,
  search: z.string().max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

export const ListOpenPeriodsInputSchema = z.object({
  ledgerId: IdSchema,
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(50),
}).strict();

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
