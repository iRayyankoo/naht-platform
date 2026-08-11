import { prisma } from "@/lib/prisma";
import { Prisma, FinanceJournalStatus } from "@prisma/client";

// Scaled BigInt (10000 = 1.0000) helper functions
function parseToScaledBigInt(val: string | null | undefined): bigint {
  if (!val) return BigInt(0);
  const trimmed = val.trim();
  if (!trimmed) return BigInt(0);

  const isNegative = trimmed.startsWith("-");
  const clean = isNegative ? trimmed.slice(1) : trimmed;

  const parts = clean.split(".");
  const integerPart = parts[0] || "0";
  let decimalPart = parts[1] || "";

  decimalPart = decimalPart.padEnd(4, "0").slice(0, 4);

  const combinedStr = integerPart + decimalPart;
  const result = BigInt(combinedStr);
  return isNegative ? -result : result;
}

function formatScaledBigInt(val: bigint): string {
  const isNegative = val < BigInt(0);
  const absVal = isNegative ? -val : val;

  const str = absVal.toString().padStart(5, "0");
  const integerPart = str.slice(0, -4) || "0";
  const decimalPart = str.slice(-4);

  return `${isNegative ? "-" : ""}${integerPart}.${decimalPart}`;
}

export interface TrialBalanceFilterParams {
  ledgerId: string;
  startDate?: string;
  endDate?: string;
  accountLevel?: number;
  includeZeroBalances?: boolean;
}

export interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  accountType: string;
  normalBalance: "DEBIT" | "CREDIT";
  accountLevel: number;
  isHeader: boolean;
  openingDebit: string;
  openingCredit: string;
  periodDebit: string;
  periodCredit: string;
  closingDebit: string;
  closingCredit: string;
}

export interface TrialBalanceReport {
  ledgerId: string;
  ledgerNameAr: string;
  startDate?: string;
  endDate?: string;
  items: TrialBalanceItem[];
  totalOpeningDebit: string;
  totalOpeningCredit: string;
  totalPeriodDebit: string;
  totalPeriodCredit: string;
  totalClosingDebit: string;
  totalClosingCredit: string;
  isBalanced: boolean;
}

