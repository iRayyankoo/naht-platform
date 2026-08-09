"use client";

import React, { useState } from "react";
import Link from "next/link";
import SelectInput from "@/components/SelectInput";
import toast from "react-hot-toast";
import AsyncSelectInput, { AsyncOption } from "@/app/crm/finance/journals/new/AsyncSelectInput";
import { listAccountsAction } from "@/actions/finance/reference-actions";
import { getGeneralLedgerReportAction, exportGeneralLedgerCsvAction } from "@/actions/finance/report-actions";
import { GeneralLedgerReport } from "@/services/finance/report-service";

interface GeneralLedgerViewProps {
  initialLedgers: { id: string; nameAr: string }[];
}

export default function GeneralLedgerView({ initialLedgers }: GeneralLedgerViewProps) {
  const [ledgerId, setLedgerId] = useState(initialLedgers[0]?.id || "");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState<GeneralLedgerReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadAccountsOptions = async (search: string, skip: number): Promise<{ items: AsyncOption[]; hasMore: boolean }> => {
    if (!ledgerId) return { items: [], hasMore: false };
    const res = await listAccountsAction({ ledgerId, search, skip, take: 50 });
    if (!res.ok || !res.data) return { items: [], hasMore: false };
    const items: AsyncOption[] = res.data.items.map((acc) => ({
      value: acc.id,
      label: `${acc.code} - ${acc.nameAr}`,
    }));
    const hasMore = res.data.total > skip + res.data.items.length;
    return { items, hasMore };
  };

  const handleFetchReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ledgerId || !selectedAccountId) {
      toast.error("يرجى اختيار الدفتر والحساب المحاسبي");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getGeneralLedgerReportAction({
        ledgerId,
        accountId: selectedAccountId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        skip: 0,
        take: 100
      });

      if (res.ok) {
        setReport(res.data);
      } else {
        toast.error(res.error.message || "حدث خطأ أثناء تحميل التقرير");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!ledgerId || !selectedAccountId) return;

    setIsExporting(true);
    try {
      const res = await exportGeneralLedgerCsvAction({
        ledgerId,
        accountId: selectedAccountId,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (res.ok) {
        const blob = new Blob([res.data.content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = res.data.filename;
        link.click();
        toast.success("تم تصدير دفتر الأستاذ بنجاح (CSV UTF-8)");
      } else {
        toast.error(res.error.message || "حدث خطأ أثناء التصدير");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <form onSubmit={handleFetchReport} className="print:hidden bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-gray-900">خيارات دفتر الأستاذ</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SelectInput
            label="الدفتر المحاسبي *"
            value={ledgerId}
            onChange={(e) => {
              setLedgerId(e.target.value);
              setSelectedAccountId(null);
            }}
            options={initialLedgers.map(l => ({ value: l.id, label: l.nameAr }))}
          />

          <div>
            <AsyncSelectInput
              label="الحساب المحاسبي *"
              placeholder="ابحث عن الحساب..."
              value={selectedAccountId}
              onChange={(val) => setSelectedAccountId(val)}
              loadOptions={loadAccountsOptions}
              disabled={!ledgerId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading || !selectedAccountId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "جاري العرض..." : "عرض دفتر الأستاذ"}
          </button>

          {report && (
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                تصدير CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                طباعة التقرير
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Report Body */}
      {report && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6 print:p-0 print:border-none print:shadow-none space-y-6">
          <div className="text-center pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">دفتر الأستاذ العام (General Ledger)</h2>
            <p className="text-lg font-medium text-indigo-700 mt-1">الحساب: {report.accountCode} — {report.accountNameAr}</p>
            <p className="text-xs text-gray-500 mt-1">الدفتر: {report.ledgerNameAr} | طبيعة الحساب: {report.normalBalance === "DEBIT" ? "مدين" : "دائن"}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
            <div>
              <span className="block text-xs text-gray-500 font-sans">الرصيد الافتتاحي (أساسي)</span>
              <span className="font-semibold text-gray-900">{report.openingBalance}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-sans">إجمالي المدين (أساسي)</span>
              <span className="font-semibold text-emerald-600">{report.totalDebit}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-sans">إجمالي الدائن (أساسي)</span>
              <span className="font-semibold text-emerald-600">{report.totalCredit}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-sans">الرصيد الختامي (أساسي)</span>
              <span className="font-bold text-indigo-700">{report.closingBalance}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">رقم القيد</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الوصف / البيان</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">المرجع</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">مدين (بالعملة الأساسية)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">دائن (بالعملة الأساسية)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الرصيد المتراكم</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">لا توجد قيود يومية مرحلة لهذا الحساب ضمن الفترة المحددة.</td>
                  </tr>
                ) : (
                  report.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-indigo-600">
                        <Link href={`/crm/finance/journals/${item.journalId}`} className="hover:underline">
                          {item.journalNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.entryDate}</td>
                      <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{item.description}</td>
                      <td className="px-4 py-3 text-gray-500">{item.reference || "-"}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        {item.baseDebitAmount !== "0.0000" ? item.baseDebitAmount : "-"}
                        {item.debitAmount !== item.baseDebitAmount && item.debitAmount !== "0.0000" && (
                          <span className="block text-[10px] text-gray-400 font-sans">({item.debitAmount} أصلية)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        {item.baseCreditAmount !== "0.0000" ? item.baseCreditAmount : "-"}
                        {item.creditAmount !== item.baseCreditAmount && item.creditAmount !== "0.0000" && (
                          <span className="block text-[10px] text-gray-400 font-sans">({item.creditAmount} أصلية)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-900">{item.runningBalance}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
