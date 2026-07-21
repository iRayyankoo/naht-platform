import { PrismaClient } from "@prisma/client";
import { FinanceActionContext } from "../src/lib/finance-context";
import { JournalService } from "../src/services/finance/journal-service";
import { mapJournalToDTO, mapJournalToDTOWithoutLines } from "../src/actions/finance/finance-dtos";

const prisma = new PrismaClient();

async function run() {
  console.log("Starting DTO Integration Tests...");
  // Setup admin role and user
  const runId = Date.now().toString();
  const role = await prisma.appRole.upsert({
    where: { code: `ADMIN_DTO_${runId}` },
    update: {},
    create: { name: "Admin DTO", code: `ADMIN_DTO_${runId}` }
  });

  const permissions = ["finance.journal.view", "finance.journal.list", "finance.ledger.manage", "finance.period.manage", "finance.journal.create"];
  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { code: p },
      update: {},
      create: { code: p, action: "manage", module: "FINANCE" }
    });
    const exists = await prisma.rolePermission.findFirst({ where: { roleId: role.id, permissionId: perm.id } });
    if (!exists) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id, scope: "COMPANY" } });
    }
  }

  const user = await prisma.user.create({
    data: { email: `dto-${runId}@example.com`, name: `DTO Admin ${runId}`, isActive: true }
  });
  await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

  const adminContext: FinanceActionContext = {
    actorId: user.id,
    correlationId: "test-dtos",
  };

  try {
    // We expect there to be at least one journal in the DB after Batch 1/2 tests
    // But let's create one explicitly just in case to ensure we have one with lines
    const currency = await prisma.financeCurrency.upsert({
      where: { code: "SAR" },
      update: {},
      create: { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", decimals: 2, isActive: true }
    });

    const ledger = await prisma.financeLedger.create({
      data: { nameAr: "Test Ledger for DTOs", nameEn: "Test Ledger for DTOs", code: "DTO-LEDGER-" + Date.now(), isActive: true }
    });

    const fiscalYear = await prisma.financeFiscalYear.create({
      data: {
        ledgerId: ledger.id,
        year: 2026,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      }
    });

    const period = await prisma.financeFiscalPeriod.create({
      data: {
        fiscalYearId: fiscalYear.id,
        periodName: "Q3 2026",
        periodNumber: 3,
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-09-30"),
        status: "OPEN"
      }
    });

    const journal = await prisma.financeJournalEntry.create({
      data: {
        ledgerId: ledger.id,
        fiscalPeriodId: period.id,
        currencyId: currency.id,
        exchangeRate: 1,
        entryNumber: "J-DTO-TEST",
        entryDate: new Date(),
        status: "DRAFT",
        description: "Test Journal for DTO",
        createdById: adminContext.actorId,
        lines: {
          create: [
            { lineNumber: 1, debitAmount: 12500, creditAmount: 0, baseDebitAmount: 12500, baseCreditAmount: 0, description: "Test Debit", accountId: (await prisma.financeAccount.findFirst())?.id || "dummy" },
            { lineNumber: 2, debitAmount: 0, creditAmount: 12500, baseDebitAmount: 0, baseCreditAmount: 12500, description: "Test Credit", accountId: (await prisma.financeAccount.findFirst())?.id || "dummy" }
          ]
        }
      }
    });

    // TEST 1: getJournal
    console.log("Testing getJournal DTO mapping...");
    const rawJournal = await JournalService.getJournal(adminContext, journal.id);
    const dto = mapJournalToDTO(rawJournal as Parameters<typeof mapJournalToDTO>[0]);
    
    if (!dto.currency || dto.currency.code !== "SAR") throw new Error("DTO Missing Currency relation");
    if (!dto.period || dto.period.periodName !== "Q3 2026") throw new Error("DTO Missing Period relation");
    if (dto.totalDebit !== "12500") throw new Error("DTO totalDebit is incorrect: " + dto.totalDebit);

    console.log("✅ getJournal DTO passed!");

    // TEST 2: listJournals
    console.log("Testing listJournals DTO mapping...");
    const listRes = await JournalService.listJournals(adminContext, { ledgerId: ledger.id });
    if (listRes.items.length === 0) throw new Error("listJournals returned empty");
    
    const listDto = mapJournalToDTOWithoutLines(listRes.items[0] as Parameters<typeof mapJournalToDTOWithoutLines>[0]);
    if (!listDto.currency || listDto.currency.code !== "SAR") throw new Error("List DTO Missing Currency relation");
    if (!listDto.period || listDto.period.periodName !== "Q3 2026") throw new Error("List DTO Missing Period relation");
    if (listDto.totalDebit !== "12500") throw new Error("List DTO totalDebit is incorrect: " + listDto.totalDebit);

    console.log("✅ listJournals DTO passed!");

    console.log("All UI DTO Integration Tests Passed!");
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
