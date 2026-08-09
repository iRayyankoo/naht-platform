"use client";

import React, { useState } from "react";
import SelectInput from "@/components/SelectInput";
import toast from "react-hot-toast";
import { getTrialBalanceReportAction, exportTrialBalanceCsvAction } from "@/actions/finance/report-actions";
import { TrialBalanceReport } from "@/services/finance/report-service";

interface TrialBalanceViewProps {
  initialLedgers: { id: string; nameAr: string }[];
}

export default function TrialBalanceView({ initialLedgers }: TrialBalanceViewProps) {
  const [ledgerId, setLedgerId] = useState(initialLedgers[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeZeroBalances, setIncludeZeroBalances] = useState(false);

  const [report, setReport] = useState<TrialBalanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFetchReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ledgerId) {
      toast.error("يرجى اختيار الدفتر المحاسبي");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getTrialBalanceReportAction({
        ledgerId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeZeroBalances
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
    if (!ledgerId) return;

    setIsExporting(true);
    try {
      const res = await exportTrialBalanceCsvAction({
        ledgerId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeZeroBalances
      });

      if (res.ok) {
        const blob = new Blob([res.data.content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = res.data.filename;
        link.click();
        toast.success("تم تصدير التقرير بنجاح (CSV UTF-8)");
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
      {/* Filter Header - Hidden during print */}
      <form onSubmit={handleFetchReport} className="print:hidden bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-gray-900">خيارات التصفية</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <SelectInput
            label="الدفتر المحاسبي *"
            value={ledgerId}
            onChange={(e) => setLedgerId(e.target.value)}
            options={initialLedgers.map(l => ({ value: l.id, label: l.nameAr }))}
          />

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

          <div className="flex items-center pt-6">
            <label className="inline-flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeZeroBalances}
                onChange={(e) => setIncludeZeroBalances(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="mr-2">تضمين الحسابات الصفرية</span>
            </label>
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "جاري العرض..." : "عرض التقرير"}
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

      {/* Report Display */}
      {report && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6 print:p-0 print:border-none print:shadow-none">
          {/* Header for print / view */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">ميزان المراجعة (Trial Balance)</h2>
            <p className="text-sm text-gray-600 mt-1">الدفتر: {report.ledgerNameAr}</p>
            {(report.startDate || report.endDate) && (
              <p className="text-xs text-gray-500 mt-0.5">
                الفترة من: {report.startDate || "البداية"} إلى: {report.endDate || "النهاية"}
              </p>
            )}

            {!report.isBalanced && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 print:hidden">
                ⚠️ ينبيه: ميزان المراجعة غير متوازن! يوجد فروقات في الإجمالي.
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th rowSpan={2} className="px-3 py-3 text-right font-semibold text-gray-700 border-b">رمز الحساب</th>
                  <th rowSpan={2} className="px-3 py-3 text-right font-semibold text-gray-700 border-b">اسم الحساب</th>
                  <th rowSpan={2} className="px-3 py-3 text-center font-semibold text-gray-700 border-b">النوع</th>
                  <th colSpan={2} className="px-3 py-2 text-center font-semibold text-gray-700 border-b border-l">الأرصدة الافتتاحية</th>
                  <th colSpan={2} className="px-3 py-2 text-center font-semibold text-gray-700 border-b border-l">حركة الفترة</th>
                  <th colSpan={2} className="px-3 py-2 text-center font-semibold text-gray-700 border-b">الأرصدة الختامية</th>
                </tr>
                <tr>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b">مدين</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b border-l">دائن</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b">مدين</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b border-l">دائن</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b">مدين</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500 border-b">دائن</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">لا توجد حركات أو أرصدة مطابقة للخيارات المحددة.</td>
                  </tr>
                ) : (
                  report.items.map((item) => (
                    <tr key={item.accountId} className={item.isHeader ? "bg-gray-100 font-bold" : "hover:bg-gray-50"}>
                      <td className="px-3 py-2 font-mono text-gray-900">{item.accountCode}</td>
                      <td className="px-3 py-2 text-gray-900">{item.accountNameAr}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{item.accountType}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700">{item.openingDebit !== "0.0000" ? item.openingDebit : "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700 border-l">{item.openingCredit !== "0.0000" ? item.openingCredit : "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700">{item.periodDebit !== "0.0000" ? item.periodDebit : "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700 border-l">{item.periodCredit !== "0.0000" ? item.periodCredit : "-"}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-indigo-700">{item.closingDebit !== "0.0000" ? item.closingDebit : "-"}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-indigo-700">{item.closingCredit !== "0.0000" ? item.closingCredit : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-right">المجموع الإجمالي</td>
                  <td className="px-3 py-3 text-right font-mono">{report.totalOpeningDebit}</td>
                  <td className="px-3 py-3 text-right font-mono border-l">{report.totalOpeningCredit}</td>
                  <td className="px-3 py-3 text-right font-mono">{report.totalPeriodDebit}</td>
                  <td className="px-3 py-3 text-right font-mono border-l">{report.totalPeriodCredit}</td>
                  <td className="px-3 py-3 text-right font-mono text-indigo-900">{report.totalClosingDebit}</td>
                  <td className="px-3 py-3 text-right font-mono text-indigo-900">{report.totalClosingCredit}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
