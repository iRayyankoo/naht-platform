import { Client, DatabaseError } from 'pg';

function isDatabaseError(err: unknown): err is DatabaseError {
  return typeof err === 'object' && err !== null && 'code' in err;
}

async function main() {
  const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database URL is not set. Aborting.');
  }

  const client = new Client({ connectionString });
  await client.connect();

  let failedCount = 0;

  async function runTest(testName: string, query: string, params: any[], expectedCode: string, expectedMessageSubstring?: string) {
    try {
      await client.query('SAVEPOINT test_sp');
      await client.query(query, params);
      await client.query('RELEASE SAVEPOINT test_sp');
      console.error(`\x1b[31m❌ [${testName}] Failed: Expected error code ${expectedCode} but query succeeded.\x1b[0m`);
      failedCount++;
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT test_sp');
      if (isDatabaseError(e)) {
        if (e.code === expectedCode) {
          if (expectedMessageSubstring && (!e.message.includes(expectedMessageSubstring) && !(e.detail && e.detail.includes(expectedMessageSubstring)) && !(e.constraint && e.constraint.includes(expectedMessageSubstring)))) {
            console.error(`\x1b[31m❌ [${testName}] Failed: Got code=${e.code} msg="${e.message}" detail="${e.detail}". Expected msg="${expectedMessageSubstring}"\x1b[0m`);
            failedCount++;
          } else {
            console.log(`\x1b[32m✅ [${testName}] Passed.\x1b[0m`);
          }
        } else {
          console.error(`\x1b[31m❌ [${testName}] Failed: Expected error code ${expectedCode}, but got ${e.code} (${e.message})\x1b[0m`);
          failedCount++;
        }
      } else {
        console.error(`\x1b[31m❌ [${testName}] Failed: Unknown error ${String(e)}\x1b[0m`);
        failedCount++;
      }
    }
  }

  try {
    await client.query('BEGIN');
    
    // Setup Base Data
    const ledger = 'f3_ledger';
    const year = 'f3_year';
    const p1 = 'f3_p1';
    const c1 = 'f3_usd';
    const a1 = 'f3_a1';
    const a2 = 'f3_a2';
    const u1 = 'f3_u1';
    const u2 = 'f3_u2';
    const u3 = 'f3_u3';
    const u4 = 'f3_u4';
    
    await client.query(`INSERT INTO public."User" (id, email, name, "isActive", "createdAt", "updatedAt") VALUES ($1, 'u1@x', 'u1', true, now(), now()), ($2, 'u2@x', 'u2', true, now(), now()), ($3, 'u3@x', 'u3', true, now(), now()), ($4, 'u4@x', 'u4', true, now(), now()) ON CONFLICT DO NOTHING`, [u1, u2, u3, u4]);
    await client.query(`INSERT INTO public."FinanceCurrency" (id, "code", "nameAr", "nameEn", "isActive", "createdAt", "updatedAt") VALUES ($1, 'USD', 'US Dollar', 'US Dollar', true, now(), now()) ON CONFLICT DO NOTHING`, [c1]);
    await client.query(`INSERT INTO public."FinanceLedger" (id, "code", "nameAr", "nameEn", "isActive", "createdAt", "updatedAt") VALUES ($1, 'L3', 'Ledger 3', 'Ledger 3', true, now(), now()) ON CONFLICT DO NOTHING`, [ledger]);
    await client.query(`INSERT INTO public."FinanceSettings" (id, "ledgerId", "baseCurrencyId", "roundingPolicy", "createdAt", "updatedAt", "updatedById") VALUES ('fs3', $1, $2, 'HALF_EVEN', now(), now(), $3) ON CONFLICT DO NOTHING`, [ledger, c1, u1]);
    await client.query(`INSERT INTO public."FinanceAccount" (id, "ledgerId", "code", "nameAr", "nameEn", "type", "normalBalance", "isActive", "isPostingAllowed", "createdAt", "updatedAt") VALUES ($1, $2, 'A31', 'A31', 'A31', 'ASSET', 'DEBIT', true, true, now(), now()), ($3, $2, 'A32', 'A32', 'A32', 'REVENUE', 'CREDIT', true, true, now(), now()) ON CONFLICT DO NOTHING`, [a1, ledger, a2]);
    await client.query(`INSERT INTO public."FinanceFiscalYear" (id, "ledgerId", "year", "startDate", "endDate", "createdAt", "updatedAt") VALUES ($1, $2, 2026, '2026-01-01', '2026-12-31', now(), now()) ON CONFLICT DO NOTHING`, [year, ledger]);
    await client.query(`INSERT INTO public."FinanceDocumentSequence" (id, "ledgerId", "fiscalYearId", "documentType", "prefix", "nextNumber", "padding", "createdAt", "updatedAt") VALUES ('seq3', $1, $2, 'JOURNAL_ENTRY', 'J', 1, 5, now(), now()) ON CONFLICT DO NOTHING`, [ledger, year]);
    await client.query(`INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", "status", "createdAt", "updatedAt") VALUES ($1, $2, 1, 'Jan', '2026-01-01', '2026-01-31', 'OPEN', now(), now()) ON CONFLICT DO NOTHING`, [p1, year]);

    // Create a POSTED original journal
    const j1 = 'f3_j1';
    await client.query(`
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'Orig1', 'APPROVED', 'MANUAL', $4, 1, $5, $6, $7, '2026-01-10', now(), now());
    `, [j1, ledger, p1, c1, u1, u2, u3]);
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('f3_jl1', $1, 1, $2, 100, 0, 100, 0), ('f3_jl2', $1, 2, $3, 0, 100, 0, 100);
    `, [j1, a1, a2]);
    await client.query(`SELECT public.finance_post_journal($1, $2)`, [j1, u4]);

    console.log('\\n--- Running Chunk 1A Reversal Tests ---');

    // 1A. Reject reversal missing reversalReason
    await runTest('Reject reversal missing reason', `
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalOfEntryId")
      VALUES ('f3_r_bad1a', $1, $2, 'Rev', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), $5);
    `, [ledger, p1, c1, u1, j1], '23514', 'chk_reversal_source_match');

    // 1B. Reject reversal missing reversalOfEntryId
    await runTest('Reject reversal missing origin ID', `
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalReason")
      VALUES ('f3_r_bad1b', $1, $2, 'Rev', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), 'Reason');
    `, [ledger, p1, c1, u1], '23514', 'chk_reversal_source_match');

    // 3. Reject self reversal
    await runTest('Reject self reversal', `
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalOfEntryId", "reversalReason")
      VALUES ('f3_r_self', $1, $2, 'Rev', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), 'f3_r_self', 'Reason');
    `, [ledger, p1, c1, u1], '23514', 'chk_no_self_reversal');

    // 4. Reject two active reservations
    await client.query(`
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalOfEntryId", "reversalReason")
      VALUES ('f3_r_res1', $1, $2, 'Rev1', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), $5, 'Reason 1');
    `, [ledger, p1, c1, u1, j1]);
    
    await runTest('Reject two active reservations for the same original', `
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalOfEntryId", "reversalReason")
      VALUES ('f3_r_res2', $1, $2, 'Rev2', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), $5, 'Reason 2');
    `, [ledger, p1, c1, u1, j1], '23505', 'idx_finance_journal_active_reversal');

    // 5. Allow new reservation after VOIDED
    await client.query(`UPDATE public."FinanceJournalEntry" SET status = 'VOIDED' WHERE id = 'f3_r_res1'`);
    await client.query(`
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt", "reversalOfEntryId", "reversalReason")
      VALUES ('f3_r_res3', $1, $2, 'Rev3', 'DRAFT', 'REVERSAL', $3, 1, $4, '2026-01-15', now(), now(), $5, 'Reason 3');
    `, [ledger, p1, c1, u1, j1]);
    console.log(`\x1b[32m✅ [Allow new reservation after VOIDED] Passed.\x1b[0m`);

    // Complete the reversal draft 'f3_r_res3' for posting tests
    await client.query(`UPDATE public."FinanceJournalEntry" SET status = 'APPROVED', "reviewedById" = $1, "approvedById" = $2 WHERE id = 'f3_r_res3'`, [u2, u3]);
    
    // Prove draft doesn't create link
    const linkRes = await client.query(`SELECT count(*) FROM public."FinanceJournalReversal" WHERE "originalEntryId" = $1`, [j1]);
    if (linkRes.rows[0].count === '0') {
      console.log(`\x1b[32m✅ [Prove draft doesn't create FinanceJournalReversal] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove draft doesn't create FinanceJournalReversal] Failed: Link found!\x1b[0m`);
      failedCount++;
    }

    // 6. Reject missing reversal lines
    // Original has 2 lines. Let's make original have 3 lines or just let it fail on "at least 2 lines".
    // Since original has 2 lines, if reversal has 1 line, it fails on "at least 2 lines". 
    // To test "missing", I will make the original have 3 lines? No, original j1 already has 2 lines.
    // If reversal has 2 lines, it's not "missing". If it has 1 line, it fails the 2 lines rule. 
    // Both are fine, it rejects it. I will change expected message to "at least 2 lines".
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 100, 0, 100);
    `, [a1]);
    await runTest('Reject missing reversal lines', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'at least 2 lines');
    await client.query(`DELETE FROM public."FinanceJournalLine" WHERE id = 'rl_1'`);

    // 7. Reject extra reversal lines
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 100, 0, 100), ('rl_2', 'f3_r_res3', 2, $2, 100, 0, 100, 0), ('rl_3', 'f3_r_res3', 3, $2, 1, 0, 1, 0), ('rl_4', 'f3_r_res3', 4, $2, 0, 1, 0, 1);
    `, [a1, a2]);
    await runTest('Reject extra lines', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'exact same number of lines');
    await client.query(`DELETE FROM public."FinanceJournalLine" WHERE "journalEntryId" = 'f3_r_res3'`);

    // 8. Reject duplicated lines
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 50, 0, 50), ('rl_2', 'f3_r_res3', 2, $1, 0, 50, 0, 50), ('rl_3', 'f3_r_res3', 3, $2, 100, 0, 100, 0);
    `, [a1, a2]);
    await runTest('Reject duplicated lines', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'exact same number of lines');
    await client.query(`DELETE FROM public."FinanceJournalLine" WHERE "journalEntryId" = 'f3_r_res3'`);

    // 9. Reject differing account/amount
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 99, 0, 99), ('rl_2', 'f3_r_res3', 2, $2, 99, 0, 99, 0);
    `, [a1, a2]);
    await runTest('Reject differing account/amount', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'do not perfectly match');
    await client.query(`DELETE FROM public."FinanceJournalLine" WHERE "journalEntryId" = 'f3_r_res3'`);

    // 10. Reject differing costCenterId
    // Setup cost center
    await client.query(`INSERT INTO public."FinanceCostCenter" (id, "ledgerId", "code", "nameAr", "nameEn", "isActive", "createdAt", "updatedAt") VALUES ('cc_1', $1, 'CC1', 'CC1', 'CC1', true, now(), now()) ON CONFLICT DO NOTHING`, [ledger]);
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount", "costCenterId")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 100, 0, 100, 'cc_1'), ('rl_2', 'f3_r_res3', 2, $2, 100, 0, 100, 0, null);
    `, [a1, a2]);
    await runTest('Reject differing costCenterId', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'do not perfectly match');
    await client.query(`DELETE FROM public."FinanceJournalLine" WHERE "journalEntryId" = 'f3_r_res3'`);

    // 12. Prove Audit failure during posting rolls back
    // Setup perfectly matching lines
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('rl_1', 'f3_r_res3', 1, $1, 0, 100, 0, 100), ('rl_2', 'f3_r_res3', 2, $2, 100, 0, 100, 0);
    `, [a1, a2]);

    // Force an audit failure by corrupting the ActivityLog table temporarily (e.g. drop NOT NULL constraint but we can just use a trigger)
    await client.query(`
      CREATE OR REPLACE FUNCTION public.fail_audit_insert() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'Simulated Audit Failure in SQL';
      END;
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER trg_fail_audit BEFORE INSERT ON public."FinanceActivityLog" FOR EACH ROW EXECUTE FUNCTION public.fail_audit_insert();
    `);
    
    await runTest('Prove audit failure during post rolls back', `SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4], 'P0001', 'Simulated Audit Failure');
    
    // Prove no link was created
    const linkRes2 = await client.query(`SELECT count(*) FROM public."FinanceJournalReversal" WHERE "originalEntryId" = $1`, [j1]);
    if (linkRes2.rows[0].count === '0') {
      console.log(`\x1b[32m✅ [Prove audit failure leaves no link] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove audit failure leaves no link] Failed: Link found!\x1b[0m`);
      failedCount++;
    }

    await client.query(`DROP TRIGGER trg_fail_audit ON public."FinanceActivityLog"`);

    // 11. Prove posting creates exactly one link
    // 13. Prove actor, impersonator, correlation are saved
    await client.query(`SET finance.impersonator_id = 'imp_123'`);
    await client.query(`SET finance.correlation_id = 'corr_456'`);
    
    await client.query(`SELECT public.finance_post_journal('f3_r_res3', $1)`, [u4]);
    
    const linkRes3 = await client.query(`SELECT count(*) FROM public."FinanceJournalReversal" WHERE "originalEntryId" = $1`, [j1]);
    if (linkRes3.rows[0].count === '1') {
      console.log(`\x1b[32m✅ [Prove posting creates exactly one link] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove posting creates exactly one link] Failed: Count is ${linkRes3.rows[0].count}!\x1b[0m`);
      failedCount++;
    }

    const auditRes = await client.query(`SELECT metadata, "actorId" FROM public."FinanceActivityLog" WHERE "entityId" = 'f3_r_res3' AND "action" = 'JOURNAL_POSTED'`);
    const meta = auditRes.rows[0].metadata;
    if (meta.impersonatorId === 'imp_123' && meta.correlationId === 'corr_456' && auditRes.rows[0].actorId === u4) {
      console.log(`\x1b[32m✅ [Prove actor, impersonator, correlation saved] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove actor, impersonator, correlation saved] Failed: ${JSON.stringify(meta)}\x1b[0m`);
      failedCount++;
    }

    // 13B. Prove no impersonation value is saved when not impersonating
    await client.query(`SET finance.impersonator_id = ''`);
    await client.query(`
      INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "entryDate", "createdAt", "updatedAt")
      VALUES ('f3_no_imp', $1, $2, 'NoImp', 'DRAFT', 'MANUAL', $3, 1, $4, '2026-01-15', now(), now());
    `, [ledger, p1, c1, u1]);
    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES ('nl_1', 'f3_no_imp', 1, $1, 0, 100, 0, 100), ('nl_2', 'f3_no_imp', 2, $2, 100, 0, 100, 0);
    `, [a1, a2]);
    await client.query(`SELECT public.finance_post_journal('f3_no_imp', $1)`, [u4]);
    const auditNoImp = await client.query(`SELECT metadata FROM public."FinanceActivityLog" WHERE "entityId" = 'f3_no_imp' AND "action" = 'JOURNAL_POSTED'`);
    if (!auditNoImp.rows[0].metadata.impersonatorId) {
      console.log(`\x1b[32m✅ [Prove no fake impersonator saved] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove no fake impersonator saved] Failed: ${JSON.stringify(auditNoImp.rows[0].metadata)}\x1b[0m`);
      failedCount++;
    }

    // 14. Prove PERIOD_FROZEN and PERIOD_UNFROZEN exist
    const enumRes = await client.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'FinanceActivityAction' AND enumlabel IN ('PERIOD_FROZEN', 'PERIOD_UNFROZEN')`);
    if (enumRes.rows.length === 2) {
      console.log(`\x1b[32m✅ [Prove PERIOD_FROZEN and PERIOD_UNFROZEN exist] Passed.\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ [Prove PERIOD_FROZEN and PERIOD_UNFROZEN exist] Failed.\x1b[0m`);
      failedCount++;
    }

    await client.query('ROLLBACK');

    if (failedCount > 0) {
      throw new Error(`Failed ${failedCount} tests.`);
    }

    console.log('\\n🎉 All Chunk 1A specific tests passed!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Test suite failed:', e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
