import { PrismaClient, Prisma } from "@prisma/client";
import {
  handleCreateDraft,
  handleAddLine,
  handleSubmitForReview,
  handleReviewJournal,
  handleApproveJournal,
  handlePostJournal,
  handleGetJournal,
  handleGetFinanceDashboardSummary,
} from "../src/actions/finance/finance-handlers";
import { SessionDependencies } from "../src/actions/finance/finance-action-utils";
import { strict as assert } from "assert";

const prisma = new PrismaClient();

async function runTests() {
  console.log("Starting Finance Batch 3 - Chunk 1C Server Actions Tests (Strict & Mock-Free)...");

  // Setup test data
  let adminUser = await prisma.user.findFirst({ where: { email: "admin1c@naht.local" } });
  if (!adminUser) adminUser = await prisma.user.create({ data: { email: "admin1c@naht.local", isActive: true } });

  const superAdminRole = await prisma.appRole.findUnique({ where: { code: "SUPER_ADMIN" } });
  if (superAdminRole) {
    const existing = await prisma.userRole.findFirst({ where: { userId: adminUser.id, roleId: superAdminRole.id } });
    if (!existing) {
      await prisma.userRole.create({ data: { userId: adminUser.id, roleId: superAdminRole.id } });
    }
  }

  let admin2User = await prisma.user.findFirst({ where: { email: "admin2c@naht.local" } });
  if (!admin2User) admin2User = await prisma.user.create({ data: { email: "admin2c@naht.local", isActive: true } });

  if (superAdminRole) {
    const existingAdmin2 = await prisma.userRole.findFirst({ where: { userId: admin2User.id, roleId: superAdminRole.id } });
    if (!existingAdmin2) {
      await prisma.userRole.create({ data: { userId: admin2User.id, roleId: superAdminRole.id } });
    }
  }

  let viewerUser = await prisma.user.findFirst({ where: { email: "viewer1c@naht.local" } });
  if (!viewerUser) viewerUser = await prisma.user.create({ data: { email: "viewer1c@naht.local", isActive: true } });

  // Create a custom SELF-scope role for viewerUser
  let selfViewerRole = await prisma.appRole.findUnique({ where: { code: "TEST_SELF_VIEWER" } });
  if (!selfViewerRole) {
    selfViewerRole = await prisma.appRole.create({
      data: {
        code: "TEST_SELF_VIEWER",
        name: "Test Self Viewer"
      }
    });
    const viewPermission = await prisma.permission.findUnique({ where: { code: "finance.journal.view" } });
    if (viewPermission) {
      await prisma.rolePermission.create({
        data: {
          roleId: selfViewerRole.id,
          permissionId: viewPermission.id,
          scope: "SELF"
        }
      });
    }
  }
  const existingSelfViewerRole = await prisma.userRole.findFirst({ where: { userId: viewerUser.id, roleId: selfViewerRole.id } });
  if (!existingSelfViewerRole) {
    await prisma.userRole.create({
      data: { userId: viewerUser.id, roleId: selfViewerRole.id }
    });
  }

  let otherViewer = await prisma.user.findFirst({ where: { email: "viewer2c@naht.local" } });
  if (!otherViewer) otherViewer = await prisma.user.create({ data: { email: "viewer2c@naht.local", isActive: true } });

  if (superAdminRole) {
    const existingOtherViewer = await prisma.userRole.findFirst({ where: { userId: otherViewer.id, roleId: superAdminRole.id } });
    if (!existingOtherViewer) {
      await prisma.userRole.create({ data: { userId: otherViewer.id, roleId: superAdminRole.id } });
    }
  }


  let inactiveUser = await prisma.user.findFirst({ where: { email: "inactive1c@naht.local" } });
  if (!inactiveUser) inactiveUser = await prisma.user.create({ data: { email: "inactive1c@naht.local", isActive: false } });

  const runId = Date.now().toString().slice(-6);

  const ledger = await prisma.financeLedger.create({
    data: { id: `ledg-1c-${runId}`, code: `L1C${runId}`, nameAr: "Main 1C", nameEn: "Main Ledger 1C", isActive: true },
  });

  const currency = await prisma.financeCurrency.create({
    data: { id: `curr-1c-${runId}`, code: `C1C${runId}`, nameAr: "Riyal", nameEn: "Riyal", isActive: true }
  });

  await prisma.financeSettings.create({
    data: { ledgerId: ledger.id, baseCurrencyId: currency.id, roundingPolicy: "HALF_UP", updatedById: adminUser.id },
  });

  const account1 = await prisma.financeAccount.create({
    data: { id: `acc1-1c-${runId}`, ledgerId: ledger.id, code: `1001-1c-${runId}`, nameAr: "Cash", nameEn: "Cash", type: "ASSET", normalBalance: "DEBIT", isActive: true, isPostingAllowed: true },
  });

  const account2 = await prisma.financeAccount.create({
    data: { id: `acc2-1c-${runId}`, ledgerId: ledger.id, code: `4001-1c-${runId}`, nameAr: "Revenue", nameEn: "Revenue", type: "REVENUE", normalBalance: "CREDIT", isActive: true, isPostingAllowed: true },
  });

  const year = await prisma.financeFiscalYear.create({
    data: { id: `y-1c-${runId}`, ledgerId: ledger.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") },
  });

  const period = await prisma.financeFiscalPeriod.create({
    data: { id: `p1-1c-${runId}`, fiscalYearId: year.id, periodNumber: 1, periodName: "2026-Q1", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), status: "OPEN" },
  });

  await prisma.financeDocumentSequence.create({
    data: { id: `seq-1c-${runId}`, ledgerId: ledger.id, fiscalYearId: year.id, documentType: "JOURNAL_ENTRY", prefix: "JE1C-", nextNumber: 1 }
  });

  // Helpers to mock dependencies per call
  const makeDeps = (user: { id: string; isActive: boolean } | null, targetUser?: { id: string } | null): SessionDependencies => ({
    getCurrentUser: async () => user ? { id: user.id, isActive: user.isActive } : null,
    getImpersonationRuntimeContext: async () => {
      if (!targetUser || !user) return null;
      return { actorUserId: user.id, targetUserId: targetUser.id };
    }
  });

  try {
    console.log("--- 1. Testing Unauthorized ---");
    const unauthResult = await handleCreateDraft({ ledgerId: ledger.id }, makeDeps(null));
    assert.strictEqual(unauthResult.ok, false);
    if (!unauthResult.ok) assert.strictEqual(unauthResult.error.code, "F_PERMISSION_DENIED");

    console.log("--- 2. Testing Inactive User ---");
    const inactiveResult = await handleCreateDraft({ ledgerId: ledger.id }, makeDeps(inactiveUser));
    assert.strictEqual(inactiveResult.ok, false);
    if (!inactiveResult.ok) assert.strictEqual(inactiveResult.error.code, "F_PERMISSION_DENIED");

    console.log("--- 3. Testing Impersonation Actor Mismatch ---");
    const mismatchDeps: SessionDependencies = {
      getCurrentUser: async () => ({ id: viewerUser.id, isActive: true }),
      getImpersonationRuntimeContext: async () => ({ actorUserId: adminUser.id, targetUserId: viewerUser.id }) // Mismatch! actorUserId doesn't match current user
    };
    const mismatchResult = await handleGetFinanceDashboardSummary(mismatchDeps);
    assert.strictEqual(mismatchResult.ok, false);
    if (!mismatchResult.ok) assert.strictEqual(mismatchResult.error.code, "F_PERMISSION_DENIED");

    console.log("--- 4. Testing Target Missing or Inactive ---");
    // Grant SUPER_ADMIN to inactive user so it's not rejected by RBAC but by context
    if (superAdminRole) {
      const existingInactiveRole = await prisma.userRole.findFirst({ where: { userId: inactiveUser.id, roleId: superAdminRole.id } });
      if (!existingInactiveRole) {
        await prisma.userRole.create({ data: { userId: inactiveUser.id, roleId: superAdminRole.id } });
      }
    }

    const inactiveTargetDeps = makeDeps(adminUser, inactiveUser);
    const injectRes = await handleCreateDraft({
      ledgerId: ledger.id,
      fiscalPeriodId: period.id,
      entryDate: "2026-02-01T00:00:00.000Z",
      currencyId: currency.id,
      exchangeRate: "1.0000",
      description: "Test",
    }, inactiveTargetDeps);
    assert.strictEqual(injectRes.ok, false);
    if (!injectRes.ok) {
      assert.strictEqual(injectRes.error.code, "F_PERMISSION_DENIED");
    }

    console.log("--- 5. Zod Strict Rejection of Injected Fields ---");
    const injectFieldsRes = await handleCreateDraft({
      ledgerId: ledger.id,
      fiscalPeriodId: period.id,
      entryDate: new Date().toISOString(),
      currencyId: currency.id,
      description: "Test",
      actorId: adminUser.id // INJECTED
    }, makeDeps(adminUser));
    assert.strictEqual(injectFieldsRes.ok, false);
    if (!injectFieldsRes.ok) {
      assert.strictEqual(injectFieldsRes.error.code, "F_VALIDATION_ERROR");
      assert.ok(injectFieldsRes.error.fieldErrors?.actorId !== undefined || injectFieldsRes.error.message.includes("validation")); // strict will complain about unrecognized key
    }

    console.log("--- 6. DTO Decimal Validation & Limits ---");
    const badDecimalRes = await handleCreateDraft({
      ledgerId: ledger.id,
      fiscalPeriodId: period.id,
      entryDate: "2026-02-01T00:00:00.000Z",
      currencyId: currency.id,
      exchangeRate: "1.00000", // > 4 scale
      description: "Test",
    }, makeDeps(adminUser));
    assert.strictEqual(badDecimalRes.ok, false);
    if (!badDecimalRes.ok) assert.strictEqual(badDecimalRes.error.code, "F_VALIDATION_ERROR");

    console.log("--- 7. Successful Impersonation and Audit Trace ---");
    const validImpersonationDeps = makeDeps(adminUser, admin2User);
    const draftRes = await handleCreateDraft({
      ledgerId: ledger.id,
      fiscalPeriodId: period.id,
      entryDate: "2026-02-01T00:00:00.000Z",
      currencyId: currency.id,
      exchangeRate: "1.0000",
      description: "Valid Impersonation Draft",
      reference: "IMP-1"
    }, validImpersonationDeps);
    assert.strictEqual(draftRes.ok, true);
    if (!draftRes.ok) return;
    const impersonatedJournal = draftRes.data;

    // Prove it saved actor
    const savedJournal = await prisma.financeJournalEntry.findUnique({ where: { id: impersonatedJournal.id } });
    assert.strictEqual(savedJournal!.createdById, admin2User.id);

    // Prove audit log contains it
    const logs = await prisma.financeActivityLog.findMany({ where: { entityId: savedJournal!.id } });
    assert.ok(logs.length > 0);
    assert.strictEqual(logs[0].actorId, admin2User.id);
    assert.strictEqual((logs[0].metadata as any).impersonatorUserId, adminUser.id);
    assert.ok((logs[0].metadata as any).correlationId && (logs[0].metadata as any).correlationId.length > 0);

    console.log("--- 8. True IDOR (SELF Scope vs Other's Journal) ---");
    // Create a journal by admin
    const adminDraftRes = await handleCreateDraft({
      ledgerId: ledger.id,
      fiscalPeriodId: period.id,
      entryDate: new Date().toISOString(),
      currencyId: currency.id,
      description: "Admin Draft",
    }, makeDeps(adminUser));
    assert.strictEqual(adminDraftRes.ok, true);
    if (!adminDraftRes.ok) return;

    // Prove audit log does NOT contain impersonatorUserId for non-impersonated action
    const normalLogs = await prisma.financeActivityLog.findMany({ where: { entityId: adminDraftRes.data.id } });
    assert.ok(normalLogs.length > 0);
    assert.strictEqual((normalLogs[0].metadata as any).impersonatorUserId, undefined);

    // Attempt to read it by viewer (who has NO permissions or only SELF)
    const viewerReadRes = await handleGetJournal({ id: adminDraftRes.data.id }, makeDeps(viewerUser));
    assert.strictEqual(viewerReadRes.ok, false);
    if (!viewerReadRes.ok) assert.strictEqual(viewerReadRes.error.code, "F_SCOPE_DENIED"); // Due to no COMPANY scope

    console.log("--- 9. Dashboard SELF vs COMPANY ---");
    // Inject a draft for viewerUser directly into DB
    await prisma.financeJournalEntry.create({
      data: {
        ledgerId: ledger.id,
        fiscalPeriodId: period.id,
        currencyId: currency.id,
        createdById: viewerUser.id,
        status: "DRAFT",
        entryDate: new Date("2026-02-01"),
        exchangeRate: new Prisma.Decimal("1.0"),
        description: "Viewer SELF Draft"
      }
    });

    const dashboardAdminRes = await handleGetFinanceDashboardSummary(makeDeps(adminUser)); // Has COMPANY via SUPER_ADMIN
    assert.strictEqual(dashboardAdminRes.ok, true);
    if (dashboardAdminRes.ok) {
      // Total includes all drafts (viewer's + admin's + admin2's)
      assert.ok(dashboardAdminRes.data.totalDrafts >= 3);
    }

    const dashboardViewerRes = await handleGetFinanceDashboardSummary(makeDeps(viewerUser)); // SELF
    assert.strictEqual(dashboardViewerRes.ok, true);
    if (dashboardViewerRes.ok) {
      assert.strictEqual(dashboardViewerRes.data.totalDrafts, 1); // Only the one we injected
      assert.strictEqual(dashboardViewerRes.data.openPeriodsCount, 0); // No period.view permission
    }

    console.log("--- 10. AddLine DTO Constraints (Mutual Exclusivity) ---");
    const addLineRes1 = await handleAddLine({
      journalId: impersonatedJournal.id,
      accountId: account1.id,
      debitAmount: "100.00",
      creditAmount: "100.00" // BOTH -> Fail
    }, validImpersonationDeps);
    assert.strictEqual(addLineRes1.ok, false);

    const addLineRes2 = await handleAddLine({
      journalId: impersonatedJournal.id,
      accountId: account1.id,
      // NEITHER -> Fail
    }, validImpersonationDeps);
    assert.strictEqual(addLineRes2.ok, false);

    const addLineRes3 = await handleAddLine({
      journalId: impersonatedJournal.id,
      accountId: account1.id,
      debitAmount: "100.00" // SUCCESS
    }, validImpersonationDeps);
    assert.strictEqual(addLineRes3.ok, true);

    const addLineRes4 = await handleAddLine({
      journalId: impersonatedJournal.id,
      accountId: account2.id,
      creditAmount: "100.00" // SUCCESS
    }, validImpersonationDeps);
    assert.strictEqual(addLineRes4.ok, true);

    console.log("--- 11. Lifecycle Success Path ---");
    const submitRes = await handleSubmitForReview({ id: impersonatedJournal.id }, validImpersonationDeps);
    assert.strictEqual(submitRes.ok, true);

    const reviewRes = await handleReviewJournal({ id: impersonatedJournal.id }, makeDeps(adminUser)); // Admin reviews
    assert.strictEqual(reviewRes.ok, true);

    const approveRes = await handleApproveJournal({ id: impersonatedJournal.id }, makeDeps(otherViewer)); // otherViewer approves
    assert.strictEqual(approveRes.ok, true);

    // Create a 4th user for POST to satisfy SoD
    let posterCUser = await prisma.user.findFirst({ where: { email: "poster2c@naht.local" } });
    if (!posterCUser) posterCUser = await prisma.user.create({ data: { email: "poster2c@naht.local", isActive: true } });
    if (superAdminRole) {
      const existingPoster = await prisma.userRole.findFirst({ where: { userId: posterCUser.id, roleId: superAdminRole.id } });
      if (!existingPoster) {
        await prisma.userRole.create({ data: { userId: posterCUser.id, roleId: superAdminRole.id } });
      }
    }

    const postRes = await handlePostJournal({ id: impersonatedJournal.id }, makeDeps(posterCUser)); // posterCUser posts
    assert.strictEqual(postRes.ok, true);
    if (postRes.ok) {
      assert.ok(postRes.data.entryNumber);
    }

    console.log("--- 12. Internal Error Safety ---");
    const { withFinanceActionErrorHandler } = await import("@/actions/finance/finance-action-utils");
    const fakeAction = async () => {
      throw new Error("SECRET_DATABASE_PASSWORD_OR_SQL");
    };
    const errorSafetyRes = await withFinanceActionErrorHandler(fakeAction, makeDeps(adminUser));
    assert.strictEqual(errorSafetyRes.ok, false);
    if (!errorSafetyRes.ok) {
      assert.strictEqual(errorSafetyRes.error.code, "F_INTERNAL_ERROR");
      assert.ok(!errorSafetyRes.error.message.includes("SECRET_DATABASE"));
    }

    console.log("🎉 All Server Action Chunk 1C Strict Tests Passed!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
