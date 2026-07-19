import { PrismaClient, Prisma, FinanceFiscalPeriod, FinanceJournalEntry } from "@prisma/client";
import { PeriodService } from "../src/services/finance/period-service";
import { JournalService } from "../src/services/finance/journal-service";
import { FinanceActionContext } from "../src/lib/finance-context";

const prisma = new PrismaClient();

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${name} failed:`, msg);
    throw error;
  }
}

async function expectError(name: string, expectedMsg: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.error(`❌ ${name} failed: Expected error "${expectedMsg}" but succeeded`);
    throw new Error("Expected failure");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as {code: string}).code : undefined;
    if (msg.includes(expectedMsg) || code === expectedMsg) {
      console.log(`✅ ${name} (Expected error caught)`);
    } else {
      console.error(`❌ ${name} failed with wrong error:`, msg);
      throw error;
    }
  }
}

async function setupRole(code: string, permissions: string[]) {
  const role = await prisma.appRole.upsert({
    where: { code },
    update: {},
    create: { name: code, code }
  });
  for (const pCode of permissions) {
    const perm = await prisma.permission.upsert({
      where: { code: pCode },
      update: {},
      create: { code: pCode, action: "manage", module: "FINANCE" }
    });
    const exists = await prisma.rolePermission.findFirst({
      where: { roleId: role.id, permissionId: perm.id }
    });
    if (!exists) {
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id, scope: "COMPANY" }
      });
    }
  }
  return role;
}

async function runAll() {
  console.log("=== Finance Batch 3 - Chunk 1B Verification ===");

  // Define unique suffix for this test run to avoid collisions
  const runId = Date.now().toString();

  // Create roles
  const rManager = await setupRole(`MGR_${runId}`, ["finance.period.manage", "finance.journal.view"]);
  const rCreator = await setupRole(`CRE_${runId}`, ["finance.journal.create", "finance.journal.submit", "finance.journal.view", "finance.journal.void"]);
  const rReviewer = await setupRole(`REV_${runId}`, ["finance.journal.review", "finance.journal.view"]);
  const rApprover = await setupRole(`APP_${runId}`, ["finance.journal.approve", "finance.journal.view"]);
  const rPoster = await setupRole(`POS_${runId}`, ["finance.journal.post", "finance.journal.view"]);
  const rReverser = await setupRole(`RVS_${runId}`, ["finance.journal.reverse", "finance.journal.submit", "finance.journal.view"]);
  const rNone = await setupRole(`NONE_${runId}`, []);
  const rReviewerApprover = await setupRole(`REVAPP_${runId}`, ["finance.journal.review", "finance.journal.approve", "finance.journal.view"]);
  const rAll = await setupRole(`ALL_${runId}`, ["finance.journal.create", "finance.journal.submit", "finance.journal.review", "finance.journal.approve", "finance.journal.post", "finance.journal.reverse", "finance.journal.view"]);
  const rSuper = await prisma.appRole.upsert({
    where: { code: "SUPER_ADMIN" },
    update: {},
    create: { name: "SuperAdmin", code: "SUPER_ADMIN" }
  });

  // Create users
  const createU = async (id: string, roleId: string) => {
    const u = await prisma.user.create({ data: { id, email: `${id}@example.com`, name: id, isActive: true } });
    await prisma.userRole.create({ data: { userId: u.id, roleId } });
    return { actorId: u.id, correlationId: `corr-${runId}` };
  };

  const ctxManager = await createU(`mgr-${runId}`, rManager.id);
  const ctxCreator = await createU(`cre-${runId}`, rCreator.id);
  const ctxReviewer = await createU(`rev-${runId}`, rReviewer.id);
  const ctxApprover = await createU(`app-${runId}`, rApprover.id);
  const ctxPoster = await createU(`pos-${runId}`, rPoster.id);
  const ctxReverser = await createU(`rvs-${runId}`, rReverser.id);
  const ctxNone = await createU(`none-${runId}`, rNone.id);
  const ctxAll = await createU(`all-${runId}`, rAll.id);
  const ctxReviewerApprover = await createU(`revapp-${runId}`, rReviewerApprover.id);
  const ctxSuper = await createU(`sup-${runId}`, rSuper.id);

  // Setup basic financial structures
  const ledger = await prisma.financeLedger.create({
    data: { id: `ledg-${runId}`, code: `L${runId}`, nameAr: "Main", nameEn: "Main Ledger", isActive: true },
  });

  const currency = await prisma.financeCurrency.create({
    data: { id: `curr-${runId}`, code: `C${runId}`, nameAr: "Riyal", nameEn: "Riyal", isActive: true }
  });

  await prisma.financeSettings.create({
    data: { ledgerId: ledger.id, baseCurrencyId: currency.id, roundingPolicy: "HALF_UP", updatedById: ctxSuper.actorId },
  });

  const account1 = await prisma.financeAccount.create({
    data: { id: `acc1-${runId}`, ledgerId: ledger.id, code: `1001-${runId}`, nameAr: "Cash", nameEn: "Cash", type: "ASSET", normalBalance: "DEBIT", isActive: true, isPostingAllowed: true },
  });

  const account2 = await prisma.financeAccount.create({
    data: { id: `acc2-${runId}`, ledgerId: ledger.id, code: `4001-${runId}`, nameAr: "Revenue", nameEn: "Revenue", type: "REVENUE", normalBalance: "CREDIT", isActive: true, isPostingAllowed: true },
  });

  const year = await prisma.financeFiscalYear.create({
    data: { id: `y-${runId}`, ledgerId: ledger.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") },
  });

  let period1 = await prisma.financeFiscalPeriod.create({
    data: { id: `p1-${runId}`, fiscalYearId: year.id, periodNumber: 1, periodName: "2026-Q1", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), status: "OPEN" },
  });
  const period2 = await prisma.financeFiscalPeriod.create({
    data: { id: `p2-${runId}`, fiscalYearId: year.id, periodNumber: 2, periodName: "2026-Q2", startDate: new Date("2026-04-01"), endDate: new Date("2026-06-30"), status: "OPEN" },
  });

  await prisma.financeDocumentSequence.create({
    data: { id: `seq-${runId}`, ledgerId: ledger.id, fiscalYearId: year.id, documentType: "JOURNAL_ENTRY", prefix: "JE-", nextNumber: 1 }
  });

  // ==========================================
  // RBAC Negative Tests
  // ==========================================
  await expectError("RBAC Deny: User without perm", "F_PERMISSION_DENIED", async () => {
    await PeriodService.freezePeriod(ctxNone, period1.id);
  });

  await expectError("RBAC Deny: Creator cannot freeze", "F_PERMISSION_DENIED", async () => {
    await PeriodService.freezePeriod(ctxCreator, period1.id);
  });

  // ==========================================
  // Period Transition Logic
  // ==========================================
  await runTest("Transition: OPEN -> FROZEN", async () => {
    const p = await PeriodService.freezePeriod(ctxManager, period1.id);
    if (p.status !== "FROZEN") throw new Error("Status should be FROZEN");
  });

  await runTest("Transition: FROZEN -> OPEN", async () => {
    const p = await PeriodService.unfreezePeriod(ctxManager, period1.id);
    if (p.status !== "OPEN") throw new Error("Status should be OPEN");
  });

  await expectError("Transition: Close from OPEN fails", "F_INVALID_STATE", async () => {
    await PeriodService.closePeriod(ctxManager, period1.id);
  });

  // ==========================================
  // Journal Lifecycle & SoD & FOR SHARE Locks
  // ==========================================
  let draftToPost: FinanceJournalEntry;

  await runTest("Create & Submit Draft", async () => {
    draftToPost = await JournalService.createDraft(ctxAll, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Test" });
    await JournalService.addLine(ctxAll, draftToPost.id, { accountId: account1.id, debitAmount: "100", creditAmount: "0" });
    await JournalService.addLine(ctxAll, draftToPost.id, { accountId: account2.id, debitAmount: "0", creditAmount: "100" });
    await JournalService.submitForReview(ctxAll, draftToPost.id);
  });

  await expectError("SoD: Creator cannot review", "F_SOD_VIOLATION", async () => {
    await JournalService.reviewJournal(ctxAll, draftToPost.id);
  });

  await runTest("Review Draft", async () => {
    await JournalService.reviewJournal(ctxReviewerApprover, draftToPost.id);
  });

  await expectError("SoD: Creator cannot approve", "F_SOD_VIOLATION", async () => {
    await JournalService.approveJournal(ctxAll, draftToPost.id);
  });

  await expectError("SoD: Reviewer cannot approve", "F_SOD_VIOLATION", async () => {
    await JournalService.approveJournal(ctxReviewerApprover, draftToPost.id);
  });

  await runTest("Approve Draft", async () => {
    await JournalService.approveJournal(ctxApprover, draftToPost.id);
  });

  await runTest("SUPER_ADMIN Override: Void PENDING_REVIEW", async () => {
    const overrideDraft = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Override" });
    await JournalService.addLine(ctxCreator, overrideDraft.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxCreator, overrideDraft.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });
    await JournalService.submitForReview(ctxCreator, overrideDraft.id);

    // ctxSuper should be able to void this despite not being the creator or having explicit COMPANY scope
    const voided = await JournalService.voidJournal(ctxSuper, overrideDraft.id, "Super Admin Override");
    if (voided.status !== "VOIDED") throw new Error("Status should be VOIDED");
  });

  // Test Period Frozen Lock (Write operations should fail)
  let draftFrozen: FinanceJournalEntry = null as any;
  let lineFrozen: { id: string } = null as any;
  let pendingFrozen: FinanceJournalEntry = null as any;
  let approvedFrozen: FinanceJournalEntry = null as any;

  await runTest("Setup FROZEN rejection test entries", async () => {
    draftFrozen = await JournalService.createDraft(ctxAll, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "FROZEN_draft" });
    lineFrozen = await JournalService.addLine(ctxAll, draftFrozen.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });

    pendingFrozen = await JournalService.createDraft(ctxAll, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "FROZEN_pending" });
    await JournalService.addLine(ctxAll, pendingFrozen.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxAll, pendingFrozen.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });
    await JournalService.submitForReview(ctxAll, pendingFrozen.id);

    approvedFrozen = await JournalService.createDraft(ctxAll, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "FROZEN_approved" });
    await JournalService.addLine(ctxAll, approvedFrozen.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxAll, approvedFrozen.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });
    await JournalService.submitForReview(ctxAll, approvedFrozen.id);
    await JournalService.reviewJournal(ctxReviewerApprover, approvedFrozen.id);
    await JournalService.approveJournal(ctxApprover, approvedFrozen.id);
    await JournalService.postJournal(ctxPoster, approvedFrozen.id);
  });

  await PeriodService.freezePeriod(ctxManager, period1.id);

  const frozenErrorMsg = "Fiscal period is not open";

  await expectError("FROZEN reject: Update Draft", frozenErrorMsg, async () => { await JournalService.updateDraft(ctxAll, draftFrozen.id, { description: "1" }); });
  await expectError("FROZEN reject: Add Line", frozenErrorMsg, async () => { await JournalService.addLine(ctxAll, draftFrozen.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" }); });
  await expectError("FROZEN reject: Update Line", frozenErrorMsg, async () => { await JournalService.updateLine(ctxAll, draftFrozen.id, lineFrozen.id, { debitAmount: "20" }); });
  await expectError("FROZEN reject: Remove Line", frozenErrorMsg, async () => { await JournalService.removeLine(ctxAll, draftFrozen.id, lineFrozen.id); });

  await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET status = 'DRAFT' WHERE id = ${pendingFrozen.id}`; // Hack to make it submit again
  await expectError("FROZEN reject: Submit", frozenErrorMsg, async () => { await JournalService.submitForReview(ctxAll, pendingFrozen.id); });
  await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET status = 'PENDING_REVIEW' WHERE id = ${pendingFrozen.id}`;

  await expectError("FROZEN reject: Review", frozenErrorMsg, async () => { await JournalService.reviewJournal(ctxReviewerApprover, pendingFrozen.id); });
  await expectError("FROZEN reject: Return", frozenErrorMsg, async () => { await JournalService.returnForModification(ctxReviewerApprover, pendingFrozen.id, "reason"); });

  // Add review data manually to bypass review validation and hit period validation
  await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET "reviewedById" = ${ctxReviewer.actorId}, "reviewedAt" = NOW() WHERE id = ${pendingFrozen.id}`;
  await expectError("FROZEN reject: Approve", frozenErrorMsg, async () => { await JournalService.approveJournal(ctxApprover, pendingFrozen.id); }); // pendingFrozen is PENDING_REVIEW but lacks review info so it might fail with invalid state first? No, verifyPeriodIsOpen is before state checks! Wait, actually period is checked AFTER review checks in approve. So we mock review data.
  await expectError("FROZEN reject: Void", frozenErrorMsg, async () => { await JournalService.voidJournal(ctxCreator, pendingFrozen.id, "reason"); });

  await expectError("FROZEN reject: Reverse", "Target fiscal period is not open", async () => { await JournalService.reverseJournal(ctxReverser, approvedFrozen.id, period1.id, "reason"); });

  await expectError("FROZEN reject: Post", frozenErrorMsg, async () => {
    await JournalService.postJournal(ctxPoster, draftToPost.id); // This draft is APPROVED
  });

  // Unfreeze to post
  await PeriodService.unfreezePeriod(ctxManager, period1.id);

  await runTest("Post Draft", async () => {
    await JournalService.postJournal(ctxPoster, draftToPost.id);
  });

  // ==========================================
  // Reversal Scenarios
  // ==========================================
  await expectError("Reverse: Original must be POSTED", "Only POSTED", async () => {
    const unposted = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period1.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Test" });
    try {
      await JournalService.reverseJournal(ctxReverser, unposted.id, period1.id, "Testing Reversal");
    } finally {
      await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET status = 'VOIDED' WHERE id = ${unposted.id}`;
    }
  });

  // Cleanup test journals so period can be closed
  await prisma.$executeRaw`UPDATE "FinanceJournalEntry" SET status = 'VOIDED' WHERE id IN (${draftFrozen.id}, ${pendingFrozen.id})`;

  // Close period 1
  await PeriodService.freezePeriod(ctxManager, period1.id);
  period1 = await PeriodService.closePeriod(ctxManager, period1.id);

  await expectError("CLOSED reject: Freeze", "Only OPEN periods can be frozen", async () => { await PeriodService.freezePeriod(ctxManager, period1.id); });
  await expectError("CLOSED reject: Unfreeze", "Only FROZEN periods can be unfrozen", async () => { await PeriodService.unfreezePeriod(ctxManager, period1.id); });
  await expectError("CLOSED reject: Close", "Only FROZEN periods can be closed", async () => { await PeriodService.closePeriod(ctxManager, period1.id); });

  await expectError("Reverse: Target period must be OPEN (Self reverse closed period fails)", "Target fiscal period is not open", async () => {
    await JournalService.reverseJournal(ctxReverser, draftToPost.id, period1.id, "Testing Reversal");
  });

  await runTest("Reverse: Success into subsequent OPEN period", async () => {
    const revDraft = await JournalService.reverseJournal(ctxReverser, draftToPost.id, period2.id, "Testing Reversal");
    if (revDraft.status !== "DRAFT") throw new Error("Status should be DRAFT");

    // Process reversal to completion
    await JournalService.submitForReview(ctxReverser, revDraft.id);
    await JournalService.reviewJournal(ctxReviewer, revDraft.id);
    await JournalService.approveJournal(ctxApprover, revDraft.id);
    await JournalService.postJournal(ctxPoster, revDraft.id);

    const checkRev = await prisma.financeJournalReversal.findFirst({ where: { originalEntryId: draftToPost.id } });
    if (!checkRev) throw new Error("Reversal link not created in DB");
  });

  // ==========================================
  // Audit Rollback
  // ==========================================
  await runTest("Audit Rollback leaves no trace", async () => {
    const draftForAudit = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period2.id, entryDate: new Date("2026-04-15"), currencyId: currency.id, description: "Audit" });
    await JournalService.addLine(ctxCreator, draftForAudit.id, { accountId: account1.id, debitAmount: "100", creditAmount: "0" });
    await JournalService.addLine(ctxCreator, draftForAudit.id, { accountId: account2.id, debitAmount: "0", creditAmount: "100" });
    await JournalService.submitForReview(ctxCreator, draftForAudit.id);
    await JournalService.reviewJournal(ctxReviewer, draftForAudit.id);

    // Simulate audit failure via DB injection (Assuming F2 rollback structure)
    try {
      await prisma.$executeRawUnsafe('CREATE OR REPLACE FUNCTION finance_simulate_audit_fail() RETURNS TRIGGER AS $$ BEGIN RAISE EXCEPTION \'Simulated Audit Failure\'; END; $$ LANGUAGE plpgsql');
      await prisma.$executeRawUnsafe('CREATE TRIGGER trg_test_audit BEFORE INSERT ON "FinanceActivityLog" FOR EACH ROW EXECUTE FUNCTION finance_simulate_audit_fail()');

      await expectError("Approve should fail due to Audit Rollback", "Simulated Audit Failure", async () => {
         await JournalService.approveJournal(ctxApprover, draftForAudit.id);
      });

      const checkState = await prisma.financeJournalEntry.findUnique({ where: { id: draftForAudit.id } });
      if (checkState?.status !== "PENDING_REVIEW") throw new Error("Status should have rolled back to PENDING_REVIEW");

    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS trg_test_audit ON "FinanceActivityLog"');
      await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS finance_simulate_audit_fail()');
    }
  });

  // ==========================================
  // Independent Connection Concurrency Tests
  // ==========================================
  await runTest("Concurrency: Freeze vs Submit", async () => {
    const concDraft = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period2.id, entryDate: new Date("2026-03-15"), currencyId: currency.id, description: "ConcSubmit" });
    await JournalService.addLine(ctxCreator, concDraft.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxCreator, concDraft.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });

    const p1 = JournalService.submitForReview(ctxCreator, concDraft.id);
    const p2 = PeriodService.freezePeriod(ctxManager, period2.id);

    const results = await Promise.allSettled([p1, p2]);
    if (results.some(r => r.status === "rejected" && r?.reason?.message?.includes("deadlock"))) {
        throw new Error("Deadlock detected");
    }

    await PeriodService.unfreezePeriod(ctxManager, period2.id).catch(() => {});
  });

  await runTest("Concurrency: Close vs Post", async () => {
    const appDraft = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period2.id, entryDate: new Date("2026-03-15"), currencyId: currency.id, description: "ConcPost" });
    await JournalService.addLine(ctxCreator, appDraft.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxCreator, appDraft.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });
    await JournalService.submitForReview(ctxCreator, appDraft.id);
    await JournalService.reviewJournal(ctxReviewer, appDraft.id);
    await JournalService.approveJournal(ctxApprover, appDraft.id);

    await PeriodService.freezePeriod(ctxManager, period2.id);

    const p1 = PeriodService.closePeriod(ctxManager, period2.id);
    const p2 = JournalService.postJournal(ctxPoster, appDraft.id);

    const results = await Promise.allSettled([p1, p2]);
    if (results.some(r => r.status === "rejected" && r?.reason?.message?.includes("deadlock"))) {
        throw new Error("Deadlock detected");
    }
  });

  await runTest("Concurrency: Reverse vs Reverse", async () => {
    const period3 = await prisma.financeFiscalPeriod.create({
      data: { id: `p3-${runId}`, fiscalYearId: year.id, periodNumber: 3, periodName: "Period 3", startDate: new Date("2026-07-01"), endDate: new Date("2026-07-31"), status: "OPEN" }
    });

    const postDraft = await JournalService.createDraft(ctxCreator, { ledgerId: ledger.id, fiscalPeriodId: period3.id, entryDate: new Date("2026-07-15"), currencyId: currency.id, description: "ConcRev" });
    await JournalService.addLine(ctxCreator, postDraft.id, { accountId: account1.id, debitAmount: "10", creditAmount: "0" });
    await JournalService.addLine(ctxCreator, postDraft.id, { accountId: account2.id, debitAmount: "0", creditAmount: "10" });
    await JournalService.submitForReview(ctxCreator, postDraft.id);
    await JournalService.reviewJournal(ctxReviewer, postDraft.id);
    await JournalService.approveJournal(ctxApprover, postDraft.id);
    await JournalService.postJournal(ctxPoster, postDraft.id);

    const p1 = JournalService.reverseJournal(ctxReverser, postDraft.id, period3.id, "Reason 1");
    const p2 = JournalService.reverseJournal(ctxReverser, postDraft.id, period3.id, "Reason 2");

    const results = await Promise.allSettled([p1, p2]);
    const successes = results.filter(r => r.status === "fulfilled").length;
    if (successes !== 1) {
        throw new Error(`Expected exactly 1 successful reverse, got ${successes}`);
    }
  });

  console.log("✅ All Chunk 1B tests passed successfully.");
}

runAll().catch(e => {
  console.error(e);
  process.exit(1);
});
