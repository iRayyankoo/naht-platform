import { z } from "zod";

// Decimal regex allowing up to 10 decimal places as per Prisma.Decimal(20,10)
const decimalRegex = /^-?\d{1,10}(\.\d{1,10})?$/;

const DecimalStringSchema = z
  .string()
  .regex(decimalRegex, "Invalid decimal format. Must be a string with up to 10 decimal places.")
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num);
    },
    { message: "Must be a valid number string" }
  );

// Positive Decimal only
const PositiveDecimalStringSchema = DecimalStringSchema.refine(
  (val) => Number(val) >= 0,
  { message: "Must be a positive value" }
);

import { FinanceAccountType, FinanceNormalBalance } from "@prisma/client";

// Ledger Validations
export const CreateLedgerSchema = z.object({
  code: z.string().min(1).max(50),
  nameAr: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  isActive: z.boolean().default(true).optional(),
}).strict();

export const UpdateLedgerSchema = z.object({
  nameAr: z.string().min(1).max(255).optional(),
  nameEn: z.string().min(1).max(255).optional(),
}).strict();

// Account Validations
export const CreateAccountSchema = z.object({
  ledgerId: z.string().cuid(),
  parentId: z.string().cuid().optional().nullable(),
  code: z.string().min(1).max(50),
  nameAr: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  type: z.nativeEnum(FinanceAccountType),
  normalBalance: z.nativeEnum(FinanceNormalBalance).optional(),
  isPostingAllowed: z.boolean().default(true),
  isActive: z.boolean().default(true).optional(),
  description: z.string().max(1000).optional().nullable(),
}).strict();

export const UpdateAccountSchema = z.object({
  parentId: z.string().cuid().optional().nullable(),
  nameAr: z.string().min(1).max(255).optional(),
  nameEn: z.string().min(1).max(255).optional(),
  type: z.nativeEnum(FinanceAccountType).optional(),
  normalBalance: z.nativeEnum(FinanceNormalBalance).optional(),
  isPostingAllowed: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
}).strict();

// Journal Line Schema
export const JournalLineSchema = z.object({
  accountId: z.string().cuid(),
  debit: PositiveDecimalStringSchema,
  credit: PositiveDecimalStringSchema,
  description: z.string().max(1000).optional().nullable(),
  costCenterId: z.string().cuid().optional().nullable(),
}).strict()
.refine(
  (data) => {
    const d = Number(data.debit);
    const c = Number(data.credit);
    // A line must have either debit or credit > 0, not both
    return (d > 0 && c === 0) || (c > 0 && d === 0);
  },
  { message: "A journal line must have exclusively either a debit or credit value > 0" }
);

// Journal Create Draft Schema
export const CreateJournalDraftSchema = z.object({
  ledgerId: z.string().cuid(),
  fiscalPeriodId: z.string().cuid(),
  entryDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO or YYYY-MM-DD
  description: z.string().min(1).max(1000),
  reference: z.string().max(255).optional().nullable(),
  currencyId: z.string().cuid(),
  exchangeRate: PositiveDecimalStringSchema.default("1"),
  idempotencyKey: z.string().min(1).max(100).optional(),
  lines: z.array(JournalLineSchema).min(2, "At least two lines are required"),
}).strict();
