import { Client, DatabaseError } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function isDatabaseError(err: unknown): err is DatabaseError {
  return typeof err === 'object' && err !== null && 'code' in err;
}

async function main() {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL is not set. Aborting to protect Staging.');
  }

  // 1. Strict Host Validations
  const url = new URL(connectionString);
  const host = url.hostname.toLowerCase();

  if (host.includes('supabase') || host.includes('amazonaws') || host.includes('pooler')) {
    throw new Error('Remote host detected. Supabase/AWS/Pooler are permanently forbidden for this script to protect Staging.');
  }

  if (host !== 'localhost' && host !== '127.0.0.1') {
    if (process.env.TEST_ALLOW_EPHEMERAL_DB !== 'true') {
      throw new Error('Database host is not localhost. Set TEST_ALLOW_EPHEMERAL_DB=true to allow other ephemeral test DB hosts.');
    }
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
  } catch (e) {
    console.error('Failed to connect to the isolated database. Make sure your local ephemeral Postgres is running.');
    throw e;
  }

  console.log('Connected to isolated test database. Starting transaction...');

  try {
    await client.query('BEGIN');

    console.log('Schema is assumed to be deployed via prisma migrate deploy.');

    console.log('\n--- Seeding Base Test Data ---');

    const userId1 = 'test_user_creator';
    const userId2 = 'test_user_reviewer';
    const userId3 = 'test_user_approver';
    const userId4 = 'test_user_poster';

    await client.query(`
      INSERT INTO public."User" (id, name, email, role, "isActive", "createdAt", "updatedAt")
      VALUES
      ($1, 'Creator', 'creator@test.com', 'ADMIN', true, now(), now()),
      ($2, 'Reviewer', 'reviewer@test.com', 'ADMIN', true, now(), now()),
      ($3, 'Approver', 'approver@test.com', 'ADMIN', true, now(), now()),
      ($4, 'Poster', 'poster@test.com', 'ADMIN', true, now(), now())
      ON CONFLICT DO NOTHING;
    `, [userId1, userId2, userId3, userId4]);

    const ledger1 = 'ledger_1';
    const ledger2 = 'ledger_2';

    await client.query(`
      INSERT INTO public."FinanceLedger" (id, code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt")
      VALUES
      ($1, 'L1', 'دفتر 1', 'Ledger 1', true, now(), now()),
      ($2, 'L2', 'دفتر 2', 'Ledger 2', true, now(), now());
    `, [ledger1, ledger2]);

    const currency1 = 'SAR';
    const currency2 = 'USD';
    const currency3 = 'EUR';

    await client.query(`
      INSERT INTO public."FinanceCurrency" (id, code, "nameAr", "nameEn", "decimals", "isActive", "createdAt", "updatedAt")
      VALUES
      ($1, 'SAR', 'ريال', 'SAR', 2, true, now(), now()),
      ($2, 'USD', 'دولار', 'USD', 2, true, now(), now()),
      ($3, 'EUR', 'يورو', 'EUR', 2, false, now(), now());
    `, [currency1, currency2, currency3]);

    await client.query(`
      INSERT INTO public."FinanceSettings" (id, "ledgerId", "baseCurrencyId", "roundingPolicy", "updatedById", "createdAt", "updatedAt")
      VALUES
      ('set_1', $1, $2, 'HALF_UP', $3, now(), now());
    `, [ledger1, currency1, userId1]);

    const year1 = 'year_2026';
    const year2 = 'year_2027';

    await client.query(`
      INSERT INTO public."FinanceFiscalYear" (id, "ledgerId", "year", "startDate", "endDate", "createdAt", "updatedAt")
      VALUES
      ($1, $2, 2026, '2026-01-01', '2026-12-31', now(), now()),
      ($3, $2, 2027, '2027-01-01', '2027-12-31', now(), now());
    `, [year1, ledger1, year2]);

    const p1 = 'p_2026_01';
    const p2 = 'p_2026_02';
    const p3 = 'p_2027_01';

    await client.query(`
      INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", "status", "createdAt", "updatedAt")
      VALUES
      ($1, $4, 1, 'Jan 2026', '2026-01-01', '2026-01-31', 'OPEN', now(), now()),
      ($2, $4, 2, 'Feb 2026', '2026-02-01', '2026-02-28', 'OPEN', now(), now()),
      ($3, $5, 1, 'Jan 2027', '2027-01-01', '2027-01-31', 'OPEN', now(), now());
    `, [p1, p2, p3, year1, year2]);

    const cc1 = 'cc_1';
    const cc2 = 'cc_2';

    await client.query(`
      INSERT INTO public."FinanceCostCenter" (id, "ledgerId", "code", "type", "nameAr", "nameEn", "isActive", "createdAt", "updatedAt")
      VALUES
      ($1, $3, 'CC1', 'OTHER', 'C 1', 'CC 1', true, now(), now()),
      ($2, $4, 'CC2', 'OTHER', 'C 2', 'CC 2', true, now(), now());
    `, [cc1, cc2, ledger1, ledger2]);

    const a1 = 'a_1';
    const a2 = 'a_2';
    const a3 = 'a_3';
    const a4 = 'a_4';
    const a5 = 'a_5';

    await client.query(`
      INSERT INTO public."FinanceAccount" (id, "ledgerId", "code", "nameAr", "nameEn", "type", "normalBalance", "isPostingAllowed", "isActive", "createdAt", "updatedAt")
      VALUES
      ($1, $4, '1000', 'A1', 'A1', 'ASSET', 'DEBIT', true, true, now(), now()),
      ($2, $4, '2000', 'A2', 'A2', 'LIABILITY', 'CREDIT', true, true, now(), now()),
      ($3, $5, '3000', 'A3', 'A3', 'ASSET', 'DEBIT', true, true, now(), now()),
      ($6, $4, '4000', 'A4', 'A4', 'ASSET', 'DEBIT', false, true, now(), now()),
      ($7, $4, '5000', 'A5', 'A5', 'ASSET', 'DEBIT', true, false, now(), now());
    `, [a1, a2, a3, ledger1, ledger2, a4, a5]);

    await client.query(`
      INSERT INTO public."FinanceDocumentSequence" (id, "ledgerId", "fiscalYearId", "documentType", "prefix", "nextNumber", "padding", "createdAt", "updatedAt")
      VALUES
      ('seq_26', $1, $2, 'JOURNAL_ENTRY', 'JE26-', 1, 6, now(), now()),
      ('seq_27', $1, $3, 'JOURNAL_ENTRY', 'JE27-', 1, 6, now(), now());
    `, [ledger1, year1, year2]);


    console.log('\n--- Running Negative Tests ---');
    let failedCount = 0;
    let testIndex = 0;

    const runTest = async (name: string, query: string, params: unknown[], expectedErrorCode: string, expectedMessageFragment: string) => {
      testIndex++;
      const spName = `sp_test_${testIndex}`;
      let queryFailed = false;
      try {
        await client.query(`SAVEPOINT ${spName}`);
        await client.query(query, params);
        await client.query(`RELEASE SAVEPOINT ${spName}`);
      } catch (err: unknown) {
        queryFailed = true;
        await client.query(`ROLLBACK TO ${spName}`);

        if (isDatabaseError(err)) {
          const matchCode = expectedErrorCode ? err.code === expectedErrorCode : true;
          const matchMsg = err.message.includes(expectedMessageFragment) || (err.constraint && err.constraint.includes(expectedMessageFragment));

          if (matchCode && matchMsg) {
            console.log(`✅ [${name}] Passed.`);
          } else {
            console.error(`❌ [${name}] Failed: Got code=${err.code} msg="${err.message}". Expected code=${expectedErrorCode} msg="${expectedMessageFragment}"`);
            failedCount++;
          }
        } else {
          console.error(`❌ [${name}] Failed: Unexpected error type`);
          failedCount++;
        }
      }

      if (!queryFailed) {
        console.error(`❌ [${name}] Failed: Expected error ${expectedErrorCode} (${expectedMessageFragment}) but query succeeded.`);
        failedCount++;
      }
    };

    // 1. Period bounds / Overlaps / Shrink
    await runTest('Overlapping Period',
      `INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", "createdAt", "updatedAt")
       VALUES ('bad_overlap', $1, 9, 'Bad', '2026-01-15', '2026-02-15', now(), now())`,
      [year1], '23P01', 'excl_finance_period_overlap'
    );

    await runTest('Period Out of Bounds',
      `INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", "createdAt", "updatedAt")
       VALUES ('bad_bounds', $1, 10, 'Bad', '2025-12-01', '2025-12-31', now(), now())`,
      [year1], 'P0001', 'fall within its fiscal year'
    );

    await runTest('Shrink Year Over Existing Periods',
      `UPDATE public."FinanceFiscalYear" SET "startDate" = '2026-02-01' WHERE "id" = $1`,
      [year1], 'P0001', 'Cannot modify fiscal year dates'
    );

    // 2. Account cycles & Ledgers
    await runTest('Self Cycle',
      `UPDATE public."FinanceAccount" SET "parentId" = $1 WHERE "id" = $1`,
      [a1], 'P0001', 'own parent'
    );

    await client.query(`INSERT INTO public."FinanceAccount" (id, "ledgerId", "code", "nameAr", "nameEn", "type", "normalBalance", "parentId", "createdAt", "updatedAt")
       VALUES ('a_mid', $1, '1001', 'M', 'M', 'ASSET', 'DEBIT', $2, now(), now())`, [ledger1, a1]);

    await runTest('Indirect Cycle',
      `UPDATE public."FinanceAccount" SET "parentId" = 'a_mid' WHERE "id" = $1`,
      [a1], 'P0001', 'loop detected'
    );

    await runTest('Parent from different ledger',
      `UPDATE public."FinanceAccount" SET "parentId" = $1 WHERE "id" = $2`,
      [a3, a1], 'P0001', 'same ledger'
    );

    // 3. Journal Constraints
    const j1 = 'journal_1';
    await client.query(`
      INSERT INTO public."FinanceJournalEntry"
      (id, "ledgerId", "fiscalPeriodId", "description", "status", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
      VALUES
      ($1, $2, $3, 'Test', 'APPROVED', $4, 1, $5, $6, $7, '2026-01-15', now(), now());
    `, [j1, ledger1, p1, currency1, userId1, userId2, userId3]);

    await runTest('Unbalanced Journal',
      `SELECT public.finance_post_journal($1, $2)`,
      [j1, userId4], 'P0001', 'must have at least 2 lines'
    );

    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES
      ('l1', $1, 1, $2, 100, 0, 100, 0),
      ('l2', $1, 2, $3, 0, 90, 0, 90);
    `, [j1, a1, a2]);

    await runTest('Unbalanced Amounts',
      `SELECT public.finance_post_journal($1, $2)`,
      [j1, userId4], 'P0001', 'not balanced (transaction currency)'
    );

    await client.query(`UPDATE public."FinanceJournalLine" SET "creditAmount" = 100, "baseCreditAmount" = 100 WHERE id = 'l2'`);

    // SoD testing
    await runTest('SoD: Poster = Creator', `SELECT public.finance_post_journal($1, $2)`, [j1, userId1], 'P0001', 'Separation of Duties violated');
    await runTest('SoD: Poster = Reviewer', `SELECT public.finance_post_journal($1, $2)`, [j1, userId2], 'P0001', 'Separation of Duties violated');
    await runTest('SoD: Poster = Approver', `SELECT public.finance_post_journal($1, $2)`, [j1, userId3], 'P0001', 'Separation of Duties violated');

    // Missing settings / Inactive Ledger
    await client.query(`
       INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
       VALUES ('j_bad', $1, $2, 'T', 'APPROVED', 'MANUAL', $3, 1, $4, $5, $6, '2027-01-15', now(), now());
    `, [ledger2, p3, currency1, userId1, userId2, userId3]);

    await client.query(`
       INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
       VALUES ('l_bad1', 'j_bad', 1, $1, 10, 0, 10, 0), ('l_bad2', 'j_bad', 2, $1, 0, 10, 0, 10);
    `, [a3]);

    await runTest('Missing Settings for Ledger2',
      `SELECT public.finance_post_journal('j_bad', $1);`,
      [userId4],
      'P0001', 'Finance settings are missing'
    );

    // Cross-ledger tests
    const yearL2 = 'year_l2';
    const pL2 = 'p_l2_01';
    await client.query(`
      INSERT INTO public."FinanceFiscalYear" (id, "ledgerId", "year", "startDate", "endDate", "createdAt", "updatedAt")
      VALUES ($1, $2, 2026, '2026-01-01', '2026-12-31', now(), now());
    `, [yearL2, ledger2]);
    await client.query(`
      INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, 1, 'Jan', '2026-01-01', '2026-01-31', 'OPEN', now(), now());
    `, [pL2, yearL2]);

    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a3]);
    await runTest('Account from different ledger', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'invalid, inactive, or not posting-allowed');
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a1]);

    await client.query(`UPDATE public."FinanceJournalEntry" SET "fiscalPeriodId" = $1 WHERE id = $2`, [pL2, j1]);
    await runTest('Period from different ledger', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'does not belong to the journal ledger');
    await client.query(`UPDATE public."FinanceJournalEntry" SET "fiscalPeriodId" = $1 WHERE id = $2`, [p1, j1]);

    // Account Rules
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a4]);
    await runTest('Non-postable account', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'invalid, inactive, or not posting-allowed');
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a5]);
    await runTest('Inactive account', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'invalid, inactive, or not posting-allowed');
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a1]);

    // Currency and Ex Rate
    await client.query(`UPDATE public."FinanceJournalEntry" SET "currencyId" = $1 WHERE id = $2`, [currency3, j1]);
    await runTest('Inactive Currency', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'currency is not active');

    await client.query(`UPDATE public."FinanceJournalEntry" SET "currencyId" = $1, "exchangeRate" = 1.5 WHERE id = $2`, [currency1, j1]);
    await runTest('Base currency wrong rate', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'Exchange rate must be 1');

    await client.query(`UPDATE public."FinanceJournalEntry" SET "currencyId" = $1, "exchangeRate" = 3.75 WHERE id = $2`, [currency2, j1]);
    // 100 * 3.75 = 375
    await client.query(`UPDATE public."FinanceJournalLine" SET "baseDebitAmount" = 375 WHERE id = 'l1'`);
    await client.query(`UPDATE public."FinanceJournalLine" SET "baseCreditAmount" = 375 WHERE id = 'l2'`);
    // correct conversion test implicitly passes below

    await client.query(`UPDATE public."FinanceJournalLine" SET "baseCreditAmount" = 370 WHERE id = 'l2'`);
    await runTest('Bad base amounts despite total match (wait, total is now unbalanced) -> base conversion mismatch',
      `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'balanced (base currency)');

    await client.query(`UPDATE public."FinanceJournalLine" SET "baseDebitAmount" = 370 WHERE id = 'l1'`);
    await runTest('Bad conversion per line but balanced',
      `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'incorrect base amount conversions');

    await client.query(`UPDATE public."FinanceJournalLine" SET "baseDebitAmount" = 375 WHERE id = 'l1'`);
    await client.query(`UPDATE public."FinanceJournalLine" SET "baseCreditAmount" = 375 WHERE id = 'l2'`);

    // Post it!
    await client.query(`SELECT public.finance_post_journal($1, $2)`, [j1, userId4]);

    // Immutable checks
    await runTest('Delete POSTED journal', `DELETE FROM public."FinanceJournalEntry" WHERE "id" = $1`, [j1], 'P0001', 'Cannot delete');
    await runTest('Update POSTED journal', `UPDATE public."FinanceJournalEntry" SET description = 'x' WHERE "id" = $1`, [j1], 'P0001', 'Cannot modify');
    await runTest('Delete POSTED line', `DELETE FROM public."FinanceJournalLine" WHERE "id" = 'l1'`, [], 'P0001', 'Cannot insert, update, or delete lines');
    await runTest('ActivityLog Immutable', `DELETE FROM public."FinanceActivityLog"`, [], 'P0001', 'immutable');

    // Reversal checks
    const r1 = 'rev_1';
    await client.query(`
      INSERT INTO public."FinanceJournalEntry"
      (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
      VALUES
      ($1, $2, $3, 'Rev', 'APPROVED', 'REVERSAL', $4, 3.75, $5, $6, $7, '2026-01-20', now(), now());
    `, [r1, ledger1, p1, currency2, userId1, userId2, userId3]);

    await client.query(`
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES
      ('rl1', $1, 1, $2, 0, 100, 0, 375),
      ('rl2', $1, 2, $3, 100, 0, 375, 0);
    `, [r1, a1, a2]);

    await runTest('Link Reversal before posting',
      `INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr1', $1, $2, 'R', $3)`,
      [j1, r1, userId4], 'P0001', 'also be POSTED'
    );

    // Post reversal
    await client.query(`SELECT public.finance_post_journal($1, $2)`, [r1, userId4]);

    // Test bad linking (bypassing trigger with zero-balance to hit CHECK constraint)
    await client.query(`
       INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "sourceModule", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
       VALUES ('r_zero', $1, $2, 'Zero', 'APPROVED', 'REVERSAL', $3, 1, $4, $5, $6, '2026-01-20', now(), now());
    `, [ledger1, p1, currency1, userId1, userId2, userId3]);

    await client.query(`
       INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
       VALUES
       ('rz1', 'r_zero', 1, $1, 100, 0, 100, 0),
       ('rz2', 'r_zero', 2, $1, 0, 100, 0, 100),
       ('rz3', 'r_zero', 3, $2, 50, 0, 50, 0),
       ('rz4', 'r_zero', 4, $2, 0, 50, 0, 50);
    `, [a1, a2]);

    await client.query(`SELECT public.finance_post_journal('r_zero', $1)`, [userId4]);

    await runTest('Self Reversal (Check Constraint)',
      `INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr_zero', 'r_zero', 'r_zero', 'R', $1)`,
      [userId4], '23514', 'chk_finance_reversal_not_self'
    );


    // Link Reversal correctly
    await client.query(`INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr1', $1, $2, 'R', $3)`, [j1, r1, userId4]);

    await runTest('Double Reversal',
      `INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr2', $1, $2, 'R2', $3)`,
      [j1, r1, userId4], '23505', 'FinanceJournalReversal_originalEntryId_key'
    );

    if (failedCount > 0) {
      throw new Error(`${failedCount} test(s) failed.`);
    }
  } finally {
    console.log('\nRolling back sequential test transaction...');
    await client.query('ROLLBACK');
  }

  console.log('\n--- Running Concurrency Tests ---');
  try {
    // Insert base data for concurrency test and commit it
    await client.query('BEGIN');
    const ledger = 'cl1';
    const curr = 'curr1';
    const u1 = 'cu1';
    const u2 = 'cu2';
    const u3 = 'cu3';
    const u4 = 'cu4';
    const a1 = 'ca1';
    const a2 = 'ca2';
    const p1 = 'cp1';

    try {
      await client.query(`INSERT INTO public."User" (id, name, email, "updatedAt") VALUES ($1, 'U1', 'u1@o1.com', now()), ($2, 'U2', 'u2@o1.com', now()), ($3, 'U3', 'u3@o1.com', now()), ($4, 'U4', 'u4@o1.com', now())`, [u1, u2, u3, u4]);
      await client.query(`INSERT INTO public."FinanceLedger" (id, code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt") VALUES ($1, 'L', 'L', 'L', true, now(), now())`, [ledger]);
      await client.query(`INSERT INTO public."FinanceCurrency" (id, code, "nameAr", "nameEn", "decimals", "isActive", "createdAt", "updatedAt") VALUES ($1, 'SAR', 'R', 'S', 2, true, now(), now())`, [curr]);
      await client.query(`INSERT INTO public."FinanceSettings" (id, "ledgerId", "baseCurrencyId", "roundingPolicy", "updatedById", "createdAt", "updatedAt") VALUES ('cset', $1, $2, 'HALF_EVEN', $3, now(), now())`, [ledger, curr, u1]);
      await client.query(`INSERT INTO public."FinanceAccount" (id, "ledgerId", code, "nameAr", "nameEn", type, "normalBalance", "isActive", "createdAt", "updatedAt") VALUES ($1, $3, '100', 'A', 'A', 'ASSET', 'DEBIT', true, now(), now()), ($2, $3, '200', 'B', 'B', 'LIABILITY', 'CREDIT', true, now(), now())`, [a1, a2, ledger]);
      await client.query(`INSERT INTO public."FinanceFiscalYear" (id, "ledgerId", year, "startDate", "endDate", "createdAt", "updatedAt") VALUES ('cyear', $1, 2026, '2026-01-01', '2026-12-31', now(), now())`, [ledger]);
      await client.query(`INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", status, "createdAt", "updatedAt") VALUES ($1, 'cyear', 1, 'P1', '2026-01-01', '2026-01-31', 'OPEN', now(), now())`, [p1]);
      await client.query(`INSERT INTO public."FinanceDocumentSequence" (id, "ledgerId", "fiscalYearId", "documentType", prefix, "nextNumber", padding, "createdAt", "updatedAt") VALUES ('cseq', $1, 'cyear', 'JOURNAL_ENTRY', 'J-', 1, 6, now(), now())`, [ledger]);
    } catch (err) {
      console.error("Setup failed:", err);
      throw err;
    }


    const j1 = 'cj1';
    const j2 = 'cj2';
    await client.query(`INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", description, status, "sourceModule", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt") VALUES ($1, $3, $4, 'C1', 'APPROVED', 'MANUAL', $5, 1, $6, $7, $8, '2026-01-15', now(), now()), ($2, $3, $4, 'C2', 'APPROVED', 'MANUAL', $5, 1, $6, $7, $8, '2026-01-15', now(), now())`, [j1, j2, ledger, p1, curr, u1, u2, u3]);
    await client.query(`INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount") VALUES ('cl1', $1, 1, $3, 10, 0, 10, 0), ('cl2', $1, 2, $4, 0, 10, 0, 10), ('cl3', $2, 1, $3, 20, 0, 20, 0), ('cl4', $2, 2, $4, 0, 20, 0, 20)`, [j1, j2, a1, a2]);
    await client.query('COMMIT');

    const clientA = new Client({ connectionString });
    const clientB = new Client({ connectionString });
    await clientA.connect();
    await clientB.connect();

    try {
      console.log('Posting two journals concurrently...');
      const results = await Promise.allSettled([
        clientA.query(`SELECT public.finance_post_journal($1, $2)`, [j1, u4]),
        clientB.query(`SELECT public.finance_post_journal($1, $2)`, [j2, u4])
      ]);

      const { rows } = await client.query(`SELECT id, "entryNumber" FROM public."FinanceJournalEntry" WHERE id IN ($1, $2) ORDER BY "entryNumber" ASC`, [j1, j2]);
      if (rows.length < 2 || rows[0].entryNumber !== 'J-000001' || rows[1].entryNumber !== 'J-000002') {
        throw new Error('Concurrency failure: entry numbers are not exactly J-000001 and J-000002!');
      } else {
        console.log('✅ [Concurrency: Posting] Passed. Entry numbers are exactly J-000001 and J-000002.');
      }

      console.log('Inserting two overlapping fiscal periods concurrently...');
      const periodResults = await Promise.allSettled([
        clientA.query(`INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", status, "createdAt", "updatedAt") VALUES ('p2a', 'cyear', 2, 'P2A', '2026-02-01', '2026-02-28', 'OPEN', now(), now())`),
        clientB.query(`INSERT INTO public."FinanceFiscalPeriod" (id, "fiscalYearId", "periodNumber", "periodName", "startDate", "endDate", status, "createdAt", "updatedAt") VALUES ('p2b', 'cyear', 3, 'P2B', '2026-02-15', '2026-03-15', 'OPEN', now(), now())`)
      ]);
      const fulfilledPeriods = periodResults.filter(r => r.status === 'fulfilled');
      if (fulfilledPeriods.length !== 1) {
        throw new Error(`Concurrency failure: overlapping periods allowed or both failed! Fulfilled count: ${fulfilledPeriods.length}`);
      }
      console.log('✅ [Concurrency: Periods] Passed. Overlap prevented.');

      console.log('Creating an account cycle concurrently...');
      await client.query(`INSERT INTO public."FinanceAccount" (id, "ledgerId", code, "nameAr", "nameEn", type, "normalBalance", "isActive", "createdAt", "updatedAt") VALUES ('caA', $1, '900', 'A', 'A', 'ASSET', 'DEBIT', true, now(), now()), ('caB', $1, '901', 'B', 'B', 'ASSET', 'DEBIT', true, now(), now())`, [ledger]);
      const cycleResults = await Promise.allSettled([
        clientA.query(`UPDATE public."FinanceAccount" SET "parentId" = 'caB' WHERE id = 'caA'`),
        clientB.query(`UPDATE public."FinanceAccount" SET "parentId" = 'caA' WHERE id = 'caB'`)
      ]);
      const fulfilledCycles = cycleResults.filter(r => r.status === 'fulfilled');
      if (fulfilledCycles.length === 2) {
        throw new Error('Concurrency failure: Account hierarchy write skew allowed a cycle!');
      }
      console.log('✅ [Concurrency: Account Cycle] Passed. Cycle prevented.');

      console.log('\n✅ All tests passed successfully!');
    } finally {
      await clientA.end();
      await clientB.end();
    }
  } finally {
    console.log('Cleaning up concurrency test data...');
    await client.query(`
      TRUNCATE public."FinanceJournalReversal", public."FinanceJournalLine", public."FinanceJournalEntry", public."FinanceFiscalPeriod", public."FinanceFiscalYear", public."FinanceSettings", public."FinanceAccount", public."FinanceCurrency", public."FinanceLedger", public."User" CASCADE;
    `);
    await client.end();
  }
}


main().catch((e) => {
  console.error(e);
  process.exit(1);
});
