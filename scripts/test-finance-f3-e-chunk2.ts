import { PrismaClient } from "@prisma/client";

import {
  handleCreateDraftWithLines,
  handleSubmitForReview,
  handleListAccounts,
  handleListCostCenters,
  handleListOpenPeriods,
  handleListLedgers,
  handleListCurrencies,
} from "../src/actions/finance/finance-handlers";
import { SessionDependencies } from "../src/actions/finance/finance-action-utils";
import { FinanceJournalEntryDTO, FinanceAccountReferenceDTO, FinancePeriodReferenceDTO, FinanceCostCenterReferenceDTO } from "../src/actions/finance/finance-dtos";
import * as crypto from "crypto";
import { fork } from "child_process";

const prisma = new PrismaClient();

let superAdminId: string;
let sessionDeps: SessionDependencies;

function assertError(res: { ok: boolean, error?: { message: string } }): string {
  if (res.ok || !res.error) throw new Error("Expected error, got success");
  return res.error.message;
}

function assertSuccess<T>(res: { ok: boolean, error?: { message: string }, data?: T }): T {
  if (!res.ok || !res.data) throw new Error(res.error?.message || "Unknown error");
  return res.data;
}

if (process.env.CHILD_MODE) {
  (async () => {
    try {
      const actorId = process.env.ACTOR_ID!;
      const sDeps: SessionDependencies = {
        getCurrentUser: async () => ({ id: actorId, isActive: true }),
        getImpersonationRuntimeContext: async () => null
      };
      
      if (process.env.CHILD_MODE === "CREATE") {
        const payload = JSON.parse(process.env.CREATE_PAYLOAD!);
        await handleCreateDraftWithLines(payload, sDeps);
      } else if (process.env.CHILD_MODE === "FREEZE") {
        const { PeriodService: ImportedPeriodService } = await import("../src/services/finance/period-service");
        await ImportedPeriodService.freezePeriod({ actorId, correlationId: "123" }, process.env.PERIOD_ID!);
      }
      process.exit(0);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  })();
}

async function runTests() {
  console.log("=== Finance Chunk 2A Integration Tests ===");

  superAdminId = crypto.randomUUID();
  sessionDeps = {
    getCurrentUser: async () => ({ id: superAdminId, isActive: true }),
    getImpersonationRuntimeContext: async () => null
  };

  console.log("\n[Setup] Cleaning previous test data...");
  await prisma.financeJournalLine.deleteMany({ where: { journalEntry: { description: { startsWith: "[Test]" } } } });
  await prisma.financeJournalEntry.deleteMany({ where: { description: { startsWith: "[Test]" } } });

  console.log("[Setup] Ensuring base data exists...");
  
  let admin = await prisma.user.findUnique({ where: { id: superAdminId } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: superAdminId,
        email: "test_admin_" + Date.now() + "@example.com",
        name: "Test Admin",
        isActive: true,
      }
    });
  }

  let saRole = await prisma.appRole.findFirst({ where: { code: "SUPER_ADMIN" } });
  if (!saRole) {
    saRole = await prisma.appRole.create({
      data: { code: "SUPER_ADMIN", name: "Super Admin", isActive: true }
    });
  }

  const userRole = await prisma.userRole.findFirst({ where: { userId: superAdminId, roleId: saRole.id } });
  if (!userRole) {
    await prisma.userRole.create({
      data: { userId: superAdminId, roleId: saRole.id }
    });
  }

  let currencySAR = await prisma.financeCurrency.findUnique({ where: { code: "SAR" } });
  if (!currencySAR) currencySAR = await prisma.financeCurrency.create({ data: { code: "SAR", nameAr: "SAR", nameEn: "SAR", decimals: 2 } });
  
  let currencyUSD = await prisma.financeCurrency.findUnique({ where: { code: "USD" } });
  if (!currencyUSD) currencyUSD = await prisma.financeCurrency.create({ data: { code: "USD", nameAr: "USD", nameEn: "USD", decimals: 2 } });

  let ledger1 = await prisma.financeLedger.findFirst({ where: { code: "L1_TEST" } });
  if (!ledger1) ledger1 = await prisma.financeLedger.create({ data: { code: "L1_TEST", nameAr: "Ledger 1", nameEn: "Ledger 1", settings: { create: { baseCurrencyId: currencySAR.id, updatedById: superAdminId } } } });

  let ledger2 = await prisma.financeLedger.findFirst({ where: { code: "L2_TEST" } });
  if (!ledger2) ledger2 = await prisma.financeLedger.create({ data: { code: "L2_TEST", nameAr: "Ledger 2", nameEn: "Ledger 2", settings: { create: { baseCurrencyId: currencySAR.id, updatedById: superAdminId } } } });

  let fy1 = await prisma.financeFiscalYear.findFirst({ where: { ledgerId: ledger1.id, year: 2026 } });
  if (!fy1) fy1 = await prisma.financeFiscalYear.create({ data: { ledgerId: ledger1.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") } });
  
  let p1 = await prisma.financeFiscalPeriod.findFirst({ where: { fiscalYearId: fy1.id, periodName: "P1_TEST" } });
  if (!p1) p1 = await prisma.financeFiscalPeriod.create({ data: { fiscalYearId: fy1.id, periodName: "P1_TEST", periodNumber: 1, startDate: new Date("2026-01-01"), endDate: new Date("2026-01-31"), status: "OPEN" } });
  if (p1.status !== "OPEN") p1 = await prisma.financeFiscalPeriod.update({ where: { id: p1.id }, data: { status: "OPEN" } });

  let p1_2 = await prisma.financeFiscalPeriod.findFirst({ where: { fiscalYearId: fy1.id, periodName: "P2_TEST" } });
  if (!p1_2) p1_2 = await prisma.financeFiscalPeriod.create({ data: { fiscalYearId: fy1.id, periodName: "P2_TEST", periodNumber: 2, startDate: new Date("2026-02-01"), endDate: new Date("2026-02-28"), status: "OPEN" } });
  if (p1_2.status !== "OPEN") p1_2 = await prisma.financeFiscalPeriod.update({ where: { id: p1_2.id }, data: { status: "OPEN" } });


  let fy2 = await prisma.financeFiscalYear.findFirst({ where: { ledgerId: ledger2.id, year: 2026 } });
  if (!fy2) fy2 = await prisma.financeFiscalYear.create({ data: { ledgerId: ledger2.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") } });
  
  let p2 = await prisma.financeFiscalPeriod.findFirst({ where: { fiscalYearId: fy2.id, periodName: "P1_TEST" } });
  if (!p2) p2 = await prisma.financeFiscalPeriod.create({ data: { fiscalYearId: fy2.id, periodName: "P1_TEST", periodNumber: 1, startDate: new Date("2026-01-01"), endDate: new Date("2026-01-31"), status: "OPEN" } });

  let acc1_l1 = await prisma.financeAccount.findFirst({ where: { ledgerId: ledger1.id, code: "1001_TEST" } });
  if (!acc1_l1) acc1_l1 = await prisma.financeAccount.create({ data: { ledgerId: ledger1.id, code: "1001_TEST", nameAr: "Acc 1 L1", nameEn: "Acc 1 L1", type: "ASSET", normalBalance: "DEBIT", isPostingAllowed: true } });

  let acc2_l1 = await prisma.financeAccount.findFirst({ where: { ledgerId: ledger1.id, code: "1002_TEST" } });
  if (!acc2_l1) acc2_l1 = await prisma.financeAccount.create({ data: { ledgerId: ledger1.id, code: "1002_TEST", nameAr: "Acc 2 L1", nameEn: "Acc 2 L1", type: "LIABILITY", normalBalance: "CREDIT", isPostingAllowed: true } });

  let acc1_l2 = await prisma.financeAccount.findFirst({ where: { ledgerId: ledger2.id, code: "1001_TEST" } });
  if (!acc1_l2) acc1_l2 = await prisma.financeAccount.create({ data: { ledgerId: ledger2.id, code: "1001_TEST", nameAr: "Acc 1 L2", nameEn: "Acc 1 L2", type: "ASSET", normalBalance: "DEBIT", isPostingAllowed: true } });

  let cc1_l1 = await prisma.financeCostCenter.findFirst({ where: { code: "CC1_TEST" } });
  if (!cc1_l1) cc1_l1 = await prisma.financeCostCenter.create({ data: { code: "CC1_TEST", nameAr: "Cost Center 1", nameEn: "Cost Center 1", type: "OTHER", isActive: true, ledgerId: ledger1.id } });

  let cc2_l1 = await prisma.financeCostCenter.findFirst({ where: { code: "CC2_TEST" } });
  if (!cc2_l1) cc2_l1 = await prisma.financeCostCenter.create({ data: { code: "CC2_TEST", nameAr: "Cost Center 2", nameEn: "Cost Center 2", type: "OTHER", isActive: true, ledgerId: ledger1.id } });

  let cc1_l2 = await prisma.financeCostCenter.findFirst({ where: { code: "CC1_L2_TEST" } });
  if (!cc1_l2) cc1_l2 = await prisma.financeCostCenter.create({ data: { code: "CC1_L2_TEST", nameAr: "Cost Center L2", nameEn: "Cost Center L2", type: "OTHER", isActive: true, ledgerId: ledger2.id } });

  console.log("[Setup] Completed successfully.\n");

  const runCase = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
    } catch (e: unknown) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(e instanceof Error ? e.message : String(e));
      throw e;
    }
  };

  await runCase("1. Valid Draft Creation", async () => {
    const res = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      description: "[Test] Valid draft",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "100", costCenterId: cc1_l1!.id },
        { accountId: acc2_l1!.id, creditAmount: "100" }
      ]
    }, sessionDeps);
    assertSuccess(res);
  });

  await runCase("2. Cross-ledger Account Violation", async () => {
    const res = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      description: "[Test] Cross ledger account",
      lines: [
        { accountId: acc1_l2!.id, debitAmount: "100" }, // from ledger 2
        { accountId: acc2_l1!.id, creditAmount: "100" }
      ]
    }, sessionDeps);
    const msg = assertError(res);
    if (!msg.includes("does not belong to the selected ledger")) {
      throw new Error("Failed to reject cross-ledger account: " + msg);
    }
  });

  await runCase("3. Cross-ledger Cost Center Violation", async () => {
    const res = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      description: "[Test] Cross ledger cost center",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "100", costCenterId: cc1_l2!.id }, // CC from ledger 2
        { accountId: acc2_l1!.id, creditAmount: "100" }
      ]
    }, sessionDeps);
    const msg = assertError(res);
    if (!msg.includes("Cost Center does not belong to the selected ledger")) {
      throw new Error("Failed to reject cross-ledger cost center: " + msg);
    }
  });

  await runCase("4. Date bounds Violation", async () => {
    const res = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-02-15T12:00:00Z", // P1 is January
      currencyId: currencySAR!.id,
      description: "[Test] Date bounds",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "100" },
        { accountId: acc2_l1!.id, creditAmount: "100" }
      ]
    }, sessionDeps);
    const msg = assertError(res);
    if (!msg.includes("outside the fiscal period bounds")) {
      throw new Error("Failed to reject date bounds: " + msg);
    }
  });

  await runCase("5. Idempotency Parallel Execution", async () => {
    const key = crypto.randomUUID();
    const payload = {
      idempotencyKey: key,
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      description: "[Test] Idempotency",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "10" },
        { accountId: acc2_l1!.id, creditAmount: "10" }
      ]
    };

    const results = await Promise.all([
      handleCreateDraftWithLines(payload, sessionDeps),
      handleCreateDraftWithLines(payload, sessionDeps)
    ]);
    const successes = results.filter(r => r.ok);
    const conflicts = results.filter(r => !r.ok && (r as unknown as { error?: { code: string } }).error?.code === "F_IDEMPOTENCY_CONFLICT");
    
    if (successes.length !== 1 || conflicts.length !== 1) {
      throw new Error(`Idempotency failed. Successes: ${successes.length}, Conflicts: ${conflicts.length}`);
    }
  });

  await runCase("6. Foreign Currency Enforcement", async () => {
    // USD without rate
    const res1 = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencyUSD!.id,
      description: "[Test] USD without rate",
      lines: [{ accountId: acc1_l1!.id, debitAmount: "10" }, { accountId: acc2_l1!.id, creditAmount: "10" }]
    }, sessionDeps);
    const msg1 = assertError(res1);
    if (!msg1.includes("must be explicitly provided")) {
      throw new Error("Failed to require USD exchange rate: " + msg1);
    }

    // SAR with rate > 1
    const res2 = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      exchangeRate: "1.5",
      description: "[Test] SAR with rate 1.5",
      lines: [{ accountId: acc1_l1!.id, debitAmount: "10" }, { accountId: acc2_l1!.id, creditAmount: "10" }]
    }, sessionDeps);
    const msg2 = assertError(res2);
    if (!msg2.includes("Base currency exchange rate must be exactly 1")) {
      throw new Error("Failed to enforce base currency rate 1: " + msg2);
    }
  });

  await runCase("7. Unbalanced Entry Workflow (Save DRAFT, Reject Submit)", async () => {
    const draftRes = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencySAR!.id,
      description: "[Test] Unbalanced Draft",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "100" },
        { accountId: acc2_l1!.id, creditAmount: "50" } // unbalanced
      ]
    }, sessionDeps);
    
    const draftData = assertSuccess<FinanceJournalEntryDTO>(draftRes);
    if (draftData.status !== "DRAFT") throw new Error("Status is not DRAFT");

    const submitRes = await handleSubmitForReview({ id: draftData.id }, sessionDeps);
    const submitMsg = assertError(submitRes);
    if (!submitMsg.includes("Journal is not balanced")) {
      throw new Error("Unbalanced entry was not rejected correctly: " + submitMsg);
    }

    const verify = await prisma.financeJournalEntry.findUnique({ where: { id: draftData.id } });
    if (verify?.status !== "DRAFT") throw new Error("Status changed despite submission failure!");
  });

  await runCase("8. Decimal(19,4) Precision and tie rounding", async () => {
    const draftRes2 = await handleCreateDraftWithLines({
      idempotencyKey: crypto.randomUUID(),
      ledgerId: ledger1!.id,
      fiscalPeriodId: p1!.id,
      entryDate: "2026-01-15T12:00:00Z",
      currencyId: currencyUSD!.id,
      exchangeRate: "1.23455",
      description: "[Test] Decimal rounding 1",
      lines: [
        { accountId: acc1_l1!.id, debitAmount: "1" },
        { accountId: acc2_l1!.id, creditAmount: "1" }
      ]
    }, sessionDeps);
    const draftData2 = assertSuccess<FinanceJournalEntryDTO>(draftRes2);

    const dbLine = await prisma.financeJournalLine.findFirst({ where: { journalEntryId: draftData2.id, debitAmount: { gt: 0 } } });
    if (dbLine!.baseDebitAmount.toString() !== "1.2346") {
      throw new Error(`Rounding failed. Expected 1.2346, got ${dbLine!.baseDebitAmount.toString()}`);
    }
  });

  await runCase("09. Check Action Return Types, Pagination & Filtering", async () => {
    // 1. Account List with pagination & search
    const listRes = await handleListAccounts({ ledgerId: ledger1!.id, search: "Acc 1", skip: 0, take: 1 }, sessionDeps);
    const listData = assertSuccess<{ items: FinanceAccountReferenceDTO[]; total: number }>(listRes as unknown as { ok: boolean; error?: { message: string }; data?: { items: FinanceAccountReferenceDTO[]; total: number } });
    if (listData.items.length !== 1 || listData.total < 1) throw new Error("Account filtering/pagination failed");
    if (!listData.items[0].nameEn.includes("Acc 1")) throw new Error("Account search content failed");

    // 2. Cost Centers List with pagination & search
    const ccRes = await handleListCostCenters({ ledgerId: ledger1!.id, search: "Cost Center 2", skip: 0, take: 5 }, sessionDeps);
    const ccData = assertSuccess<{ items: FinanceCostCenterReferenceDTO[]; total: number }>(ccRes as unknown as { ok: boolean; error?: { message: string }; data?: { items: FinanceCostCenterReferenceDTO[]; total: number } });
    if (ccData.items.length !== 1 || ccData.total < 1) throw new Error("Cost Center filtering failed");
    if (!ccData.items[0].nameEn.includes("Cost Center 2")) throw new Error("Cost Center content failed");

    // 3. Open Periods List
    const periodsRes = await handleListOpenPeriods({ ledgerId: ledger1!.id, skip: 0, take: 10 }, sessionDeps);
    const periodsData = assertSuccess<{ items: FinancePeriodReferenceDTO[]; total: number }>(periodsRes as unknown as { ok: boolean; error?: { message: string }; data?: { items: FinancePeriodReferenceDTO[]; total: number } });
    if (periodsData.total === 0) throw new Error("Failed listOpenPeriods");
    if (!periodsData.items[0].periodName) throw new Error("Period content failed");

    // 4. Ledgers List
    const ledgersRes = await handleListLedgers({ search: "Ledger", skip: 0, take: 10 }, sessionDeps);
    const ledgersData = assertSuccess<{ items: { id: string; nameEn: string }[]; total: number }>(ledgersRes as unknown as { ok: boolean; error?: { message: string }; data?: { items: { id: string; nameEn: string }[]; total: number } });
    if (ledgersData.total < 2) throw new Error("Failed listLedgers");

    // 5. Currencies List
    const curRes = await handleListCurrencies({ search: "SAR", skip: 0, take: 10 }, sessionDeps);
    const curData = assertSuccess<{ items: { id: string; nameEn: string; code: string }[]; total: number }>(curRes as unknown as { ok: boolean; error?: { message: string }; data?: { items: { id: string; nameEn: string; code: string }[]; total: number } });
    if (curData.total < 1 || !curData.items[0].code.includes("SAR")) throw new Error("Failed listCurrencies");
  });

  await runCase("10. Atomic Rollback Check (Fail after inserts via DB Trigger)", async () => {
    // We create a temporary BEFORE INSERT trigger on FinanceActivityLog
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_audit_fail_func() RETURNS trigger AS $$
      BEGIN
        IF NEW."action"::text = 'JOURNAL_CREATED' AND EXISTS (SELECT 1 FROM "FinanceJournalEntry" WHERE "id" = NEW."entityId" AND "description" = '[Test] Atomic Rollback DB') THEN
          RAISE EXCEPTION 'Simulated Audit Failure for Rollback Test';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER test_audit_fail_trg
      BEFORE INSERT ON "FinanceActivityLog"
      FOR EACH ROW EXECUTE FUNCTION test_audit_fail_func();
    `);

    try {
      const res = await handleCreateDraftWithLines({
        idempotencyKey: "ROLLBACK_TEST_10",
        ledgerId: ledger1!.id,
        fiscalPeriodId: p1!.id,
        entryDate: "2026-01-15T12:00:00Z",
        currencyId: currencySAR!.id,
        description: "[Test] Atomic Rollback DB",
        lines: [
          { accountId: acc1_l1!.id, debitAmount: "100" },
          { accountId: acc2_l1!.id, creditAmount: "100" } 
        ]
      }, sessionDeps);

      assertError(res);
      
      const lingering = await prisma.financeJournalEntry.findFirst({ where: { description: "[Test] Atomic Rollback DB" } });
      if (lingering) throw new Error("Header was saved despite DB trigger failure! Rollback failed.");
    } finally {
      await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS test_audit_fail_trg ON "FinanceActivityLog";`);
      await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS test_audit_fail_func();`);
    }
  });

  await runCase("11. Freeze/Create Race Direction 1 (Create takes FOR SHARE first)", async () => {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_barrier_11() RETURNS trigger AS $$
      BEGIN
        PERFORM pg_advisory_lock(1111);
        PERFORM pg_advisory_unlock(1111);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_barrier_11 BEFORE INSERT ON "FinanceJournalEntry"
      FOR EACH ROW EXECUTE FUNCTION test_barrier_11();
    `);

    // Grab lock in main process
    await prisma.$connect();
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(1111)`);

    try {
      const payload = {
        idempotencyKey: crypto.randomUUID(),
        ledgerId: ledger1!.id,
        fiscalPeriodId: p1_2!.id,
        entryDate: "2026-02-15T12:00:00Z",
        currencyId: currencySAR!.id,
        description: "[Test] Race Dir 1",
        lines: [
          { accountId: acc1_l1!.id, debitAmount: "100" },
          { accountId: acc2_l1!.id, creditAmount: "100" }
        ]
      };

      // Spawn Create Child
      const createProc = fork(__filename, [], {
        env: { ...process.env, CHILD_MODE: "CREATE", ACTOR_ID: superAdminId, CREATE_PAYLOAD: JSON.stringify(payload) }
      });

      await new Promise(r => setTimeout(r, 1000)); // Wait for Create to hit the trigger

      // Spawn Freeze Child
      const freezeProc = fork(__filename, [], {
        env: { ...process.env, CHILD_MODE: "FREEZE", ACTOR_ID: superAdminId, PERIOD_ID: p1_2!.id }
      });

      await new Promise(r => setTimeout(r, 1000)); // Wait for Freeze to block

      // Release lock
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(1111)`);

      const [createCode, freezeCode] = await Promise.all([
        new Promise(r => createProc.on('exit', r)),
        new Promise(r => freezeProc.on('exit', r))
      ]);

      if (createCode !== 0) throw new Error("Create should have succeeded!");
      if (freezeCode !== 0) throw new Error("Freeze should have succeeded after Create!");
      
    } finally {
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(1111)`).catch(() => {});
      await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_barrier_11 ON "FinanceJournalEntry"`);
      await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS test_barrier_11()`);
    }
  });

  await runCase("12. Freeze/Create Race Direction 2 (Freeze takes FOR UPDATE first)", async () => {
    // We want Freeze to grab FOR UPDATE, update status to FROZEN, and then block.
    // So we use BEFORE UPDATE trigger on FinanceFiscalPeriod.
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION test_barrier_12() RETURNS trigger AS $$
      BEGIN
        IF NEW.status = 'FROZEN' THEN
          PERFORM pg_advisory_lock(2222);
          PERFORM pg_advisory_unlock(2222);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_barrier_12 BEFORE UPDATE ON "FinanceFiscalPeriod"
      FOR EACH ROW EXECUTE FUNCTION test_barrier_12();
    `);

    // Unfreeze period just in case
    await prisma.financeFiscalPeriod.update({ where: { id: p1_2!.id }, data: { status: "OPEN" } });

    await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(2222)`);

    try {
      // Spawn Freeze Child
      const freezeProc = fork(__filename, [], {
        env: { ...process.env, CHILD_MODE: "FREEZE", ACTOR_ID: superAdminId, PERIOD_ID: p1_2!.id }
      });

      await new Promise(r => setTimeout(r, 1000)); // Wait for Freeze to hit the trigger

      // Spawn Create Child
      const payload = {
        idempotencyKey: crypto.randomUUID(),
        ledgerId: ledger1!.id,
        fiscalPeriodId: p1_2!.id,
        entryDate: "2026-02-15T12:00:00Z",
        currencyId: currencySAR!.id,
        description: "[Test] Race Dir 2",
        lines: [
          { accountId: acc1_l1!.id, debitAmount: "100" },
          { accountId: acc2_l1!.id, creditAmount: "100" }
        ]
      };
      const createProc = fork(__filename, [], {
        env: { ...process.env, CHILD_MODE: "CREATE", ACTOR_ID: superAdminId, CREATE_PAYLOAD: JSON.stringify(payload) }
      });

      await new Promise(r => setTimeout(r, 1000)); // Wait for Create to block on FOR SHARE

      // Release lock
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(2222)`);

      const [freezeCode, createCode] = await Promise.all([
        new Promise(r => freezeProc.on('exit', r)),
        new Promise(r => createProc.on('exit', r))
      ]);

      if (freezeCode !== 0) throw new Error("Freeze should have succeeded!");
      if (createCode === 0) throw new Error("Create should have FAILED because period was frozen!");
    } finally {
      await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(2222)`).catch(() => {});
      await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_barrier_12 ON "FinanceFiscalPeriod"`);
      await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS test_barrier_12()`);
    }
  });

  await runCase("13. Permission Flags & SoD (Creator cannot review/post)", async () => {
    // Use superAdmin to create a draft. Then calculateJournalPermissions for that user.
    // Is superAdmin allowed? Yes, but SoD violates if the creator is the reviewer. 
    // Wait, superAdmin bypasses everything? In my fix, `canReview` is `!isSoDViolated`. So even superAdmin gets `false` if they created it!
    const res = await handleCreateDraftWithLines({
        idempotencyKey: crypto.randomUUID(),
        ledgerId: ledger1!.id,
        fiscalPeriodId: p1!.id,
        entryDate: "2026-01-15T12:00:00Z",
        currencyId: currencySAR!.id,
        description: "[Test] SoD check",
        lines: [
          { accountId: acc1_l1!.id, debitAmount: "50" },
          { accountId: acc2_l1!.id, creditAmount: "50" }
        ]
    }, sessionDeps);

    const data = assertSuccess(res);
    if (!data.permissions) throw new Error("Permissions missing");
    
    // As Creator, canReview and canPost should be FALSE
    if (data.permissions.canReview !== false) throw new Error("SoD Failed: Creator can review");
    if (data.permissions.canPost !== false) throw new Error("SoD Failed: Creator can post");
    if (data.permissions.canSubmit !== true) throw new Error("Creator should be able to submit");
  });

  console.log("\n✅ All 13 integration tests passed successfully.");
}

if (!process.env.CHILD_MODE) {
  runTests().catch(e => {
    console.error("Test execution failed.", e);
    process.exit(1);
  }).finally(() => prisma.$disconnect());
}
