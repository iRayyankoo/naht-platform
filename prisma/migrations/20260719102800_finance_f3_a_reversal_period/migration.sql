-- 1. Enum Updates
ALTER TYPE "FinanceActivityAction" ADD VALUE IF NOT EXISTS 'PERIOD_FROZEN';
ALTER TYPE "FinanceActivityAction" ADD VALUE IF NOT EXISTS 'PERIOD_UNFROZEN';

-- 2. Schema Alterations for FinanceJournalEntry
ALTER TABLE "FinanceJournalEntry"
  ADD COLUMN "reversalOfEntryId" text,
  ADD COLUMN "reversalReason" text;

ALTER TABLE "FinanceJournalEntry"
  ADD CONSTRAINT "FinanceJournalEntry_reversalOfEntryId_fkey" 
  FOREIGN KEY ("reversalOfEntryId") REFERENCES "FinanceJournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Explicit Database Constraints
ALTER TABLE "FinanceJournalEntry"
  ADD CONSTRAINT "chk_reversal_fields_together"
  CHECK (("reversalOfEntryId" IS NULL AND "reversalReason" IS NULL) OR ("reversalOfEntryId" IS NOT NULL AND "reversalReason" IS NOT NULL)),
  
  ADD CONSTRAINT "chk_reversal_source_match"
  CHECK (("sourceModule" = 'REVERSAL' AND "reversalOfEntryId" IS NOT NULL) OR ("sourceModule" != 'REVERSAL' AND "reversalOfEntryId" IS NULL)),
  
  ADD CONSTRAINT "chk_no_self_reversal"
  CHECK ("id" != "reversalOfEntryId");

-- 4. Partial Unique Index for Reversal Reservations
CREATE UNIQUE INDEX "idx_finance_journal_active_reversal" 
ON "FinanceJournalEntry"("reversalOfEntryId") 
WHERE "status" != 'VOIDED' AND "reversalOfEntryId" IS NOT NULL;

-- 5. Corrected Reversal Validation Trigger Function
CREATE OR REPLACE FUNCTION public.trg_finance_reversal_validate() RETURNS trigger AS $$
DECLARE
  v_orig_status text;
  v_rev_status text;
  v_orig_line_count int;
  v_rev_line_count int;
  v_mismatch_count int;
BEGIN
  SELECT "status" INTO v_orig_status FROM public."FinanceJournalEntry" WHERE "id" = NEW."originalEntryId";
  SELECT "status" INTO v_rev_status FROM public."FinanceJournalEntry" WHERE "id" = NEW."reversalEntryId";

  IF v_orig_status != 'POSTED' OR v_rev_status != 'POSTED' THEN
    RAISE EXCEPTION 'Both original and reversal journal entries must be POSTED to create a reversal record';
  END IF;

  -- Ensure exact line counts
  SELECT count(*) INTO v_orig_line_count FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."originalEntryId";
  SELECT count(*) INTO v_rev_line_count FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."reversalEntryId";
  
  IF v_orig_line_count != v_rev_line_count THEN
    RAISE EXCEPTION 'Reversal entry must have the exact same number of lines as the original entry';
  END IF;

  -- Verify lines match perfectly (Original Debit = Reversal Credit, Original Credit = Reversal Debit)
  -- Also checks missing, extra, duplicated, and account/costcenter mismatches using FULL OUTER JOIN
  SELECT count(*)
  INTO v_mismatch_count
  FROM (
    SELECT "accountId", "costCenterId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount"
    FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."originalEntryId"
  ) o
  FULL OUTER JOIN (
    SELECT "accountId", "costCenterId", "creditAmount" AS expected_debit, "debitAmount" AS expected_credit, 
           "baseCreditAmount" AS expected_base_debit, "baseDebitAmount" AS expected_base_credit
    FROM public."FinanceJournalLine" WHERE "journalEntryId" = NEW."reversalEntryId"
  ) r
  ON o."accountId" = r."accountId" 
     AND o."costCenterId" IS NOT DISTINCT FROM r."costCenterId"
     AND o."debitAmount" = r.expected_debit
     AND o."creditAmount" = r.expected_credit
     AND o."baseDebitAmount" = r.expected_base_debit
     AND o."baseCreditAmount" = r.expected_base_credit
  WHERE o."accountId" IS NULL OR r."accountId" IS NULL;

  IF v_mismatch_count > 0 THEN
    RAISE EXCEPTION 'Reversal lines do not perfectly match original lines with flipped debits and credits';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 6. Updated finance_post_journal
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
  v_source_module text;
  v_reversal_of text;
  v_reversal_reason text;
  
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

  v_impersonator text;
  v_correlation text;
  v_metadata jsonb;
BEGIN
  -- Documentation: Authorization check for finance.journal.post MUST be done by the Node.js action layer before calling this function.

  SELECT "isActive" INTO v_actor_active FROM public."User" WHERE "id" = p_actor_id;
  IF NOT v_actor_active THEN RAISE EXCEPTION 'The posting user is not active'; END IF;

  SELECT "ledgerId", "fiscalPeriodId", "status", "createdById", "reviewedById", "approvedById", "entryDate", "currencyId", "exchangeRate", "sourceModule", "reversalOfEntryId", "reversalReason"
  INTO v_ledger_id, v_fiscal_period_id, v_status, v_creator, v_reviewer, v_approver, v_entry_date, v_currency, v_exchange_rate, v_source_module, v_reversal_of, v_reversal_reason
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

  -- Reversal Completion Handling
  IF v_source_module = 'REVERSAL' THEN
    IF NOT EXISTS (SELECT 1 FROM public."FinanceJournalEntry" WHERE "id" = v_reversal_of AND "status" = 'POSTED') THEN
      RAISE EXCEPTION 'Original journal entry is not POSTED';
    END IF;
  END IF;

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

  IF v_source_module = 'REVERSAL' THEN
    INSERT INTO public."FinanceJournalReversal" ("id", "originalEntryId", "reversalEntryId", "reason", "actorId", "createdAt")
    VALUES (gen_random_uuid()::text, v_reversal_of, p_journal_id, v_reversal_reason, p_actor_id, now());
  END IF;

  -- Read Audit Context and write to Metadata
  v_impersonator := current_setting('finance.impersonator_id', true);
  v_correlation := current_setting('finance.correlation_id', true);
  
  v_metadata := jsonb_strip_nulls(jsonb_build_object(
    'impersonatorId', NULLIF(v_impersonator, ''),
    'correlationId', NULLIF(v_correlation, '')
  ));
  
  IF v_metadata = '{}'::jsonb THEN
    v_metadata := NULL;
  END IF;

  INSERT INTO public."FinanceActivityLog" ("id", "actorId", "action", "entityType", "entityId", "metadata", "createdAt")
  VALUES (gen_random_uuid()::text, p_actor_id, 'JOURNAL_POSTED', 'FinanceJournalEntry', p_journal_id, v_metadata, now());

  RETURN v_final_entry_number;
END;
$$ LANGUAGE plpgsql SET search_path = '';
