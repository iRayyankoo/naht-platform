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
    
    console.log('Applying migration inside transaction...');
    const migrationPath = path.join(process.cwd(), 'prisma/migrations/20260714110000_finance_f1_a_foundation/migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);
    console.log('Migration applied successfully.');

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
      ('set_1', $1, $3, 'HALF_UP', $4, now(), now());
    `, [ledger1, ledger2, currency1, userId1]);

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
    await runTest('Missing Settings for Ledger2',
      `INSERT INTO public."FinanceJournalEntry" (id, "ledgerId", "fiscalPeriodId", "description", "status", "currencyId", "exchangeRate", "createdById", "reviewedById", "approvedById", "entryDate", "createdAt", "updatedAt")
       VALUES ('j_bad', $1, $2, 'T', 'APPROVED', $3, 1, $4, $5, $6, '2027-01-15', now(), now());
       INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
       VALUES ('l_bad1', 'j_bad', 1, $7, 10, 0, 10, 0), ('l_bad2', 'j_bad', 2, $7, 0, 10, 0, 10);
       SELECT public.finance_post_journal('j_bad', $8);`,
      [ledger2, p3, currency1, userId1, userId2, userId3, a3, userId4],
      'P0001', 'Finance settings are missing'
    );

    // Cross-ledger tests
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a3]);
    await runTest('Account from different ledger', `SELECT public.finance_post_journal($1, $2)`, [j1, userId4], 'P0001', 'invalid, inactive, or not posting-allowed');
    await client.query(`UPDATE public."FinanceJournalLine" SET "accountId" = $1 WHERE id = 'l1'`, [a1]);

    await client.query(`UPDATE public."FinanceJournalEntry" SET "fiscalPeriodId" = $1 WHERE id = $2`, [p3, j1]);
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
      
      INSERT INTO public."FinanceJournalLine" (id, "journalEntryId", "lineNumber", "accountId", "debitAmount", "creditAmount", "baseDebitAmount", "baseCreditAmount")
      VALUES 
      ('rl1', $1, 1, $8, 0, 100, 0, 375),
      ('rl2', $1, 2, $9, 100, 0, 375, 0);
    `, [r1, ledger1, p1, currency2, userId1, userId2, userId3, a1, a2]);

    await runTest('Link Reversal before posting',
      `INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr1', $1, $2, 'R', $3)`,
      [j1, r1, userId4], 'P0001', 'also be POSTED'
    );
    
    // Post reversal
    await client.query(`SELECT public.finance_post_journal($1, $2)`, [r1, userId4]);
    
    // Test bad linking
    await runTest('Self Reversal',
      `INSERT INTO public."FinanceJournalReversal" (id, "originalEntryId", "reversalEntryId", "reason", "actorId") VALUES ('rr1', $1, $1, 'R', $2)`,
      [j1, userId4], '23514', 'chk_finance_reversal_not_self'
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
    
    console.log('\n✅ All tests passed successfully!');
  } finally {
    console.log('\nRolling back transaction...');
    await client.query('ROLLBACK');
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