export async function getTrialBalanceReport(params: TrialBalanceFilterParams): Promise<TrialBalanceReport> {
  const ledger = await prisma.financeLedger.findUnique({
    where: { id: params.ledgerId },
    select: { id: true, nameAr: true }
  });

  if (!ledger) {
    throw new Error("الدفتر المحاسبي المحدد غير موجود.");
  }

  // Query all active accounts for the ledger
  const accounts = await prisma.financeAccount.findMany({
    where: {
      ledgerId: params.ledgerId,
      isActive: true
    },
    orderBy: { code: "asc" }
  });

  // Build parent map to dynamically compute account hierarchy levels
  const parentMap = new Map<string, string | null>();
  accounts.forEach(acc => parentMap.set(acc.id, acc.parentId));

  function calculateLevel(accId: string): number {
    let level = 1;
    let curr = parentMap.get(accId);
    while (curr) {
      level++;
      curr = parentMap.get(curr);
      if (level > 25) break;
    }
    return level;
  }

  const startDateObj = params.startDate ? new Date(params.startDate) : undefined;
  const endDateObj = params.endDate ? new Date(params.endDate) : undefined;

  // Query all POSTED journal lines up to endDateObj using base amounts (baseDebitAmount, baseCreditAmount)
  const journalLines = await prisma.financeJournalLine.findMany({
    where: {
      journalEntry: {
        ledgerId: params.ledgerId,
        status: "POSTED",
        ...(endDateObj ? { entryDate: { lte: endDateObj } } : {})
      }
    },
    select: {
      accountId: true,
      baseDebitAmount: true,
      baseCreditAmount: true,
      journalEntry: {
        select: {
          entryDate: true
        }
      }
    }
  });

  // Calculate opening and period debits/credits per account using base amounts
  const accountBalances = new Map<string, {
    openingDebit: bigint;
    openingCredit: bigint;
    periodDebit: bigint;
    periodCredit: bigint;
  }>();

  accounts.forEach(acc => {
    accountBalances.set(acc.id, {
      openingDebit: BigInt(0),
      openingCredit: BigInt(0),
      periodDebit: BigInt(0),
      periodCredit: BigInt(0)
    });
  });

  for (const line of journalLines) {
    const bal = accountBalances.get(line.accountId);
    if (!bal) continue;

    const lineDebit = parseToScaledBigInt(line.baseDebitAmount ? line.baseDebitAmount.toString() : null);
    const lineCredit = parseToScaledBigInt(line.baseCreditAmount ? line.baseCreditAmount.toString() : null);

    const isBeforeStart = startDateObj ? line.journalEntry.entryDate < startDateObj : false;

    if (isBeforeStart) {
      bal.openingDebit += lineDebit;
      bal.openingCredit += lineCredit;
    } else {
      bal.periodDebit += lineDebit;
      bal.periodCredit += lineCredit;
    }
  }

  let totalOpeningDebitBig = BigInt(0);
  let totalOpeningCreditBig = BigInt(0);
  let totalPeriodDebitBig = BigInt(0);
  let totalPeriodCreditBig = BigInt(0);
  let totalClosingDebitBig = BigInt(0);
  let totalClosingCreditBig = BigInt(0);

  const reportItems: TrialBalanceItem[] = [];

  for (const acc of accounts) {
    const level = calculateLevel(acc.id);

    // Apply accountLevel filter if requested
    if (params.accountLevel !== undefined && level > params.accountLevel) {
      continue;
    }

    const bal = accountBalances.get(acc.id)!;
    const isHeader = !acc.isPostingAllowed;

    // Calculate closing net balance
    const netOpening = bal.openingDebit - bal.openingCredit;
    const netPeriod = bal.periodDebit - bal.periodCredit;
    const netTotal = netOpening + netPeriod;

    let closingDebitBig = BigInt(0);
    let closingCreditBig = BigInt(0);

    if (netTotal >= BigInt(0)) {
      closingDebitBig = netTotal;
    } else {
      closingCreditBig = -netTotal;
    }

    const hasActivity = bal.openingDebit > BigInt(0) || bal.openingCredit > BigInt(0) ||
                        bal.periodDebit > BigInt(0) || bal.periodCredit > BigInt(0) ||
                        closingDebitBig > BigInt(0) || closingCreditBig > BigInt(0);

    if (!params.includeZeroBalances && !hasActivity && !isHeader) {
      continue;
    }

    if (!isHeader) {
      totalOpeningDebitBig += bal.openingDebit;
      totalOpeningCreditBig += bal.openingCredit;
      totalPeriodDebitBig += bal.periodDebit;
      totalPeriodCreditBig += bal.periodCredit;
      totalClosingDebitBig += closingDebitBig;
      totalClosingCreditBig += closingCreditBig;
    }

    reportItems.push({
      accountId: acc.id,
      accountCode: acc.code,
      accountNameAr: acc.nameAr,
      accountType: acc.type,
      normalBalance: acc.normalBalance as "DEBIT" | "CREDIT",
      accountLevel: level,
      isHeader,
      openingDebit: formatScaledBigInt(bal.openingDebit),
      openingCredit: formatScaledBigInt(bal.openingCredit),
      periodDebit: formatScaledBigInt(bal.periodDebit),
      periodCredit: formatScaledBigInt(bal.periodCredit),
      closingDebit: formatScaledBigInt(closingDebitBig),
      closingCredit: formatScaledBigInt(closingCreditBig)
    });
  }

  const isBalanced = totalClosingDebitBig === totalClosingCreditBig;

  return {
    ledgerId: ledger.id,
    ledgerNameAr: ledger.nameAr,
    startDate: params.startDate,
    endDate: params.endDate,
    items: reportItems,
    totalOpeningDebit: formatScaledBigInt(totalOpeningDebitBig),
    totalOpeningCredit: formatScaledBigInt(totalOpeningCreditBig),
    totalPeriodDebit: formatScaledBigInt(totalPeriodDebitBig),
    totalPeriodCredit: formatScaledBigInt(totalPeriodCreditBig),
    totalClosingDebit: formatScaledBigInt(totalClosingDebitBig),
    totalClosingCredit: formatScaledBigInt(totalClosingCreditBig),
    isBalanced
  };
}

