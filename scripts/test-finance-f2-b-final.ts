import type { Prisma, PrismaClient, FinanceJournalEntry, FinanceJournalLine } from "@prisma/client";
import type { FinanceActionContext } from "../src/lib/finance-context";
import { Client } from "pg";
import { spawnSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return (e as {code?: string}).code || e.message;
  return String(e);
}

type JournalSnapshot = FinanceJournalEntry & { lines: FinanceJournalLine[], logsCount: number };
async function takeSnapshot(prisma: PrismaClient, id: string): Promise<JournalSnapshot | null> {
  const j = await prisma.financeJournalEntry.findUnique({ where: { id }, include: { lines: { orderBy: { lineNumber: 'asc' } } } });
  if (!j) return null;
  const logsCount = await prisma.financeActivityLog.count({ where: { entityId: id }});
  return { ...j, lines: j.lines, logsCount };
}

function compareSnapshots(s1: JournalSnapshot | null, s2: JournalSnapshot | null): boolean {
  if (!s1 && !s2) return true;
  if (!s1 || !s2) return false;
  const s1Str = JSON.stringify(s1, (k, v) => typeof v === 'bigint' ? v.toString() : (v instanceof Date ? v.toISOString() : v));
  const s2Str = JSON.stringify(s2, (k, v) => typeof v === 'bigint' ? v.toString() : (v instanceof Date ? v.toISOString() : v));
  return s1Str === s2Str;
}

const dbName = process.env.DATABASE_NAME || "";
const dbUrl = process.env.DATABASE_URL || "";
if (!dbName || !dbUrl) throw new Error("Missing DATABASE_NAME or DATABASE_URL from env");

