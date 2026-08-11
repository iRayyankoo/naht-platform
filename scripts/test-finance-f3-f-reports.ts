import { prisma } from "../src/lib/prisma";
import {
  getTrialBalanceReport,
  getGeneralLedgerReport
} from "../src/services/finance/report-service";

import {
  getTrialBalanceReportAction,
  exportTrialBalanceCsvAction,
  exportGeneralLedgerCsvAction,
  getGeneralLedgerReportAction,
  getJournalReportAction
} from "../src/actions/finance/report-actions";
import { executeFinanceRbacSeed } from "../prisma/seeds/finance-permissions";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function getOrCreateUser(email: string, name: string) {
  let u = await prisma.user.findFirst({ where: { email } });
  if (!u) {
    u = await prisma.user.create({
      data: {
        email,
        name,
        role: "ADMIN"
      }
    });
  }
  return u;
}

export async function runReportIntegrationTests() {
  console.log("🚀 Running Rigorous Expanded Finance Chunk 3 Report Integration Tests...");

  // Seed permissions in database for non-superadmin testing
  await executeFinanceRbacSeed(prisma);

  // 1. Seed 4 distinct users for Separation of Duties (SoD) compliance & RBAC testing
  const uCreator = await getOrCreateUser(`creator_${Date.now()}@test.com`, "Creator Rep");
  const uReviewer = await getOrCreateUser(`reviewer_${Date.now()}@test.com`, "Reviewer Rep");
  const uApprover = await getOrCreateUser(`approver_${Date.now()}@test.com`, "Approver Rep");
  const uPoster = await getOrCreateUser(`poster_${Date.now()}@test.com`, "Poster Rep");
  const uViewerOnly = await getOrCreateUser(`viewer_only_${Date.now()}@test.com`, "Viewer Only Rep");

  // Assign FINANCE_VIEWER role to uViewerOnly (has finance.report.view but NOT finance.report.export)
  const viewerRole = await prisma.appRole.findUnique({ where: { code: "FINANCE_VIEWER" } });
  if (viewerRole) {
    const existing = await prisma.userRole.findFirst({ where: { userId: uViewerOnly.id, roleId: viewerRole.id } });
    if (!existing) {
      await prisma.userRole.create({ data: { userId: uViewerOnly.id, roleId: viewerRole.id } });
    }
  }

  // 2. Setup Currencies & Ledgers with Settings
  let sarCurrency = await prisma.financeCurrency.findFirst({ where: { code: "SAR" } });
  if (!sarCurrency) {
    sarCurrency = await prisma.financeCurrency.create({
      data: { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", decimals: 2, isActive: true }
    });
  }

  let usdCurrency = await prisma.financeCurrency.findFirst({ where: { code: "USD" } });
  if (!usdCurrency) {
    usdCurrency = await prisma.financeCurrency.create({
      data: { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", decimals: 2, isActive: true }
    });
  }

  const mainLedger = await prisma.financeLedger.create({
    data: {
      code: `L_MAIN_${Date.now()}`,
      nameAr: "الدفتر الرئيسي للاختبار",
      nameEn: "Main Test Ledger",
      settings: {
        create: {
          baseCurrencyId: sarCurrency.id,
          updatedById: uCreator.id
        }
      }
    }
  });

  const foreignLedger = await prisma.financeLedger.create({
    data: {
      code: `L_FOREIGN_${Date.now()}`,
      nameAr: "دفتر آخر خارجي",
      nameEn: "Foreign Test Ledger",
      settings: {
        create: {
          baseCurrencyId: sarCurrency.id,
          updatedById: uCreator.id
        }
      }
    }
  });

  const year = await prisma.financeFiscalYear.create({
    data: { ledgerId: mainLedger.id, year: 2026, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31") }
  });

  await prisma.financeDocumentSequence.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalYearId: year.id,
      documentType: "JOURNAL_ENTRY",
      prefix: "JE-2026-",
      nextNumber: 1
    }
  });

  const period = await prisma.financeFiscalPeriod.create({
    data: {
      fiscalYearId: year.id,
      periodNumber: 7,
      periodName: "July 2026",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-31"),
      status: "OPEN"
    }
  });

  // Create accounts with parent hierarchy
  const parentAcc = await prisma.financeAccount.create({
    data: {
      ledgerId: mainLedger.id,
      code: "1000_HDR",
      nameAr: "الأصول المتداولة (رئيسي)",
      nameEn: "Current Assets Header",
      type: "ASSET",
      normalBalance: "DEBIT",
      isPostingAllowed: false
    }
  });

  const acc1 = await prisma.financeAccount.create({
    data: {
      ledgerId: mainLedger.id,
      parentId: parentAcc.id,
      code: "1001_BNK",
      nameAr: "حساب البنك الرئيسي",
      nameEn: "Main Bank Account",
      type: "ASSET",
      normalBalance: "DEBIT",
      isPostingAllowed: true
    }
  });

  const acc2 = await prisma.financeAccount.create({
    data: {
      ledgerId: mainLedger.id,
      parentId: parentAcc.id,
      code: "2001_AP",
      nameAr: "حساب الموردين",
      nameEn: "Accounts Payable",
      type: "LIABILITY",
      normalBalance: "CREDIT",
      isPostingAllowed: true
    }
  });

  const foreignAcc = await prisma.financeAccount.create({
    data: {
      ledgerId: foreignLedger.id,
      code: "9999_EXT",
      nameAr: "حساب في دفتر آخر",
      nameEn: "External Account",
      type: "ASSET",
      normalBalance: "DEBIT",
      isPostingAllowed: true
    }
  });

  // --- Test 1: Explicit Exclusion of both DRAFT and APPROVED Entries (Only POSTED included) ---
  console.log("--- 1. Testing Strict Exclusion of DRAFT and APPROVED Entries ---");

  // Create a DRAFT journal
  await prisma.financeJournalEntry.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalPeriodId: period.id,
      currencyId: sarCurrency.id,
      status: "DRAFT",
      entryDate: new Date("2026-07-01"),
      description: "مسودة غير مرحلة",
      createdById: uCreator.id,
      lines: {
        create: [
          { lineNumber: 1, accountId: acc1.id, debitAmount: "50000.0000", creditAmount: "0.0000", baseDebitAmount: "50000.0000", baseCreditAmount: "0.0000" },
          { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "50000.0000", baseDebitAmount: "0.0000", baseCreditAmount: "50000.0000" }
        ]
      }
    }
  });

  // Create an APPROVED journal (not posted)
  await prisma.financeJournalEntry.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalPeriodId: period.id,
      currencyId: sarCurrency.id,
      status: "APPROVED",
      entryDate: new Date("2026-07-01"),
      description: "قيد معتمد غير مرحل",
      createdById: uCreator.id,
      reviewedById: uReviewer.id,
      approvedById: uApprover.id,
      reviewedAt: new Date("2026-07-01"),
      approvedAt: new Date("2026-07-01"),
      lines: {
        create: [
          { lineNumber: 1, accountId: acc1.id, debitAmount: "25000.0000", creditAmount: "0.0000", baseDebitAmount: "25000.0000", baseCreditAmount: "0.0000" },
          { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "25000.0000", baseDebitAmount: "0.0000", baseCreditAmount: "25000.0000" }
        ]
      }
    }
  });

  const baselineTb = await getTrialBalanceReport({ ledgerId: mainLedger.id });
  assert(baselineTb.totalClosingDebit === "0.0000", "DRAFT and APPROVED entries MUST NOT be included in Trial Balance");
  const baselineGl = await getGeneralLedgerReport({ ledgerId: mainLedger.id, accountId: acc1.id });
  assert(baselineGl.items.length === 0, "DRAFT and APPROVED entries MUST NOT appear in General Ledger items");
  console.log("✅ DRAFT and APPROVED strict exclusion test passed!");

  // --- Test 2: Foreign Currency & Base Amount Enforcement ---
  console.log("--- 2. Testing Foreign Currency Base Amount Conversion ---");

  // Create & Post Journal 1 (SAR: 1000.0000)
  const j1 = await prisma.financeJournalEntry.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalPeriodId: period.id,
      currencyId: sarCurrency.id,
      exchangeRate: "1.0000",
      status: "APPROVED",
      entryDate: new Date("2026-07-02"),
      description: "قيد محلي بالريال",
      createdById: uCreator.id,
      reviewedById: uReviewer.id,
      approvedById: uApprover.id,
      reviewedAt: new Date("2026-07-02"),
      approvedAt: new Date("2026-07-02"),
      lines: {
        create: [
          { lineNumber: 1, accountId: acc1.id, debitAmount: "1000.0000", creditAmount: "0.0000", baseDebitAmount: "1000.0000", baseCreditAmount: "0.0000" },
          { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "1000.0000", baseDebitAmount: "0.0000", baseCreditAmount: "1000.0000" }
        ]
      }
    }
  });
  await prisma.$executeRaw`SELECT finance_post_journal(${j1.id}::text, ${uPoster.id}::text);`;

  // Create & Post Journal 2 (USD: 100.0000 USD @ rate 3.7500 = 375.0000 SAR Base)
  const j2 = await prisma.financeJournalEntry.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalPeriodId: period.id,
      currencyId: usdCurrency.id,
      exchangeRate: "3.7500",
      status: "APPROVED",
      entryDate: new Date("2026-07-05"),
      description: "قيد أجنبي بالدولار",
      createdById: uCreator.id,
      reviewedById: uReviewer.id,
      approvedById: uApprover.id,
      reviewedAt: new Date("2026-07-05"),
      approvedAt: new Date("2026-07-05"),
      lines: {
        create: [
          { lineNumber: 1, accountId: acc1.id, debitAmount: "100.0000", creditAmount: "0.0000", baseDebitAmount: "375.0000", baseCreditAmount: "0.0000" },
          { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "100.0000", baseDebitAmount: "0.0000", baseCreditAmount: "375.0000" }
        ]
      }
    }
  });
  await prisma.$executeRaw`SELECT finance_post_journal(${j2.id}::text, ${uPoster.id}::text);`;

  // Verify Trial Balance uses base amounts (1000 + 375 = 1375.0000)
  const tbAfterPosted = await getTrialBalanceReport({ ledgerId: mainLedger.id });
  assert(tbAfterPosted.totalClosingDebit === "1375.0000", `Expected base total 1375.0000, got ${tbAfterPosted.totalClosingDebit}`);
  assert(tbAfterPosted.isBalanced === true, "Trial balance MUST be balanced");
  console.log("✅ Foreign currency base amount test passed!");

  // --- Test 3: Rejection of Account from Different Ledger in General Ledger ---
  console.log("--- 3. Testing Cross-Ledger Account Rejection ---");
  let crossLedgerErrorCaught = false;
  try {
    await getGeneralLedgerReport({ ledgerId: mainLedger.id, accountId: foreignAcc.id });
  } catch (err: unknown) {
    crossLedgerErrorCaught = true;
    const msg = err instanceof Error ? err.message : String(err);
    assert(msg.includes("لا ينتمي"), "Error message must indicate cross-ledger mismatch");
  }

  assert(crossLedgerErrorCaught, "getGeneralLedgerReport MUST reject account from another ledger");
  console.log("✅ Cross-ledger account rejection test passed!");

  // --- Test 4: General Ledger Page 2 & Running Balance Continuity ---
  console.log("--- 4. Testing General Ledger Page 2 & Running Balance Continuity ---");

  // Post Journal 3 for acc1 (200.0000 SAR)
  const j3 = await prisma.financeJournalEntry.create({
    data: {
      ledgerId: mainLedger.id,
      fiscalPeriodId: period.id,
      currencyId: sarCurrency.id,
      exchangeRate: "1.0000",
      status: "APPROVED",
      entryDate: new Date("2026-07-10"),
      description: "قيد إضافي 3",
      createdById: uCreator.id,
      reviewedById: uReviewer.id,
      approvedById: uApprover.id,
      reviewedAt: new Date("2026-07-10"),
      approvedAt: new Date("2026-07-10"),
      lines: {
        create: [
          { lineNumber: 1, accountId: acc1.id, debitAmount: "200.0000", creditAmount: "0.0000", baseDebitAmount: "200.0000", baseCreditAmount: "0.0000" },
          { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "200.0000", baseDebitAmount: "0.0000", baseCreditAmount: "200.0000" }
        ]
      }
    }
  });
  await prisma.$executeRaw`SELECT finance_post_journal(${j3.id}::text, ${uPoster.id}::text);`;

  // Total posted entries for acc1 = 3 entries (1000 + 375 + 200 = 1575.0000 total balance)
  // Fetch Page 1 (take 2)
  const glPage1 = await getGeneralLedgerReport({ ledgerId: mainLedger.id, accountId: acc1.id, skip: 0, take: 2 });
  assert(glPage1.items.length === 2, "Page 1 must return 2 items");
  assert(glPage1.items[0].runningBalance === "1000.0000", "Page 1 item 1 running balance 1000.0000");
  assert(glPage1.items[1].runningBalance === "1375.0000", "Page 1 item 2 running balance 1375.0000");
  assert(glPage1.closingBalance === "1575.0000", "Page 1 closingBalance must reflect FULL range balance (1575.0000)");

  // Fetch Page 2 (skip 2, take 2)
  const glPage2 = await getGeneralLedgerReport({ ledgerId: mainLedger.id, accountId: acc1.id, skip: 2, take: 2 });
  assert(glPage2.items.length === 1, "Page 2 must return remaining 1 item");
  assert(glPage2.items[0].runningBalance === "1575.0000", "Page 2 item 1 running balance MUST continue from Page 1 (1575.0000)");
  assert(glPage2.closingBalance === "1575.0000", "Page 2 closingBalance must reflect FULL range balance (1575.0000)");
  console.log("✅ General Ledger Page 2 running balance continuity test passed!");

  // --- Test 5: Separation of View vs Export Permissions for Non-SuperAdmin ---
  console.log("--- 5. Testing View vs Export Permission Separation ---");

  const mockViewerDeps = {
    getCurrentUser: async () => ({ id: uViewerOnly.id, isActive: true }),
    getImpersonationRuntimeContext: async () => null,
    getUserById: async (id: string) => ({ id, isActive: true })
  };

  // View action allowed for uViewerOnly
  const viewRes = await getTrialBalanceReportAction({ ledgerId: mainLedger.id }, mockViewerDeps);
  assert(viewRes.ok === true, "View Action MUST succeed for user with finance.report.view");

  // Export action denied for uViewerOnly (missing finance.report.export)
  const exportRes = await exportTrialBalanceCsvAction({ ledgerId: mainLedger.id }, mockViewerDeps);
  assert(exportRes.ok === false, "Export Action MUST fail for user missing finance.report.export");
  if (!exportRes.ok) {
    assert(exportRes.error.message.includes("صلاحية"), "Error message must indicate missing export permission");
  }
  console.log("✅ View vs Export permission separation test passed!");

  // --- Test 6: Testing Real Server Action CSV Exporter Output ---
  console.log("--- 6. Testing Actual Server Action CSV Export Output ---");

  const mockAdminUser = await getOrCreateUser(`admin_rep_${Date.now()}@test.com`, "Admin Rep");
  const superAdminRole = await prisma.appRole.findUnique({ where: { code: "SUPER_ADMIN" } });
  if (superAdminRole) {
    await prisma.userRole.create({ data: { userId: mockAdminUser.id, roleId: superAdminRole.id } });
  }

  const mockAdminDeps = {
    getCurrentUser: async () => ({ id: mockAdminUser.id, isActive: true }),
    getImpersonationRuntimeContext: async () => null,
    getUserById: async (id: string) => ({ id, isActive: true })
  };

  const csvServerActionRes = await exportTrialBalanceCsvAction({ ledgerId: mainLedger.id }, mockAdminDeps);
  assert(csvServerActionRes.ok === true, "exportTrialBalanceCsvAction MUST return ok: true");
  if (csvServerActionRes.ok) {
    assert(csvServerActionRes.data.content.startsWith("\uFEFF"), "Real Server Action CSV MUST start with UTF-8 BOM (\\uFEFF)");
    assert(csvServerActionRes.data.content.includes("ميزان المراجعة"), "Real Server Action CSV MUST contain Arabic headers");
  }
  console.log("✅ Real Server Action CSV exporter test passed!");

  // --- Test 7: > 50 Records Uncapped Full CSV Export ---
  console.log("--- 7. Testing > 50 Records Uncapped Full CSV Export ---");

  const bulkAcc1 = await prisma.financeAccount.create({
    data: {
      ledgerId: mainLedger.id,
      parentId: parentAcc.id,
      code: "1055_BLK",
      nameAr: "حساب اختبار الحجم الكبير",
      nameEn: "Bulk Test Account",
      type: "ASSET",
      normalBalance: "DEBIT",
      isPostingAllowed: true
    }
  });

  const createdJournalIds: string[] = [];
  for (let i = 1; i <= 55; i++) {
    const jBulk = await prisma.financeJournalEntry.create({
      data: {
        ledgerId: mainLedger.id,
        fiscalPeriodId: period.id,
        currencyId: sarCurrency.id,
        exchangeRate: "1.0000",
        status: "APPROVED",
        entryDate: new Date("2026-07-15"),
        description: `قيد حجم كبير رقم ${i}`,
        createdById: uCreator.id,
        reviewedById: uReviewer.id,
        approvedById: uApprover.id,
        reviewedAt: new Date("2026-07-15"),
        approvedAt: new Date("2026-07-15"),
        lines: {
          create: [
            { lineNumber: 1, accountId: bulkAcc1.id, debitAmount: "10.0000", creditAmount: "0.0000", baseDebitAmount: "10.0000", baseCreditAmount: "0.0000" },
            { lineNumber: 2, accountId: acc2.id, debitAmount: "0.0000", creditAmount: "10.0000", baseDebitAmount: "0.0000", baseCreditAmount: "10.0000" }
          ]
        }
      }
    });
    await prisma.$executeRaw`SELECT finance_post_journal(${jBulk.id}::text, ${uPoster.id}::text);`;
    createdJournalIds.push(jBulk.id);
  }

  const csvBulkRes = await exportGeneralLedgerCsvAction({ ledgerId: mainLedger.id, accountId: bulkAcc1.id }, mockAdminDeps);
  assert(csvBulkRes.ok === true, "Bulk CSV Export Action MUST succeed");
  if (csvBulkRes.ok) {
    const csvText = csvBulkRes.data.content;
    const occurrences = (csvText.match(/10.0000/g) || []).length;
    assert(occurrences >= 55, `Bulk CSV Export MUST contain all 55 entries without 50-record truncation (found ${occurrences})`);
  }
  console.log("✅ > 50 Records Uncapped Full CSV Export test passed!");

  const glActionRes = await getGeneralLedgerReportAction({ ledgerId: mainLedger.id, accountId: acc1.id }, mockAdminDeps);
  assert(glActionRes.ok === true, "getGeneralLedgerReportAction MUST return ok: true");

  const jrActionRes = await getJournalReportAction({ ledgerId: mainLedger.id, status: "POSTED", search: "بالدولار" }, mockAdminDeps);


  assert(jrActionRes.ok === true, "getJournalReportAction MUST return ok: true");
  if (jrActionRes.ok) {
    const jr = jrActionRes.data;
    assert(jr.items.length >= 1, "Journal report must return posted USD journal");
    assert(jr.items[0].totalBaseDebit === "375.0000", "Base debit amount must be 375.0000 SAR");
    assert(jr.items[0].totalDebit === "100.0000", "Original debit amount must be 100.0000 USD");
    assert(jr.items[0].totalBaseDebit !== jr.items[0].totalDebit, "Base amount must differ from foreign currency amount");
  }
  console.log("✅ Multi-currency DTO base amounts test passed!");



  // --- Test 9: Account Level Filter ---
  console.log("--- 9. Testing Account Level Filter ---");

  const tbAllLevels = await getTrialBalanceReport({ ledgerId: mainLedger.id, includeZeroBalances: true });
  const tbLevel1 = await getTrialBalanceReport({ ledgerId: mainLedger.id, accountLevel: 1, includeZeroBalances: true });

  assert(tbAllLevels.items.some(i => i.accountLevel === 2), "All levels report must contain level 2 accounts");
  assert(tbLevel1.items.every(i => i.accountLevel <= 1), "Level 1 report must ONLY contain level 1 accounts");
  console.log("✅ Account level filter test passed!");

  console.log("🎉 ALL 9 Rigorous Finance Report Integration Tests Passed Successfully!");
}

if (require.main === module) {
  runReportIntegrationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Report integration tests failed:", err);
      process.exit(1);
    });
}
