"use server";

import { withFinanceActionErrorHandler, FinanceActionResult, SessionDependencies } from "./finance-action-utils";
import {
  TrialBalanceInputSchema,
  GeneralLedgerInputSchema,
  JournalReportInputSchema
} from "./finance-dtos";
import {
  getTrialBalanceReport,
  getGeneralLedgerReport,
  getJournalReport,
  TrialBalanceReport,
  GeneralLedgerReport,
  JournalReport
} from "@/services/finance/report-service";
import { getCurrentUserScopedPermissions, isSuperAdmin } from "@/lib/rbac-helpers";
import { FinanceDomainError } from "@/lib/finance-errors";

function generateUtf8BomCsv(rows: string[][]): string {
  const BOM = "\uFEFF";
  const csvContent = rows
    .map(row =>
      row
        .map(cell => {
          const str = cell ?? "";
          if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\r\n");

  return BOM + csvContent;
}

export async function getTrialBalanceReportAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<TrialBalanceReport>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = TrialBalanceInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.view")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية للاطلاع على تقرير ميزان المراجعة.");
      }
    }
    return await getTrialBalanceReport(data);
  }, deps);
}

export async function getGeneralLedgerReportAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<GeneralLedgerReport>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = GeneralLedgerInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.view")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية للاطلاع على تقرير دفتر الأستاذ العام.");
      }
    }
    return await getGeneralLedgerReport(data);
  }, deps);
}

export async function getJournalReportAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<JournalReport>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = JournalReportInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.view")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية للاطلاع على تقرير حركة القيود.");
      }
    }
    return await getJournalReport(data);
  }, deps);
}

export async function exportTrialBalanceCsvAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<{ filename: string; content: string }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = TrialBalanceInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.export")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية لتصدير تقرير ميزان المراجعة.");
      }
    }

    const report = await getTrialBalanceReport(data);

    const rows: string[][] = [];
    rows.push([`ميزان المراجعة — ${report.ledgerNameAr}`]);
    rows.push([`من تاريخ: ${report.startDate || "البداية"}`, `إلى تاريخ: ${report.endDate || "النهاية"}`]);
    rows.push([]);
    rows.push([
      "رمز الحساب",
      "اسم الحساب",
      "النوع",
      "المستوى",
      "طبيعة الحساب",
      "افتتاحي مدين (بالعملة الأساسية)",
      "افتتاحي دائن (بالعملة الأساسية)",
      "حركة مدين (بالعملة الأساسية)",
      "حركة دائن (بالعملة الأساسية)",
      "ختامي مدين (بالعملة الأساسية)",
      "ختامي دائن (بالعملة الأساسية)"
    ]);

    report.items.forEach(item => {
      rows.push([
        item.accountCode,
        item.accountNameAr,
        item.accountType,
        item.accountLevel.toString(),
        item.normalBalance === "DEBIT" ? "مدين" : "دائن",
        item.openingDebit,
        item.openingCredit,
        item.periodDebit,
        item.periodCredit,
        item.closingDebit,
        item.closingCredit
      ]);
    });

    rows.push([]);
    rows.push([
      "المجموع الإجمالي",
      "",
      "",
      "",
      "",
      report.totalOpeningDebit,
      report.totalOpeningCredit,
      report.totalPeriodDebit,
      report.totalPeriodCredit,
      report.totalClosingDebit,
      report.totalClosingCredit
    ]);

    const csvString = generateUtf8BomCsv(rows);
    return { filename: `TrialBalance_${report.ledgerId}_${Date.now()}.csv`, content: csvString };
  }, deps);
}

export async function exportGeneralLedgerCsvAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<{ filename: string; content: string }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = GeneralLedgerInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.export")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية لتصدير تقرير دفتر الأستاذ.");
      }
    }

    const report = await getGeneralLedgerReport({
      ...data,
      skip: 0,
      take: 0
    });

    const rows: string[][] = [];
    rows.push([`دفتر الأستاذ العام — ${report.ledgerNameAr}`]);
    rows.push([`الحساب: ${report.accountCode} - ${report.accountNameAr}`]);
    rows.push([`الرصيد الافتتاحي: ${report.openingBalance}`, `الرصيد الختامي: ${report.closingBalance}`]);
    rows.push([]);
    rows.push([
      "رقم القيد",
      "التاريخ",
      "الوصف / البيان",
      "المرجع",
      "مدين (أساسي)",
      "دائن (أساسي)",
      "الرصيد المتراكم"
    ]);

    report.items.forEach(item => {
      rows.push([
        item.journalNumber,
        item.entryDate,
        item.description,
        item.reference || "",
        item.baseDebitAmount,
        item.baseCreditAmount,
        item.runningBalance
      ]);
    });

    rows.push([]);
    rows.push([
      "المجموع الإجمالي",
      "",
      "",
      "",
      report.totalDebit,
      report.totalCredit,
      report.closingBalance
    ]);

    const csvString = generateUtf8BomCsv(rows);
    return { filename: `GeneralLedger_${report.accountCode}_${Date.now()}.csv`, content: csvString };
  }, deps);
}

export async function exportJournalReportCsvAction(input: unknown, deps?: SessionDependencies): Promise<FinanceActionResult<{ filename: string; content: string }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = JournalReportInputSchema.parse(input);
    const isSuper = await isSuperAdmin(context.actorId);
    if (!isSuper) {
      const perms = await getCurrentUserScopedPermissions(context.actorId);
      if (!perms.has("finance.report.export")) {
        throw new FinanceDomainError("F_PERMISSION_DENIED", "ليس لديك صلاحية لتصدير تقرير حركة القيود.");
      }
    }

    const report = await getJournalReport({
      ...data,
      skip: 0,
      take: 0
    });

    const rows: string[][] = [];
    rows.push(["تقرير حركة القيود اليومية"]);
    rows.push([]);
    rows.push([
      "رقم القيد",
      "التاريخ",
      "الدفتر المحاسبي",
      "العملة",
      "الوصف",
      "المرجع",
      "الحالة",
      "إجمالي مدين (أساسي)",
      "إجمالي دائن (أساسي)"
    ]);

    report.items.forEach(item => {
      rows.push([
        item.journalNumber,
        item.entryDate,
        item.ledgerNameAr,
        item.currencyCode,
        item.description,
        item.reference || "",
        item.status,
        item.totalBaseDebit,
        item.totalBaseCredit
      ]);
    });

    rows.push([]);
    rows.push([
      "المجموع الإجمالي (بالعملة الأساسية للدفتر المحاسبي)",
      "",
      "",
      "",
      "",
      "",
      "",
      report.grandTotalBaseDebit,
      report.grandTotalBaseCredit
    ]);

    const csvString = generateUtf8BomCsv(rows);
    return { filename: `JournalReport_${Date.now()}.csv`, content: csvString };
  }, deps);
}
