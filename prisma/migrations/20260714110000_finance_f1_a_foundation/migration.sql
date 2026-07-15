-- CreateEnum
CREATE TYPE "FinancePeriodStatus" AS ENUM ('OPEN', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "FinanceJournalStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'POSTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "FinanceJournalSource" AS ENUM ('MANUAL', 'REVERSAL');

-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinanceNormalBalance" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "FinanceCostCenterType" AS ENUM ('DEPARTMENT', 'PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceActivityAction" AS ENUM ('JOURNAL_CREATED', 'JOURNAL_REVIEWED', 'JOURNAL_APPROVED', 'JOURNAL_POSTED', 'JOURNAL_REVERSED', 'JOURNAL_VOIDED', 'PERIOD_OPENED', 'PERIOD_CLOSED', 'SETTINGS_UPDATED', 'ACCOUNT_CREATED', 'ACCOUNT_UPDATED', 'PERIOD_CREATED', 'YEAR_CREATED');

-- CreateEnum
CREATE TYPE "FinanceRoundingPolicy" AS ENUM ('HALF_EVEN', 'HALF_UP', 'HALF_DOWN');

-- CreateEnum
CREATE TYPE "FinanceDocumentType" AS ENUM ('JOURNAL_ENTRY', 'VENDOR_INVOICE', 'PAYMENT');

-- CreateTable
CREATE TABLE "FinanceLedger" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceCurrency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCurrency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceSettings" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "baseCurrencyId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "roundingPolicy" "FinanceRoundingPolicy" NOT NULL DEFAULT 'HALF_EVEN',
    "companyTaxNumber" TEXT,
    "isTaxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "FinanceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceDocumentSequence" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "fiscalYearId" TEXT,
    "documentType" "FinanceDocumentType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "nextNumber" BIGINT NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceDocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceFiscalYear" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceFiscalYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceFiscalPeriod" (
    "id" TEXT NOT NULL,
    "fiscalYearId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "periodName" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "FinancePeriodStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,

    CONSTRAINT "FinanceFiscalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceAccount" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "type" "FinanceAccountType" NOT NULL,
    "normalBalance" "FinanceNormalBalance" NOT NULL,
    "parentId" TEXT,
    "isPostingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceCostCenter" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "FinanceCostCenterType" NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceJournalEntry" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "fiscalPeriodId" TEXT NOT NULL,
    "entryNumber" TEXT,
    "entryDate" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "sourceModule" "FinanceJournalSource" NOT NULL DEFAULT 'MANUAL',
    "status" "FinanceJournalStatus" NOT NULL DEFAULT 'DRAFT',
    "currencyId" TEXT NOT NULL,
    "exchangeRate" DECIMAL(20,10) NOT NULL DEFAULT 1,
    "idempotencyKey" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "postedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "FinanceJournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceJournalLine" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "costCenterId" TEXT,
    "description" TEXT,
    "debitAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "baseDebitAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "baseCreditAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,

    CONSTRAINT "FinanceJournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceJournalReversal" (
    "id" TEXT NOT NULL,
    "originalEntryId" TEXT NOT NULL,
    "reversalEntryId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceJournalReversal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "FinanceActivityAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinanceLedger_code_key" ON "FinanceLedger"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCurrency_code_key" ON "FinanceCurrency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceSettings_ledgerId_key" ON "FinanceSettings"("ledgerId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceDocumentSequence_ledgerId_fiscalYearId_documentType_key" ON "FinanceDocumentSequence"("ledgerId", "fiscalYearId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceFiscalYear_ledgerId_year_key" ON "FinanceFiscalYear"("ledgerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceFiscalPeriod_fiscalYearId_periodNumber_key" ON "FinanceFiscalPeriod"("fiscalYearId", "periodNumber");

-- CreateIndex
CREATE INDEX "FinanceAccount_type_idx" ON "FinanceAccount"("type");

-- CreateIndex
CREATE INDEX "FinanceAccount_parentId_idx" ON "FinanceAccount"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceAccount_ledgerId_code_key" ON "FinanceAccount"("ledgerId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCostCenter_ledgerId_code_key" ON "FinanceCostCenter"("ledgerId", "code");

-- CreateIndex
CREATE INDEX "FinanceJournalEntry_status_idx" ON "FinanceJournalEntry"("status");

-- CreateIndex
CREATE INDEX "FinanceJournalEntry_entryDate_idx" ON "FinanceJournalEntry"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceJournalEntry_ledgerId_entryNumber_key" ON "FinanceJournalEntry"("ledgerId", "entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceJournalEntry_ledgerId_idempotencyKey_key" ON "FinanceJournalEntry"("ledgerId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "FinanceJournalLine_accountId_idx" ON "FinanceJournalLine"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceJournalLine_journalEntryId_lineNumber_key" ON "FinanceJournalLine"("journalEntryId", "lineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceJournalReversal_originalEntryId_key" ON "FinanceJournalReversal"("originalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceJournalReversal_reversalEntryId_key" ON "FinanceJournalReversal"("reversalEntryId");

-- CreateIndex
CREATE INDEX "FinanceActivityLog_entityType_entityId_idx" ON "FinanceActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FinanceActivityLog_createdAt_idx" ON "FinanceActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FinanceSettings" ADD CONSTRAINT "FinanceSettings_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSettings" ADD CONSTRAINT "FinanceSettings_baseCurrencyId_fkey" FOREIGN KEY ("baseCurrencyId") REFERENCES "FinanceCurrency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSettings" ADD CONSTRAINT "FinanceSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceDocumentSequence" ADD CONSTRAINT "FinanceDocumentSequence_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceDocumentSequence" ADD CONSTRAINT "FinanceDocumentSequence_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FinanceFiscalYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceFiscalYear" ADD CONSTRAINT "FinanceFiscalYear_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceFiscalPeriod" ADD CONSTRAINT "FinanceFiscalPeriod_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FinanceFiscalYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceFiscalPeriod" ADD CONSTRAINT "FinanceFiscalPeriod_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FinanceAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCostCenter" ADD CONSTRAINT "FinanceCostCenter_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCostCenter" ADD CONSTRAINT "FinanceCostCenter_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCostCenter" ADD CONSTRAINT "FinanceCostCenter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WorkProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_fiscalPeriodId_fkey" FOREIGN KEY ("fiscalPeriodId") REFERENCES "FinanceFiscalPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "FinanceCurrency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalEntry" ADD CONSTRAINT "FinanceJournalEntry_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "FinanceLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalLine" ADD CONSTRAINT "FinanceJournalLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "FinanceJournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalLine" ADD CONSTRAINT "FinanceJournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinanceAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalLine" ADD CONSTRAINT "FinanceJournalLine_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "FinanceCostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalReversal" ADD CONSTRAINT "FinanceJournalReversal_originalEntryId_fkey" FOREIGN KEY ("originalEntryId") REFERENCES "FinanceJournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalReversal" ADD CONSTRAINT "FinanceJournalReversal_reversalEntryId_fkey" FOREIGN KEY ("reversalEntryId") REFERENCES "FinanceJournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceJournalReversal" ADD CONSTRAINT "FinanceJournalReversal_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceActivityLog" ADD CONSTRAINT "FinanceActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- -----------------------------------------------------------------------------
-- Phase F1-A Corrected: Advanced DB-Level Constraints, RLS, Triggers, and Functions
-- -----------------------------------------------------------------------------

SET search_path TO public;

-- Enable btree_gist for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;

-- 1. Check Constraints for Journal Lines
ALTER TABLE public."FinanceJournalLine" ADD CONSTRAINT chk_finance_line_positive CHECK ("debitAmount" >= 0 AND "creditAmount" >= 0 AND "baseDebitAmount" >= 0 AND "baseCreditAmount" >= 0);
ALTER TABLE public."FinanceJournalLine" ADD CONSTRAINT chk_finance_line_mutual_exclusive CHECK (
  ("debitAmount" > 0 AND "creditAmount" = 0) OR ("creditAmount" > 0 AND "debitAmount" = 0)
);
ALTER TABLE public."FinanceJournalLine" ADD CONSTRAINT chk_finance_line_base_mutual_exclusive CHECK (
  ("baseDebitAmount" > 0 AND "baseCreditAmount" = 0) OR ("baseCreditAmount" > 0 AND "baseDebitAmount" = 0)
);

-- 2. Constraints for Fiscal Years and Periods
ALTER TABLE public."FinanceFiscalYear" ADD CONSTRAINT chk_finance_year_dates CHECK ("startDate" <= "endDate");
ALTER TABLE public."FinanceFiscalPeriod" ADD CONSTRAINT chk_finance_period_dates CHECK ("startDate" <= "endDate");
ALTER TABLE public."FinanceFiscalPeriod" ADD CONSTRAINT chk_finance_period_number CHECK ("periodNumber" > 0);
ALTER TABLE public."FinanceFiscalPeriod" ADD CONSTRAINT chk_finance_period_closed_logic CHECK (
  ("status" = 'CLOSED' AND "closedAt" IS NOT NULL AND "closedById" IS NOT NULL) OR
  ("status" IN ('OPEN', 'FROZEN') AND "closedAt" IS NULL AND "closedById" IS NULL)
);

-- EXCLUDE USING gist for strict concurrency-safe overlap prevention
ALTER TABLE public."FinanceFiscalPeriod" ADD CONSTRAINT excl_finance_period_overlap EXCLUDE USING gist (
  "fiscalYearId" WITH =,
  daterange("startDate", "endDate", '[]') WITH &&
);

-- 3. Sequence Constraints
CREATE UNIQUE INDEX IF NOT EXISTS udx_finance_seq_null_year ON public."FinanceDocumentSequence" ("ledgerId", "documentType") WHERE "fiscalYearId" IS NULL;
ALTER TABLE public."FinanceDocumentSequence" ADD CONSTRAINT chk_finance_seq_je_year CHECK (
  "documentType" != 'JOURNAL_ENTRY' OR "fiscalYearId" IS NOT NULL
);

-- 4. Cost Center Type Constraints
ALTER TABLE public."FinanceCostCenter" ADD CONSTRAINT chk_finance_cc_type_match CHECK (
  ("type" = 'DEPARTMENT' AND "departmentId" IS NOT NULL AND "projectId" IS NULL) OR
  ("type" = 'PROJECT' AND "projectId" IS NOT NULL AND "departmentId" IS NULL) OR
  ("type" = 'OTHER' AND "departmentId" IS NULL AND "projectId" IS NULL)
);

-- 5. Reversal Not Self
ALTER TABLE public."FinanceJournalReversal" ADD CONSTRAINT chk_finance_reversal_not_self CHECK ("originalEntryId" <> "reversalEntryId");

-- 6. Immutable Triggers for POSTED Journals
CREATE OR REPLACE FUNCTION public.trg_finance_journal_immutable() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Cannot delete journal entries. Void or reverse instead.';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD."status" = 'POSTED' THEN
    RAISE EXCEPTION 'Cannot modify a POSTED journal entry';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER prevent_posted_update 
BEFORE UPDATE OR DELETE ON public."FinanceJournalEntry" 
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_journal_immutable();

CREATE OR REPLACE FUNCTION public.trg_finance_journal_line_immutable() RETURNS TRIGGER AS $$
DECLARE
  v_status text;
  v_journal_id text;
BEGIN
  v_journal_id := COALESCE(NEW."journalEntryId", OLD."journalEntryId");
  SELECT "status" INTO v_status FROM public."FinanceJournalEntry" WHERE "id" = v_journal_id;
  
  IF v_status = 'POSTED' THEN
    RAISE EXCEPTION 'Cannot insert, update, or delete lines of a POSTED journal entry';
  END IF;
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER prevent_posted_line_mutation 
BEFORE INSERT OR UPDATE OR DELETE ON public."FinanceJournalLine" 
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_journal_line_immutable();

-- 7. Activity Log Protection
CREATE OR REPLACE FUNCTION public.trg_finance_activity_log_immutable() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'FinanceActivityLog is immutable and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER prevent_activity_log_mutation
BEFORE UPDATE OR DELETE ON public."FinanceActivityLog"
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_activity_log_immutable();

-- 8. Account Hierarchy Loop Prevention (Recursive CTE)
CREATE OR REPLACE FUNCTION public.trg_finance_account_hierarchy() RETURNS TRIGGER AS $$
DECLARE
  v_parent_ledger text;
  v_has_cycle boolean;
BEGIN
  IF NEW."parentId" IS NOT NULL THEN
    -- Prevent Write Skew by taking a row-level lock on the ledger
    PERFORM 1 FROM public."FinanceLedger" WHERE "id" = NEW."ledgerId" FOR NO KEY UPDATE;

    IF NEW."parentId" = NEW."id" THEN
      RAISE EXCEPTION 'Account cannot be its own parent';
    END IF;

    SELECT "ledgerId" INTO v_parent_ledger FROM public."FinanceAccount" WHERE "id" = NEW."parentId";
    IF v_parent_ledger != NEW."ledgerId" THEN
      RAISE EXCEPTION 'Account and Parent Account must belong to the same ledger';
    END IF;

    WITH RECURSIVE account_tree AS (
      SELECT "id", "parentId" FROM public."FinanceAccount" WHERE "id" = NEW."parentId"
      UNION ALL
      SELECT a."id", a."parentId" FROM public."FinanceAccount" a
      INNER JOIN account_tree t ON t."parentId" = a."id"
    )
    SELECT EXISTS (SELECT 1 FROM account_tree WHERE "id" = NEW."id") INTO v_has_cycle;

    IF v_has_cycle THEN
      RAISE EXCEPTION 'Account hierarchy loop detected';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER prevent_account_hierarchy_loop
BEFORE INSERT OR UPDATE ON public."FinanceAccount"
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_account_hierarchy();


-- 8.5 Period Bounds & Year Immutability
CREATE OR REPLACE FUNCTION public.trg_finance_period_bounds() RETURNS TRIGGER AS $$
DECLARE
  v_year_start date;
  v_year_end date;
BEGIN
  SELECT "startDate", "endDate" INTO v_year_start, v_year_end FROM public."FinanceFiscalYear" WHERE "id" = NEW."fiscalYearId";
  IF NEW."startDate" < v_year_start OR NEW."endDate" > v_year_end THEN
    RAISE EXCEPTION 'Fiscal period dates must fall within its fiscal year dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER enforce_period_bounds
BEFORE INSERT OR UPDATE ON public."FinanceFiscalPeriod"
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_period_bounds();

CREATE OR REPLACE FUNCTION public.trg_finance_year_immutable() RETURNS TRIGGER AS $$
DECLARE
  v_has_periods boolean;
BEGIN
  IF OLD."startDate" != NEW."startDate" OR OLD."endDate" != NEW."endDate" THEN
    SELECT EXISTS (SELECT 1 FROM public."FinanceFiscalPeriod" WHERE "fiscalYearId" = NEW."id") INTO v_has_periods;
    IF v_has_periods THEN
      RAISE EXCEPTION 'Cannot modify fiscal year dates after periods have been created';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER prevent_year_bounds_change
BEFORE UPDATE ON public."FinanceFiscalYear"
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_year_immutable();


-- 8.6 Strict Reversal Validations
CREATE OR REPLACE FUNCTION public.trg_finance_reversal_validate() RETURNS TRIGGER AS $$
DECLARE
  v_orig_status text;
  v_orig_ledger text;
  v_orig_currency text;
  v_orig_rate numeric;
  
  v_rev_status text;
  v_rev_source text;
  v_rev_ledger text;
  v_rev_currency text;
  v_rev_rate numeric;
  
  v_line_mismatches int;
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'FinanceJournalReversal is immutable';
  END IF;

  SELECT "status", "ledgerId", "currencyId", "exchangeRate" INTO v_orig_status, v_orig_ledger, v_orig_currency, v_orig_rate 
  FROM public."FinanceJournalEntry" WHERE "id" = NEW."originalEntryId";
  
  IF v_orig_status != 'POSTED' THEN
    RAISE EXCEPTION 'Original journal must be POSTED to be reversed';
  END IF;

  SELECT "status", "sourceModule", "ledgerId", "currencyId", "exchangeRate" INTO v_rev_status, v_rev_source, v_rev_ledger, v_rev_currency, v_rev_rate 
  FROM public."FinanceJournalEntry" WHERE "id" = NEW."reversalEntryId";
  
  IF v_rev_status != 'POSTED' THEN
    RAISE EXCEPTION 'Reversing journal must also be POSTED before recording the reversal link';
  END IF;
  
  IF v_rev_source != 'REVERSAL' THEN
    RAISE EXCEPTION 'Reversing journal sourceModule must be REVERSAL';
  END IF;
  
  IF v_orig_ledger != v_rev_ledger OR v_orig_currency != v_rev_currency OR v_orig_rate != v_rev_rate THEN
    RAISE EXCEPTION 'Reversing journal must have the exact same ledger, currency, and exchangeRate as the original';
  END IF;

  -- Ensure exact inversion line-by-line
  SELECT count(*) INTO v_line_mismatches
  FROM (
    SELECT "accountId", "costCenterId", "creditAmount" as exp_debit, "debitAmount" as exp_credit, "baseCreditAmount" as exp_base_debit, "baseDebitAmount" as exp_base_credit
    FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."originalEntryId"
    EXCEPT
    SELECT "accountId", "costCenterId", "debitAmount" as exp_debit, "creditAmount" as exp_credit, "baseDebitAmount" as exp_base_debit, "baseCreditAmount" as exp_base_credit
    FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."reversalEntryId"
  ) mismatches;

  IF v_line_mismatches > 0 THEN
    RAISE EXCEPTION 'Reversing journal lines must exactly invert the original journal lines (account, cost center, and amounts)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER protect_reversals
BEFORE INSERT OR UPDATE OR DELETE ON public."FinanceJournalReversal"
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_reversal_validate();


-- 9. Guard Trigger to prevent bypassing the atomic function
CREATE OR REPLACE FUNCTION public.trg_finance_journal_status_guard() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW."status" = 'POSTED' AND OLD."status" != 'POSTED' THEN
      IF current_setting('finance.is_posting', true) IS NULL OR current_setting('finance.is_posting', true) != 'true' THEN
        RAISE EXCEPTION 'Cannot change status to POSTED directly. Use finance_post_journal() function.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER guard_journal_posting 
BEFORE UPDATE ON public."FinanceJournalEntry" 
FOR EACH ROW EXECUTE FUNCTION public.trg_finance_journal_status_guard();

-- 10. Atomic Posting Function (finance_post_journal)
CREATE OR REPLACE FUNCTION public.finance_post_journal(p_journal_id text, p_actor_id text) RETURNS text AS $$
DECLARE
  v_ledger_id text;
  v_ledger_active boolean;
  v_fiscal_period_id text;
  v_status text;
  v_creator text;
  v_reviewer text;
  v_approver text;
  v_actor_active boolean;
  v_entry_date date;
  v_currency text;
  v_exchange_rate numeric;
  
  v_period_status text;
  v_period_start date;
  v_period_end date;
  v_period_ledger text;
  v_fiscal_year_id text;
  
  v_settings_exists boolean;
  v_base_currency text;
  v_rounding_policy text;
  v_currency_active boolean;
  
  v_line_count int;
  v_debit numeric;
  v_credit numeric;
  v_base_debit numeric;
  v_base_credit numeric;
  v_invalid_lines int;
  
  v_invalid_accounts int;
  v_invalid_cost_centers int;
  
  v_seq_id text;
  v_seq_prefix text;
  v_seq_next bigint;
  v_seq_padding int;
  v_final_entry_number text;
BEGIN
  -- Documentation: Authorization check for finance.gl.post MUST be done by the Node.js action layer before calling this function.

  SELECT "isActive" INTO v_actor_active FROM public."User" WHERE "id" = p_actor_id;
  IF NOT v_actor_active THEN RAISE EXCEPTION 'The posting user is not active'; END IF;

  SELECT "ledgerId", "fiscalPeriodId", "status", "createdById", "reviewedById", "approvedById", "entryDate", "currencyId", "exchangeRate"
  INTO v_ledger_id, v_fiscal_period_id, v_status, v_creator, v_reviewer, v_approver, v_entry_date, v_currency, v_exchange_rate
  FROM public."FinanceJournalEntry" WHERE "id" = p_journal_id FOR UPDATE;
  
  IF NOT FOUND THEN RAISE EXCEPTION 'Journal entry not found'; END IF;
  IF v_status != 'APPROVED' THEN RAISE EXCEPTION 'Journal must be APPROVED before posting'; END IF;
  
  IF v_reviewer IS NULL OR v_approver IS NULL THEN
    RAISE EXCEPTION 'Journal must have both reviewer and approver before posting';
  END IF;

  IF v_creator = p_actor_id OR v_reviewer = p_actor_id OR v_approver = p_actor_id OR 
     v_creator = v_reviewer OR v_reviewer = v_approver OR v_creator = v_approver THEN 
    RAISE EXCEPTION 'Separation of Duties violated: Creator, Reviewer, Approver, and Poster must be distinct users'; 
  END IF;

  SELECT "isActive" INTO v_ledger_active FROM public."FinanceLedger" WHERE "id" = v_ledger_id;
  IF NOT v_ledger_active THEN RAISE EXCEPTION 'Ledger is inactive'; END IF;

  SELECT EXISTS(SELECT 1 FROM public."FinanceSettings" WHERE "ledgerId" = v_ledger_id) INTO v_settings_exists;
  IF NOT v_settings_exists THEN RAISE EXCEPTION 'Finance settings are missing for this ledger'; END IF;

  SELECT "baseCurrencyId", "roundingPolicy"::text INTO v_base_currency, v_rounding_policy FROM public."FinanceSettings" WHERE "ledgerId" = v_ledger_id;
  SELECT "isActive" INTO v_currency_active FROM public."FinanceCurrency" WHERE "id" = v_currency;
  
  IF NOT v_currency_active THEN RAISE EXCEPTION 'Journal currency is not active'; END IF;
  IF v_exchange_rate <= 0 THEN RAISE EXCEPTION 'Exchange rate must be greater than 0'; END IF;
  IF v_currency = v_base_currency AND v_exchange_rate != 1 THEN RAISE EXCEPTION 'Exchange rate must be 1 for base currency'; END IF;

  SELECT p."status", p."startDate", p."endDate", p."fiscalYearId", y."ledgerId"
  INTO v_period_status, v_period_start, v_period_end, v_fiscal_year_id, v_period_ledger
  FROM public."FinanceFiscalPeriod" p
  JOIN public."FinanceFiscalYear" y ON p."fiscalYearId" = y."id"
  WHERE p."id" = v_fiscal_period_id FOR UPDATE;
  
  IF v_period_status != 'OPEN' THEN RAISE EXCEPTION 'Cannot post to a FROZEN or CLOSED fiscal period'; END IF;
  IF v_period_ledger != v_ledger_id THEN RAISE EXCEPTION 'Fiscal period does not belong to the journal ledger'; END IF;
  IF v_entry_date < v_period_start OR v_entry_date > v_period_end THEN
    RAISE EXCEPTION 'Journal entry date must fall within the fiscal period dates';
  END IF;

  PERFORM 1 FROM public."FinanceJournalLine" WHERE "journalEntryId" = p_journal_id FOR UPDATE;
  
  SELECT count(*), COALESCE(sum("debitAmount"), 0), COALESCE(sum("creditAmount"), 0), COALESCE(sum("baseDebitAmount"), 0), COALESCE(sum("baseCreditAmount"), 0)
  INTO v_line_count, v_debit, v_credit, v_base_debit, v_base_credit 
  FROM public."FinanceJournalLine" WHERE "journalEntryId" = p_journal_id;
  
  IF v_line_count < 2 THEN RAISE EXCEPTION 'Journal must have at least 2 lines'; END IF;
  IF v_debit != v_credit THEN RAISE EXCEPTION 'Journal is not balanced (transaction currency)'; END IF;
  IF v_base_debit != v_base_credit THEN RAISE EXCEPTION 'Journal is not balanced (base currency)'; END IF;
  IF v_base_debit = 0 THEN RAISE EXCEPTION 'Journal amounts must be greater than zero'; END IF;
  
  -- Verify line-by-line conversion using strict ROUND(amount * rate, 4) assumption for F1-A
  SELECT count(*) INTO v_invalid_lines
  FROM public."FinanceJournalLine"
  WHERE "journalEntryId" = p_journal_id 
    AND (
      "baseDebitAmount" != ROUND("debitAmount" * v_exchange_rate, 4) OR
      "baseCreditAmount" != ROUND("creditAmount" * v_exchange_rate, 4)
    );
  
  IF v_invalid_lines > 0 THEN RAISE EXCEPTION 'One or more lines have incorrect base amount conversions (expected exactly ROUND(amount * rate, 4))'; END IF;

  SELECT count(*) INTO v_invalid_accounts
  FROM public."FinanceJournalLine" l
  JOIN public."FinanceAccount" a ON l."accountId" = a."id"
  WHERE l."journalEntryId" = p_journal_id 
    AND (a."ledgerId" != v_ledger_id OR a."isActive" = false OR a."isPostingAllowed" = false);
    
  IF v_invalid_accounts > 0 THEN RAISE EXCEPTION 'One or more accounts are invalid, inactive, or not posting-allowed for this ledger'; END IF;

  SELECT count(*) INTO v_invalid_cost_centers
  FROM public."FinanceJournalLine" l
  JOIN public."FinanceCostCenter" c ON l."costCenterId" = c."id"
  WHERE l."journalEntryId" = p_journal_id AND l."costCenterId" IS NOT NULL
    AND (c."ledgerId" != v_ledger_id OR c."isActive" = false);
    
  IF v_invalid_cost_centers > 0 THEN RAISE EXCEPTION 'One or more cost centers are invalid or inactive for this ledger'; END IF;

  UPDATE public."FinanceDocumentSequence"
  SET "nextNumber" = "nextNumber" + 1, "updatedAt" = now()
  WHERE "ledgerId" = v_ledger_id AND "fiscalYearId" = v_fiscal_year_id AND "documentType" = 'JOURNAL_ENTRY'
  RETURNING "id", "prefix", "nextNumber", "padding" 
  INTO v_seq_id, v_seq_prefix, v_seq_next, v_seq_padding;

  IF NOT FOUND THEN RAISE EXCEPTION 'Document sequence not found for JOURNAL_ENTRY in this year'; END IF;
  
  v_final_entry_number := v_seq_prefix || LPAD((v_seq_next - 1)::text, v_seq_padding, '0');

  PERFORM set_config('finance.is_posting', 'true', true);

  UPDATE public."FinanceJournalEntry" 
  SET "status" = 'POSTED', "entryNumber" = v_final_entry_number, "postedById" = p_actor_id, "postedAt" = now(), "updatedAt" = now()
  WHERE "id" = p_journal_id;

  INSERT INTO public."FinanceActivityLog" ("id", "actorId", "action", "entityType", "entityId", "createdAt")
  VALUES (gen_random_uuid()::text, p_actor_id, 'JOURNAL_POSTED', 'FinanceJournalEntry', p_journal_id, now());

  RETURN v_final_entry_number;
END;
$$ LANGUAGE plpgsql SET search_path = '';


-- 11. RLS and Permissions Revoke
ALTER TABLE public."FinanceLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceCurrency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceDocumentSequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceFiscalYear" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceFiscalPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceCostCenter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceJournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceJournalLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceJournalReversal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FinanceActivityLog" ENABLE ROW LEVEL SECURITY;

REVOKE EXECUTE ON FUNCTION public.trg_finance_journal_immutable() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_journal_line_immutable() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_activity_log_immutable() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_account_hierarchy() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_period_bounds() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_year_immutable() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_reversal_validate() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.trg_finance_journal_status_guard() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.finance_post_journal(text, text) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON public."FinanceLedger" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceSettings" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceCurrency" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceDocumentSequence" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceFiscalYear" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceFiscalPeriod" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceAccount" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceCostCenter" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceJournalEntry" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceJournalLine" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceJournalReversal" FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public."FinanceActivityLog" FROM PUBLIC, anon, authenticated, service_role;
