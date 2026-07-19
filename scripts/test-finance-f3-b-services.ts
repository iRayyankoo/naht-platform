import { PrismaClient, Prisma } from "@prisma/client";
import { PeriodService } from "../src/services/finance/period-service";
import { JournalService } from "../src/services/finance/journal-service";
import { FinanceActionContext } from "../src/lib/finance-context";

const prisma = new PrismaClient();

const mockContext: FinanceActionContext = {
  actorId: "actor-1",
  correlationId: "test-f3-b",
};

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error: any) {
    console.error(`❌ ${name} failed:`, error.message);
    throw error;
  }
}

async function expectError(name: string, expectedMsg: string, fn: () => Promise<any>) {
  try {
    await fn();
    console.error(`❌ ${name} failed: Expected error "${expectedMsg}" but succeeded`);
    throw new Error("Expected failure");
  } catch (error: any) {
    if (error.message.includes(expectedMsg)) {
      console.log(`✅ ${name} (Expected error caught)`);
    } else {
      console.error(`❌ ${name} failed with wrong error:`, error.message);
      throw error;
    }
  }
}

async function runAll() {
  console.log("=== Finance Batch 3 - Chunk 1B Verification ===");

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "FinanceCurrency", "FinanceLedger" CASCADE');

  const user1 = await prisma.user.create({ data: { id: "actor-1", email: "actor1@example.com", name: "Actor 1", isActive: true } });
  const user2 = await prisma.user.create({ data: { id: "actor-2", email: "actor2@example.com", name: "Actor 2", isActive: true } });
  const user3 = await prisma.user.create({ data: { id: "actor-3", email: "actor3@example.com", name: "Actor 3", isActive: true } });
  const user4 = await prisma.user.create({ data: { id: "actor-4", email: "actor4@example.com", name: "Actor 4", isActive: true } });

  const superRole = await prisma.appRole.upsert({
    where: { code: "SUPER_ADMIN" },
    update: {},
    create: { name: "SuperAdmin", code: "SUPER_ADMIN" }
  });
  await prisma.userRole.createMany({
    data: [
      { userId: user1.id, roleId: superRole.id },
      { userId: user2.id, roleId: superRole.id },
      { userId: user3.id, roleId: superRole.id },
      { userId: user4.id, roleId: superRole.id },
    ]
  });

  const ledger = await prisma.financeLedger.create({
    data: { id: "ledger-1", code: "L1", nameAr: "Main", nameEn: "Main Ledger", isActive: true },
  });

  const currency = await prisma.financeCurrency.create({
    data: { id: "SAR", code: "SAR", nameAr: "Riyal", nameEn: "Riyal", isActive: true }
  });

  await prisma.financeSettings.create({
    data: { ledgerId: ledger.id, baseCurrencyId: currency.id, roundingPolicy: "HALF_UP", updatedById: user1.id },
  });

  const account1 = await prisma.financeAccount.create({
    data: { id: "acc-1", ledgerId: ledger.id, code: "1001", nameAr: "Cash", nameEn: "Cash", type: "ASSET", normalBalance: "DEBIT", isActive: true, isPostingAllowed: true },
  });
  const account2 = await prisma.financeAccount.create({
    data: { id: "acc-2", ledgerId: ledger.id, code: "4001", nameAr: "Revenue", nameEn: "Revenue", type: "REVENUE", normalBalance: "CREDIT", isActive: true, isPostingAllowed: true },
  });

  const year = await prisma.financeFiscalYear.create({
    data: { id: "year-1", ledgerId: ledger.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") },
  });

  let period = await prisma.financeFiscalPeriod.create({
    data: { id: "period-1", fiscalYearId: year.id, periodNumber: 1, periodName: "2026-Q1", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), status: "OPEN" },
  });

  await prisma.financeDocumentSequence.create({
    data: { id: "seq-1", ledgerId: ledger.id, fiscalYearId: year.id, documentType: "JOURNAL_ENTRY", prefix: "JE-26-", nextNumber: 1 }
  });

  const ctx1 = { actorId: user1.id, correlationId: "test" };
  const ctx2 = { actorId: user2.id, correlationId: "test" };
  const ctx3 = { actorId: user3.id, correlationId: "test" };
  const ctx4 = { actorId: user4.id, correlationId: "test" };

  // --- PeriodService Tests ---
  await runTest("Freeze Period", async () => {
    period = await PeriodService.freezePeriod(ctx1, period.id);
    if (period.status !== "FROZEN") throw new Error("Period not FROZEN");
  });

  await expectError("Close Period fails with open journals", "Cannot close period with non-POSTED or non-VOIDED journals", async () => {
    await prisma.financeJournalEntry.create({
      data: { id: "draft-1", ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, exchangeRate: new Prisma.Decimal(1), description: "Test", status: "DRAFT", createdById: user1.id }
    });
    await PeriodService.closePeriod(ctx1, period.id);
  });

  await runTest("Unfreeze Period", async () => {
    period = await PeriodService.unfreezePeriod(ctx1, period.id);
    if (period.status !== "OPEN") throw new Error("Period not OPEN");
  });

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "FinanceJournalEntry" CASCADE'); // clean drafts

  // --- JournalService Period Check Tests ---
  await runTest("Create Draft in OPEN period", async () => {
    const draft = await JournalService.createDraft(ctx1, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Test" });
    await JournalService.addLine(ctx1, draft.id, { accountId: account1.id, debitAmount: "100", creditAmount: "0" });
    await JournalService.addLine(ctx1, draft.id, { accountId: account2.id, debitAmount: "0", creditAmount: "100" });
    await JournalService.submitForReview(ctx1, draft.id);
    await JournalService.reviewJournal(ctx2, draft.id); // review
    await JournalService.approveJournal(ctx3, draft.id); // approve
    await JournalService.postJournal(ctx4, draft.id); // post
  });

  await PeriodService.freezePeriod(ctx1, period.id);

  await expectError("Create Draft in FROZEN period fails", "Fiscal period is not open", async () => {
    await JournalService.createDraft(ctx1, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Test 2" });
  });

  // Re-open period
  await PeriodService.unfreezePeriod(ctx1, period.id);
  const draftToPost = await JournalService.createDraft(ctx1, { ledgerId: ledger.id, fiscalPeriodId: period.id, entryDate: new Date("2026-01-15"), currencyId: currency.id, description: "Test 3" });
  await JournalService.addLine(ctx1, draftToPost.id, { accountId: account1.id, debitAmount: "50", creditAmount: "0" });
  await JournalService.addLine(ctx1, draftToPost.id, { accountId: account2.id, debitAmount: "0", creditAmount: "50" });
  await JournalService.submitForReview(ctx1, draftToPost.id);
  await JournalService.reviewJournal(ctx2, draftToPost.id);
  await JournalService.approveJournal(ctx3, draftToPost.id);
  await JournalService.postJournal(ctx4, draftToPost.id);

  // --- Reverse Journal ---
  await runTest("Reverse Journal", async () => {
    const reversalDraft = await JournalService.reverseJournal(ctx1, draftToPost.id, "Testing Reversal");
    if (reversalDraft.status !== "DRAFT") throw new Error("Reversal not DRAFT");

    // Check lines
    const lines = await prisma.financeJournalLine.findMany({ where: { journalEntryId: reversalDraft.id } });
    const line1 = lines.find(l => l.accountId === account1.id);
    const line2 = lines.find(l => l.accountId === account2.id);
    if (!line1?.creditAmount.equals(new Prisma.Decimal(50)) || !line2?.debitAmount.equals(new Prisma.Decimal(50))) throw new Error("Lines not flipped correctly");

    await JournalService.submitForReview(ctx1, reversalDraft.id);
    await JournalService.reviewJournal(ctx2, reversalDraft.id);
    await JournalService.approveJournal(ctx3, reversalDraft.id);
    await JournalService.postJournal(ctx4, reversalDraft.id);

    const checkRev = await prisma.financeJournalReversal.findFirst({ where: { originalEntryId: draftToPost.id } });
    if (!checkRev) throw new Error("Reversal link not created");
  });

  // Close period
  await runTest("Close Period", async () => {
    await PeriodService.freezePeriod(ctx1, period.id);
    period = await PeriodService.closePeriod(ctx1, period.id);
    if (period.status !== "CLOSED") throw new Error("Period not CLOSED");
  });

  console.log("✅ All Chunk 1B tests passed.");
}

runAll().catch(e => {
  console.error(e);
  process.exit(1);
});