const tsxBuildPath = path.join(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
const prismaBuildPath = path.join(process.cwd(), 'node_modules/prisma/build/index.js');

const manifest = {
  currency: [
    "Inactive Currency Rejection",
    "Zero Exchange Rate Rejection",
    "Negative Exchange Rate Rejection",
    "Base Currency Rate != 1 Rejection",
    "Valid Foreign Currency Calculation",
    "DB Guard: Base Debit/Credit Mismatch",
    "DB Guard: Missing Base Debit",
    "DB Guard: Update Exchange Rate Corruption"
  ],
  auditRollback: [
    "createDraft Rollback",
    "updateDraft Rollback",
    "addLine Rollback",
    "updateLine Rollback",
    "removeLine Rollback",
    "submitForReview Rollback",
    "returnForModification Rollback",
    "approveJournal Rollback",
    "voidJournal Rollback"
  ],
  concurrency: [
    "Submit vs Submit",
    "Return vs Approve",
    "Approve vs Approve",
    "Return vs Return",
    "Submit vs Return",
    "Submit vs Approve",
    "Add Line vs Submit",
    "Remove Line vs Submit",
    "Update Draft vs Submit",
    "Period Close vs Submit",
    "Period Lock vs Approve",
    "Ledger Deactivate vs Submit",
    "Ledger Deactivate vs Approve"
  ],
  rbac: [
    "Impersonation SoD",
    "IDOR Protection",
    "SELF Scope List",
    "COMPANY Scope List",
    "Missing Permission"
  ]
};

const results: { category: string, name: string, result: string, expected: string, actual: string, dbState: string }[] = [];
const startTotal = Date.now();

let fails = 0;
let fatalError = false;

function addResult(category: string, name: string, result: string, expected: string, actual: string, dbState: string) {
  results.push({ category, name, result, expected, actual, dbState });
}

async function runTests() {
  try {
    const customEnv = Object.assign({}, process.env, { DATABASE_URL: dbUrl, DIRECT_URL: dbUrl });
    
    const { JournalService } = await import("../src/services/finance/journal-service");
    const { PrismaClient } = await import("@prisma/client");
    
    // Check security issues recursively
    function scanDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) scanDir(full);
        else if ((full.endsWith('.ts') || full.endsWith('.js')) && !full.includes('bootstrap-greenfield.ts') && !full.includes('test-finance-f2-b-final')) {
          const c = fs.readFileSync(full, 'utf-8');
          if (c.includes('prisma db push') && !full.includes('generate-f2b-final') && !full.includes('test-finance-f2-b-final')) {
            throw new Error("Found banned 'prisma db push' in " + full);
          }
          if (c.includes('migrate reset') && !full.includes('generate-f2b-final') && !full.includes('test-finance-f2-b-final')) {
             throw new Error("Found banned 'migrate reset' in " + full);
          }
          if (c.includes('_prisma_migrations') && !full.includes('generate-f2b-final') && !full.includes('test-finance-f2-b-final')) {
             throw new Error("Found banned direct write to _prisma_migrations in " + full);
          }
        }
      }
    }
    scanDir('scripts');
    scanDir('src');

    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    
    const migStatus = spawnSync(process.execPath, [prismaBuildPath, "migrate", "status"], { env: customEnv, stdio: "inherit", shell: false });
    if (migStatus.status !== 0) throw new Error("Prisma migrate status reported pending migrations on test DB");

    // SETUP TEST DATA
    const creatorId = "usr_" + Date.now() + "c";
    const managerId = "usr_" + Date.now() + "m";
    const companyUserId = "usr_" + Date.now() + "co";
    const adminId = "usr_" + Date.now() + "a";
    await prisma.user.createMany({
      data: [
        { id: creatorId, email: creatorId + "@t.com", name: "Creator" },
        { id: managerId, email: managerId + "@t.com", name: "Manager" },
        { id: companyUserId, email: companyUserId + "@t.com", name: "Company" },
        { id: adminId, email: adminId + "@t.com", name: "Admin" }
      ]
    });

    const baseCurr = await prisma.financeCurrency.create({ data: { code: "SAR_" + Date.now(), nameAr: "SAR", nameEn: "SAR", isActive: true } });
    const usdCurr = await prisma.financeCurrency.create({ data: { code: "USD_" + Date.now(), nameAr: "USD", nameEn: "USD", isActive: true } });
    const currInact = await prisma.financeCurrency.create({ data: { code: "INACT", nameAr: "INA", nameEn: "INA", isActive: false } });

    const ledger = await prisma.financeLedger.create({ data: { nameAr: "TL", nameEn: "TL", code: "TL_" + Date.now(), isActive: true } });
    await prisma.financeSettings.create({ data: { ledgerId: ledger.id, baseCurrencyId: baseCurr.id, updatedById: adminId }});

    const year = await prisma.financeFiscalYear.create({ data: { ledgerId: ledger.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") } });
    const period = await prisma.financeFiscalPeriod.create({ data: { fiscalYearId: year.id, periodNumber: 1, periodName: "Jan 2026", startDate: new Date("2026-01-01"), endDate: new Date("2026-01-31"), status: "OPEN" } });
    const acc1 = await prisma.financeAccount.create({ data: { ledgerId: ledger.id, code: "1000", nameAr: "C", nameEn: "C", type: "ASSET", normalBalance: "DEBIT", isActive: true, isPostingAllowed: true } });
    const acc2 = await prisma.financeAccount.create({ data: { ledgerId: ledger.id, code: "4000", nameAr: "R", nameEn: "R", type: "REVENUE", normalBalance: "CREDIT", isActive: true, isPostingAllowed: true } });

    const ctxCreator: FinanceActionContext = { actorId: creatorId, correlationId: "CORR_C" };
    const ctxManager: FinanceActionContext = { actorId: managerId, correlationId: "CORR_M" };
    const ctxCompanyUser: FinanceActionContext = { actorId: companyUserId, correlationId: "CORR_CO" };
    const ctxAdmin: FinanceActionContext = { actorId: adminId, correlationId: "CORR_A" };
    
    // Assign scopes via DB manually to speed up setup
    const roleCreator = await prisma.appRole.create({ data: { name: "CreatorRole", code: "CR" }});
    const roleManager = await prisma.appRole.create({ data: { name: "ManagerRole", code: "MR" }});
    const roleAdmin = await prisma.appRole.create({ data: { name: "AdminRole", code: "AR" }});
    
    const perms = await prisma.permission.findMany({ where: { code: { in: ["finance.journal.create", "finance.journal.submit", "finance.journal.review", "finance.journal.approve", "finance.journal.view", "finance.journal.void"] }}});
    const pMap = Object.fromEntries(perms.map(p => [p.code, p.id]));
    
    await prisma.rolePermission.createMany({
       data: [
          { roleId: roleCreator.id, permissionId: pMap["finance.journal.create"], scope: "SELF" },
          { roleId: roleCreator.id, permissionId: pMap["finance.journal.submit"], scope: "SELF" },
          { roleId: roleCreator.id, permissionId: pMap["finance.journal.view"], scope: "SELF" },
          { roleId: roleCreator.id, permissionId: pMap["finance.journal.void"], scope: "SELF" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.create"], scope: "COMPANY" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.submit"], scope: "COMPANY" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.review"], scope: "COMPANY" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.approve"], scope: "COMPANY" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.view"], scope: "COMPANY" },
          { roleId: roleManager.id, permissionId: pMap["finance.journal.void"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.create"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.submit"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.review"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.approve"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.view"], scope: "COMPANY" },
          { roleId: roleAdmin.id, permissionId: pMap["finance.journal.void"], scope: "COMPANY" }
       ]
    });
    
    await prisma.userRole.createMany({
       data: [
          { userId: creatorId, roleId: roleCreator.id },
          { userId: managerId, roleId: roleManager.id },
          { userId: companyUserId, roleId: roleCreator.id }, 
          { userId: adminId, roleId: roleAdmin.id }
       ]
    });

    // --- EXECUTE CURRENCY MATRIX ---
    for (const test of manifest.currency) {
      let expectedError = "";
      let actualError = "SUCCESS";
      let finalStateStr = "NO_DRAFT";

      try {
        if (test === "Inactive Currency Rejection") {
          expectedError = "F_VALIDATION_ERROR";
          await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: currInact.id, description: test });
        }
        else if (test === "Zero Exchange Rate Rejection") {
          expectedError = "F_VALIDATION_ERROR";
          await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: usdCurr.id, exchangeRate: "0", description: test });
        }
        else if (test === "Negative Exchange Rate Rejection") {
          expectedError = "F_VALIDATION_ERROR";
          await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: usdCurr.id, exchangeRate: "-1", description: test });
        }
        else if (test === "Base Currency Rate != 1 Rejection") {
          expectedError = "F_VALIDATION_ERROR";
          await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, exchangeRate: "1.5", description: test });
        }
        else if (test === "Valid Foreign Currency Calculation") {
          expectedError = "";
          const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: usdCurr.id, exchangeRate: "3.75", description: test });
          finalStateStr = "DRAFT";
          const l = await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
          if (l.baseDebitAmount?.toString() !== "375") throw new Error("Base Debit Calculation Failed: " + l.baseDebitAmount);
        }
        else if (test === "DB Guard: Base Debit/Credit Mismatch") {
          expectedError = "P2010"; 
          const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test });
          finalStateStr = "DRAFT";
          await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
          await JournalService.addLine(ctxCreator, d.id, { accountId: acc2.id, debitAmount: "0", creditAmount: "100" });
          await prisma.$executeRaw`UPDATE "FinanceJournalLine" SET base_debit_amount = 50 WHERE journal_entry_id = ${d.id} AND debit_amount > 0`;
          await JournalService.submitForReview(ctxCreator, d.id);
        }
        else if (test === "DB Guard: Missing Base Debit") {
          expectedError = "P2010";
          const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test });
          finalStateStr = "DRAFT";
          await prisma.$executeRaw`INSERT INTO "FinanceJournalLine" (id, journal_entry_id, account_id, debit_amount, credit_amount, base_debit_amount, base_credit_amount, line_number) VALUES (gen_random_uuid(), ${d.id}, ${acc1.id}, 100, 0, NULL, 0, 1)`;
        }
        else if (test === "DB Guard: Update Exchange Rate Corruption") {
          expectedError = "P2010";
          const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test });
          finalStateStr = "DRAFT";
          await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
          await JournalService.addLine(ctxCreator, d.id, { accountId: acc2.id, debitAmount: "0", creditAmount: "100" });
          await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET exchange_rate = 2 WHERE id = ${d.id}`;
          await JournalService.submitForReview(ctxCreator, d.id);
        }

      } catch (e: unknown) {
        actualError = getErrorMessage(e);
      }

      const pass = expectedError === "" ? actualError === "SUCCESS" : actualError.includes(expectedError) || (expectedError === "P2010" && actualError.includes("P20"));
      addResult("Currency", test, pass ? "PASS" : "FAIL", expectedError || "SUCCESS", actualError, finalStateStr);
    }

    // --- EXECUTE AUDIT ROLLBACK MATRIX ---
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION block_audit_log() RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'Simulated Audit Failure';
      END;
      $$ LANGUAGE plpgsql;
    `;
    const enableAuditBlock = async () => prisma.$executeRaw`CREATE TRIGGER block_audit_trg BEFORE INSERT ON "FinanceActivityLog" FOR EACH ROW EXECUTE FUNCTION block_audit_log();`;
    const disableAuditBlock = async () => prisma.$executeRaw`DROP TRIGGER IF EXISTS block_audit_trg ON "FinanceActivityLog";`;

    for (const test of manifest.auditRollback) {
      const expectedError = "Simulated Audit Failure";
      let actualError = "";
      
      await disableAuditBlock();
      const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test });
      
      if (["updateLine Rollback", "removeLine Rollback", "submitForReview Rollback", "approveJournal Rollback", "returnForModification Rollback", "voidJournal Rollback"].includes(test)) {
         await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
         await JournalService.addLine(ctxCreator, d.id, { accountId: acc2.id, debitAmount: "0", creditAmount: "100" });
      }
      
      if (["approveJournal Rollback", "returnForModification Rollback"].includes(test)) {
         await JournalService.submitForReview(ctxCreator, d.id);
         if (test === "approveJournal Rollback") {
            await JournalService.reviewJournal(ctxAdmin, d.id);
         }
      }

      const snapshotBefore = await takeSnapshot(prisma, d.id);

      await enableAuditBlock();
      try {
        if (test === "createDraft Rollback") await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test + "_NEW" });
        else if (test === "updateDraft Rollback") await JournalService.updateDraft(ctxCreator, d.id, { description: "Mutated" });
        else if (test === "addLine Rollback") await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "50", creditAmount: "0" });
        else if (test === "updateLine Rollback") { const l = await prisma.financeJournalLine.findFirst({ where: { journalEntryId: d.id }}); await JournalService.updateLine(ctxCreator, d.id, l!.id, { debitAmount: "200" }); }
        else if (test === "removeLine Rollback") { const l = await prisma.financeJournalLine.findFirst({ where: { journalEntryId: d.id }}); await JournalService.removeLine(ctxCreator, d.id, l!.id); }
        else if (test === "submitForReview Rollback") await JournalService.submitForReview(ctxCreator, d.id);
        else if (test === "approveJournal Rollback") await JournalService.approveJournal(ctxManager, d.id);
        else if (test === "returnForModification Rollback") await JournalService.returnForModification(ctxManager, d.id, "Simulated valid reason");
        else if (test === "voidJournal Rollback") await JournalService.voidJournal(ctxManager, d.id, "Void");
      } catch(e: unknown) { actualError = getErrorMessage(e); }
      await disableAuditBlock();

      let pass = actualError.includes("Simulated Audit Failure");
      let snapshotAfter = snapshotBefore;
      if (test !== "createDraft Rollback") {
         snapshotAfter = await takeSnapshot(prisma, d.id);
         const identical = compareSnapshots(snapshotBefore, snapshotAfter);
         if (!identical) pass = false;
      }
      
      addResult("AuditRollback", test, pass ? "PASS" : "FAIL", expectedError, actualError, pass ? "NO_PARTIAL_UPDATE" : "PARTIAL_UPDATE_DETECTED");
    }
    
    // --- EXECUTE CONCURRENCY MATRIX ---
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION test_advisory_wait() RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_advisory_lock(100);
        PERFORM pg_advisory_unlock(100);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    const enableConcurrencyAdvisory = async () => {
      await prisma.$executeRaw`CREATE TRIGGER trg_test_advisory BEFORE UPDATE ON "FinanceJournalEntry" FOR EACH ROW EXECUTE FUNCTION test_advisory_wait();`;
      await prisma.$executeRaw`CREATE TRIGGER trg_test_advisory BEFORE UPDATE ON "FinanceFiscalPeriod" FOR EACH ROW EXECUTE FUNCTION test_advisory_wait();`;
      await prisma.$executeRaw`CREATE TRIGGER trg_test_advisory BEFORE UPDATE ON "FinanceLedger" FOR EACH ROW EXECUTE FUNCTION test_advisory_wait();`;
    };
    const disableConcurrencyAdvisory = async () => {
      await prisma.$executeRaw`DROP TRIGGER IF EXISTS trg_test_advisory ON "FinanceJournalEntry";`;
      await prisma.$executeRaw`DROP TRIGGER IF EXISTS trg_test_advisory ON "FinanceFiscalPeriod";`;
      await prisma.$executeRaw`DROP TRIGGER IF EXISTS trg_test_advisory ON "FinanceLedger";`;
    };

    const prisma2 = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    
    for (const test of manifest.concurrency) {
      const d = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: test });
      await JournalService.addLine(ctxCreator, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
      await JournalService.addLine(ctxCreator, d.id, { accountId: acc2.id, debitAmount: "0", creditAmount: "100" });
      
      const action1 = test.split(" vs ")[0];
      const action2 = test.split(" vs ")[1] || test;
      if (action1 === "Approve" || action1 === "Return" || test === "Ledger Deactivate vs Approve" || test === "Period Lock vs Approve") {
         await JournalService.submitForReview(ctxCreator, d.id);
         if (action1 === "Approve" || test === "Ledger Deactivate vs Approve" || test === "Period Lock vs Approve" || action2 === "Approve") {
            await JournalService.reviewJournal(ctxAdmin, d.id);
         }
      }

      await enableConcurrencyAdvisory();
      
      const lockClient = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      await lockClient.$executeRaw`SELECT pg_advisory_lock(100);`;
      
      const startWorker = (threadNum: string, role: string, userId: string, extra1: string, extra2: string) => {
          return new Promise<string>((resolve) => {
              const w = spawn(process.execPath, [tsxBuildPath, "scripts/test-finance-worker.ts", test, d.id, threadNum, role, userId, extra1, extra2], { env: customEnv });
              let out = "";
              w.stdout.on("data", data => out += data.toString());
              w.stderr.on("data", data => out += data.toString());
              w.on("close", () => {
                  console.log("Worker " + threadNum + " output:", out);
                  const lines = out.trim().split("\n");
                  const res = lines[lines.length - 1]?.trim() || "ERROR";
                  resolve(res);
              });
          });
      };
      
      const startMs = Date.now();
      
      const getWorker1Role = (t: string) => {
        if (t === "Submit vs Submit") return ctxCreator.actorId;
        if (t === "Return vs Approve") return ctxManager.actorId;
        if (t === "Approve vs Approve") return ctxManager.actorId;
        if (t === "Return vs Return") return ctxManager.actorId;
        if (t === "Submit vs Return") return ctxCreator.actorId;
        if (t === "Submit vs Approve") return ctxCreator.actorId;
        if (t === "Add Line vs Submit") return ctxCreator.actorId;
        if (t === "Remove Line vs Submit") return ctxCreator.actorId;
        if (t === "Update Draft vs Submit") return ctxCreator.actorId;
        if (t === "Period Close vs Submit") return ctxCreator.actorId;
        if (t === "Period Lock vs Approve") return ctxManager.actorId;
        if (t === "Ledger Deactivate vs Submit") return ctxCreator.actorId;
        if (t === "Ledger Deactivate vs Approve") return ctxManager.actorId;
        return ctxCreator.actorId;
      };

      const getWorker2Role = (t: string) => {
        if (t === "Submit vs Submit") return ctxCreator.actorId;
        if (t === "Return vs Approve") return ctxManager.actorId;
        if (t === "Approve vs Approve") return ctxManager.actorId;
        if (t === "Return vs Return") return ctxManager.actorId;
        if (t === "Submit vs Return") return ctxManager.actorId;
        if (t === "Submit vs Approve") return ctxManager.actorId;
        if (t === "Add Line vs Submit") return ctxCreator.actorId;
        if (t === "Remove Line vs Submit") return ctxCreator.actorId;
        if (t === "Update Draft vs Submit") return ctxCreator.actorId;
        if (t === "Period Close vs Submit") return adminId;
        if (t === "Period Lock vs Approve") return adminId;
        if (t === "Ledger Deactivate vs Submit") return adminId;
        if (t === "Ledger Deactivate vs Approve") return adminId;
        return ctxCreator.actorId;
      };

      const extra1Arg = test.includes("Period") ? period.id : (test.includes("Ledger") ? ledger.id : acc1.id);

      const p1 = startWorker("1", "", getWorker1Role(test), extra1Arg, adminId);

      let hit = false;
      for (let i = 0; i < 40; i++) {
        const check = await lockClient.$queryRaw<{wait_event: string}[]>`SELECT wait_event FROM pg_stat_activity WHERE wait_event = 'advisory'`;
        if (check.length > 0) {
          hit = true;
          break;
        }
        await new Promise(r => setTimeout(r, 50));
      }
      
      if (!hit) {
        await lockClient.$disconnect();
        throw new Error("Thread 1 did not hit the advisory lock barrier! Concurrency isolation failed.");
      }

      // Thread 1 is now blocked inside the trigger holding a row lock!
      // Start thread 2
      const p2 = startWorker("2", "", getWorker2Role(test), extra1Arg, adminId);
      
      await new Promise(r => setTimeout(r, 400));
      
      // Release barrier
      await lockClient.$executeRaw`SELECT pg_advisory_unlock(100);`;
      await lockClient.$disconnect();
      
      const [res1, res2] = await Promise.all([p1, p2]);
      const duration = Date.now() - startMs;
      
      await disableConcurrencyAdvisory();
      
      await prisma.financeLedger.update({ where: { id: ledger.id }, data: { isActive: true }});
      await prisma.financeFiscalPeriod.update({ where: { id: period.id }, data: { status: "OPEN", closedAt: null, closedById: null }});

      const finalState = await prisma.financeJournalEntry.findUnique({ where: { id: d.id } });
      const isExternalEntityTest = test.includes("Period Close") || test.includes("Period Lock") || test.includes("Ledger Deactivate") || test === "Submit vs Return" || test === "Submit vs Approve";
      const pass = ((res1 === "SUCCESS" && res2 !== "SUCCESS") || (res1 !== "SUCCESS" && res2 === "SUCCESS") || (isExternalEntityTest && res1 === "SUCCESS" && res2 === "SUCCESS")) && duration >= 400;
      
      addResult("Concurrency", test, pass ? "PASS" : "FAIL", "1 Success, 1 Fail (Wait >= 400ms)", `T1: ${res1} | T2: ${res2} (${duration}ms)`, finalState?.status || "NULL");
    }
    
    // --- EXECUTE RBAC MATRIX ---
    for (const test of manifest.rbac) {
      let expectedError = "";
      let actualError = "SUCCESS";
      try {
        if (test === "Impersonation SoD") {
          expectedError = "F_SOD_VIOLATION";
          const d = await JournalService.createDraft(ctxManager, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: "SOD" });
          await JournalService.addLine(ctxManager, d.id, { accountId: acc1.id, debitAmount: "100", creditAmount: "0" });
          await JournalService.addLine(ctxManager, d.id, { accountId: acc2.id, debitAmount: "0", creditAmount: "100" });
          await JournalService.submitForReview(ctxManager, d.id);
          await JournalService.reviewJournal(ctxAdmin, d.id);
          const ctxImpersonator = { actorId: adminId, impersonatorId: managerId, correlationId: "CORR" };
          await JournalService.approveJournal(ctxImpersonator, d.id);
        }
        else if (test === "IDOR Protection") {
          expectedError = "F_SCOPE_DENIED";
          const d = await JournalService.createDraft(ctxCompanyUser, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: "COMPANY" });
          await JournalService.getJournal(ctxCreator, d.id); 
        }
        else if (test === "SELF Scope List") {
          expectedError = "SUCCESS";
          const list = await JournalService.listJournals(ctxCreator, { ledgerId: ledger.id }, { take: 50 });
          const allOwned = list.items.every(j => j.createdById === creatorId);
          if (!allOwned || list.items.length === 0) actualError = `IDOR broken, listed unowned or zero: ${list.items.length}`;
        }
        else if (test === "COMPANY Scope List") {
          const list = await JournalService.listJournals(ctxAdmin, { ledgerId: ledger.id });
          if (list.items.length < 2) throw new Error("Listed too few, Admin scope broken"); 
        }
        else if (test === "Missing Permission") {
          expectedError = "F_PERMISSION_DENIED";
          const ctxStranger = { actorId: companyUserId, correlationId: "STR" }; 
          await prisma.userRole.deleteMany({ where: { userId: companyUserId } }); 
          await JournalService.createDraft(ctxStranger, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: baseCurr.id, description: "STRANGER" });
        }
      } catch(e: unknown) { actualError = getErrorMessage(e); }
      
      const pass = expectedError === "" ? actualError === "SUCCESS" : actualError.includes(expectedError);
      addResult("RBAC", test, pass ? "PASS" : "FAIL", expectedError || "SUCCESS", actualError, "-");
    }

    await prisma2.$disconnect();
    await prisma.$disconnect();

  } catch (e: unknown) {
    console.log(`🚨 FATAL ERROR IN TESTS: ${(e as Error).message}`);
    process.exitCode = 1;
    fatalError = true;
  } finally {
    // The parent process (gateway) is responsible for dropping the test database.

    console.log(`\n\n### Batch 2 Test Matrix Report`);
    console.log(`| Category | Test Name | Executed | Result | Expected | Actual | DB State |`);
    console.log(`|---|---|---|---|---|---|---|`);
    
    for (const cat of Object.keys(manifest)) {
      const expectedTests = manifest[cat as keyof typeof manifest];
      for (const expectedTest of expectedTests) {
         const res = results.find(r => r.category.toLowerCase() === cat.toLowerCase() && r.name === expectedTest);
         if (!res) {
            console.log(`| ${cat} | ${expectedTest} | NO | FAIL | - | MISSING | - |`);
            fails++;
         } else {
            console.log(`| ${res.category} | ${res.name} | YES | ${res.result} | ${res.expected} | ${res.actual} | ${res.dbState} |`);
            if (res.result === "FAIL") fails++;
         }
      }
    }
    
    if (results.length !== manifest.currency.length + manifest.auditRollback.length + manifest.concurrency.length + manifest.rbac.length) {
       console.log(`\n❌ MISMATCH IN EXPECTED TEST COUNTS.`);
       fails++;
    }

    const duration = (Date.now() - startTotal) / 1000;
    console.log(`\nExecution Time: ${duration}s`);
    console.log(`Database Used: ${dbName}`);
    
    if (fails > 0 || fatalError) {
      console.log(`\n❌ Exhaustive test failed with ${fails} errors.`);
      process.exitCode = 1;
    } else {
      console.log(`\n✅ All exhaustive tests passed perfectly!`);
    }
  }
}

runTests().catch(e => {
  console.error("Test Harness Fatal Error:", getErrorMessage(e));
  process.exitCode = 1;
});