export interface GeneralLedgerFilterParams {
  ledgerId: string;
  accountId: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export interface GeneralLedgerEntryItem {
  journalId: string;
  journalNumber: string;
  entryDate: string;
  description: string;
  reference?: string;
  debitAmount: string;
  creditAmount: string;
  baseDebitAmount: string;
  baseCreditAmount: string;
  runningBalance: string;
}

export interface GeneralLedgerReport {
  ledgerId: string;
  ledgerNameAr: string;
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  normalBalance: "DEBIT" | "CREDIT";
  openingBalance: string;
  closingBalance: string;
  items: GeneralLedgerEntryItem[];
  totalDebit: string;
  totalCredit: string;
  total: number;
  skip: number;
  take: number;
}

export async function getGeneralLedgerReport(params: GeneralLedgerFilterParams): Promise<GeneralLedgerReport> {
  const ledger = await prisma.financeLedger.findUnique({
    where: { id: params.ledgerId },
    select: { id: true, nameAr: true }
  });

  if (!ledger) {
    throw new Error("الدفتر المحاسبي المحدد غير موجود.");
  }

  const account = await prisma.financeAccount.findUnique({
    where: { id: params.accountId },
    select: { id: true, ledgerId: true, code: true, nameAr: true, normalBalance: true }
  });

  if (!account) {
    throw new Error("الحساب المحاسبي المحدد غير موجود.");
  }

  // Cross-ledger check: Ensure account belongs to target ledger
  if (account.ledgerId !== params.ledgerId) {
    throw new Error("الحساب المحاسبي المحدد لا ينتمي إلى الدفتر المحاسبي المختار.");
  }

  const startDateObj = params.startDate ? new Date(params.startDate) : undefined;
  const endDateObj = params.endDate ? new Date(params.endDate) : undefined;

  // 1. Calculate opening balance before startDateObj using base amounts
  let openingBalBig = BigInt(0);
  if (startDateObj) {
    const priorLines = await prisma.financeJournalLine.findMany({
      where: {
        accountId: params.accountId,
        journalEntry: {
          ledgerId: params.ledgerId,
          status: "POSTED",
          entryDate: { lt: startDateObj }
        }
      },
      select: { baseDebitAmount: true, baseCreditAmount: true }
    });

    for (const line of priorLines) {
      const bd = parseToScaledBigInt(line.baseDebitAmount ? line.baseDebitAmount.toString() : null);
      const bc = parseToScaledBigInt(line.baseCreditAmount ? line.baseCreditAmount.toString() : null);
      if (account.normalBalance === "DEBIT") {
        openingBalBig += (bd - bc);
      } else {
        openingBalBig += (bc - bd);
      }
    }
  }

  // 2. Count total matching entries in the date range
  const total = await prisma.financeJournalLine.count({
    where: {
      accountId: params.accountId,
      journalEntry: {
        ledgerId: params.ledgerId,
        status: "POSTED",
        ...(startDateObj || endDateObj ? {
          entryDate: {
            ...(startDateObj ? { gte: startDateObj } : {}),
            ...(endDateObj ? { lte: endDateObj } : {})
          }
        } : {})
      }
    }
  });

  // 3. Compute closing balance for the ENTIRE filter range using base amounts
  const allPeriodLines = await prisma.financeJournalLine.findMany({
    where: {
      accountId: params.accountId,
      journalEntry: {
        ledgerId: params.ledgerId,
        status: "POSTED",
        ...(startDateObj || endDateObj ? {
          entryDate: {
            ...(startDateObj ? { gte: startDateObj } : {}),
            ...(endDateObj ? { lte: endDateObj } : {})
          }
        } : {})
      }
    },
    select: { baseDebitAmount: true, baseCreditAmount: true }
  });

  let totalPeriodBaseDebitBig = BigInt(0);
  let totalPeriodBaseCreditBig = BigInt(0);

  for (const line of allPeriodLines) {
    const bd = parseToScaledBigInt(line.baseDebitAmount ? line.baseDebitAmount.toString() : null);
    const bc = parseToScaledBigInt(line.baseCreditAmount ? line.baseCreditAmount.toString() : null);
    totalPeriodBaseDebitBig += bd;
    totalPeriodBaseCreditBig += bc;
  }

  let fullClosingBalBig = openingBalBig;
  if (account.normalBalance === "DEBIT") {
    fullClosingBalBig += (totalPeriodBaseDebitBig - totalPeriodBaseCreditBig);
  } else {
    fullClosingBalBig += (totalPeriodBaseCreditBig - totalPeriodBaseDebitBig);
  }

  const skip = params.skip || 0;
  const take = params.take !== undefined ? params.take : 50;

  // 4. Compute page opening balance (opening balance + prior items before skip offset in dataset)
  let pageOpeningBalBig = openingBalBig;

  if (skip > 0) {
    const priorPageLines = await prisma.financeJournalLine.findMany({
      where: {
        accountId: params.accountId,
        journalEntry: {
          ledgerId: params.ledgerId,
          status: "POSTED",
          ...(startDateObj || endDateObj ? {
            entryDate: {
              ...(startDateObj ? { gte: startDateObj } : {}),
              ...(endDateObj ? { lte: endDateObj } : {})
            }
          } : {})
        }
      },
      select: { baseDebitAmount: true, baseCreditAmount: true },
      orderBy: [
        { journalEntry: { entryDate: "asc" } },
        { journalEntry: { entryNumber: "asc" } },
        { lineNumber: "asc" },
        { id: "asc" }
      ],

      take: skip
    });

    for (const line of priorPageLines) {
      const bd = parseToScaledBigInt(line.baseDebitAmount ? line.baseDebitAmount.toString() : null);
      const bc = parseToScaledBigInt(line.baseCreditAmount ? line.baseCreditAmount.toString() : null);
      if (account.normalBalance === "DEBIT") {
        pageOpeningBalBig += (bd - bc);
      } else {
        pageOpeningBalBig += (bc - bd);
      }
    }
  }

  // 5. Fetch target page lines
  const lines = await prisma.financeJournalLine.findMany({
    where: {
      accountId: params.accountId,
      journalEntry: {
        ledgerId: params.ledgerId,
        status: "POSTED",
        ...(startDateObj || endDateObj ? {
          entryDate: {
            ...(startDateObj ? { gte: startDateObj } : {}),
            ...(endDateObj ? { lte: endDateObj } : {})
          }
        } : {})
      }
    },
    include: {
      journalEntry: {
        select: {
          id: true,
          entryNumber: true,
          entryDate: true,
          description: true,
          reference: true
        }
      }
    },
    orderBy: [
      { journalEntry: { entryDate: "asc" } },
      { journalEntry: { entryNumber: "asc" } }
    ],
    skip,
    ...(take > 0 ? { take } : {})
  });

  let runningBalBig = pageOpeningBalBig;

  const items: GeneralLedgerEntryItem[] = [];

  for (const line of lines) {
    const d = parseToScaledBigInt(line.debitAmount ? line.debitAmount.toString() : null);
    const c = parseToScaledBigInt(line.creditAmount ? line.creditAmount.toString() : null);
    const bd = parseToScaledBigInt(line.baseDebitAmount ? line.baseDebitAmount.toString() : null);
    const bc = parseToScaledBigInt(line.baseCreditAmount ? line.baseCreditAmount.toString() : null);

    if (account.normalBalance === "DEBIT") {

      runningBalBig += (bd - bc);
    } else {
      runningBalBig += (bc - bd);
    }

    items.push({
      journalId: line.journalEntry.id,
      journalNumber: line.journalEntry.entryNumber || "DRAFT",
      entryDate: line.journalEntry.entryDate.toISOString().split("T")[0],
      description: line.description || line.journalEntry.description,
      reference: line.journalEntry.reference || undefined,
      debitAmount: formatScaledBigInt(d),
      creditAmount: formatScaledBigInt(c),
      baseDebitAmount: formatScaledBigInt(bd),
      baseCreditAmount: formatScaledBigInt(bc),
      runningBalance: formatScaledBigInt(runningBalBig)
    });
  }

  return {
    ledgerId: ledger.id,
    ledgerNameAr: ledger.nameAr,
    accountId: account.id,
    accountCode: account.code,
    accountNameAr: account.nameAr,
    normalBalance: account.normalBalance as "DEBIT" | "CREDIT",
    openingBalance: formatScaledBigInt(openingBalBig),
    closingBalance: formatScaledBigInt(fullClosingBalBig),
    items,
    totalDebit: formatScaledBigInt(totalPeriodBaseDebitBig),
    totalCredit: formatScaledBigInt(totalPeriodBaseCreditBig),
    total,
    skip,
    take
  };
}

export interface JournalReportFilterParams {
  ledgerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export interface JournalReportItem {
  id: string;
  journalNumber: string;
  status: string;
  entryDate: string;
  description: string;
  reference?: string;
  ledgerNameAr: string;
  currencyCode: string;
  totalDebit: string;
  totalCredit: string;
  totalBaseDebit: string;
  totalBaseCredit: string;
  linesCount: number;
}

export interface JournalReport {
  items: JournalReportItem[];
  total: number;
  skip: number;
  take: number;
  grandTotalDebit: string;
  grandTotalCredit: string;
  grandTotalBaseDebit: string;
  grandTotalBaseCredit: string;
}

export async function getJournalReport(params: JournalReportFilterParams): Promise<JournalReport> {
  const startDateObj = params.startDate ? new Date(params.startDate) : undefined;
  const endDateObj = params.endDate ? new Date(params.endDate) : undefined;

  const whereClause: Prisma.FinanceJournalEntryWhereInput = {
    ...(params.ledgerId ? { ledgerId: params.ledgerId } : {}),
    ...(params.status ? { status: params.status as FinanceJournalStatus } : {}),
    ...(startDateObj || endDateObj ? {
      entryDate: {
        ...(startDateObj ? { gte: startDateObj } : {}),
        ...(endDateObj ? { lte: endDateObj } : {})
      }
    } : {}),
    ...(params.search ? {
      OR: [
        { entryNumber: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { reference: { contains: params.search, mode: "insensitive" } }
      ]
    } : {})
  };

  const total = await prisma.financeJournalEntry.count({ where: whereClause });
  const skip = params.skip || 0;
  const take = params.take !== undefined ? params.take : 20;

  const journals = await prisma.financeJournalEntry.findMany({
    where: whereClause,
    include: {
      ledger: { select: { nameAr: true } },
      currency: { select: { code: true } },
      lines: {
        select: { debitAmount: true, creditAmount: true, baseDebitAmount: true, baseCreditAmount: true }
      }
    },
    orderBy: { entryDate: "desc" },
    skip,
    ...(take > 0 ? { take } : {})
  });

  let grandTotalDebitBig = BigInt(0);
  let grandTotalCreditBig = BigInt(0);
  let grandTotalBaseDebitBig = BigInt(0);
  let grandTotalBaseCreditBig = BigInt(0);

  const items: JournalReportItem[] = journals.map((j) => {
    let journalDebitBig = BigInt(0);
    let journalCreditBig = BigInt(0);
    let journalBaseDebitBig = BigInt(0);
    let journalBaseCreditBig = BigInt(0);

    for (const l of j.lines) {
      const d = parseToScaledBigInt(l.debitAmount ? l.debitAmount.toString() : null);
      const c = parseToScaledBigInt(l.creditAmount ? l.creditAmount.toString() : null);
      const bd = parseToScaledBigInt(l.baseDebitAmount ? l.baseDebitAmount.toString() : null);
      const bc = parseToScaledBigInt(l.baseCreditAmount ? l.baseCreditAmount.toString() : null);

      journalDebitBig += d;
      journalCreditBig += c;
      journalBaseDebitBig += bd;
      journalBaseCreditBig += bc;
    }

    grandTotalDebitBig += journalDebitBig;
    grandTotalCreditBig += journalCreditBig;
    grandTotalBaseDebitBig += journalBaseDebitBig;
    grandTotalBaseCreditBig += journalBaseCreditBig;

    return {
      id: j.id,
      journalNumber: j.entryNumber || "DRAFT",
      status: j.status,
      entryDate: j.entryDate.toISOString().split("T")[0],
      description: j.description,
      reference: j.reference || undefined,
      ledgerNameAr: j.ledger.nameAr,
      currencyCode: j.currency.code,
      totalDebit: formatScaledBigInt(journalDebitBig),
      totalCredit: formatScaledBigInt(journalCreditBig),
      totalBaseDebit: formatScaledBigInt(journalBaseDebitBig),
      totalBaseCredit: formatScaledBigInt(journalBaseCreditBig),
      linesCount: j.lines.length
    };
  });

  return {
    items,
    total,
    skip,
    take,
    grandTotalDebit: formatScaledBigInt(grandTotalDebitBig),
    grandTotalCredit: formatScaledBigInt(grandTotalCreditBig),
    grandTotalBaseDebit: formatScaledBigInt(grandTotalBaseDebitBig),
    grandTotalBaseCredit: formatScaledBigInt(grandTotalBaseCreditBig)
  };
}
