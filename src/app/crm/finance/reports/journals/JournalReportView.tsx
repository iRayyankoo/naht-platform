"use client";

import React, { useState } from "react";
import Link from "next/link";
import SelectInput from "@/components/SelectInput";
import toast from "react-hot-toast";
import { getJournalReportAction, exportJournalReportCsvAction } from "@/actions/finance/report-actions";
import { JournalReport } from "@/services/finance/report-service";

interface JournalReportViewProps {
  initialLedgers: { id: string; nameAr: string }[];
}

export default function JournalReportView({ initialLedgers }: JournalReportViewProps) {
  const [ledgerId, setLedgerId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [report, setReport] = useState<JournalReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFetchReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    try {
      const res = await getJournalReportAction({
        ledgerId: ledgerId || undefined,
        status: (status as "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "POSTED" | "VOIDED") || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
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
    setIsExporting(true);
    try {
      const res = await exportJournalReportCsvAction({
        ledgerId: ledgerId || undefined,
        status: (status as "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "POSTED" | "VOIDED") || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
        skip: 0,
        take: 1000
      });

      if (res.ok) {
        const blob = new Blob([res.data.content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = res.data.filename;
        link.click();
        toast.success("تم تصدير سجل القيود بنجاح (CSV UTF-8)");
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
      {/* Filter Options */}
      <form onSubmit={handleFetchReport} className="print:hidden bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-gray-900">خيارات البحث والتصفية</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SelectInput
            label="الدفتر المحاسبي"
            value={ledgerId}
            onChange={(e) => setLedgerId(e.target.value)}
            options={[
              { value: "", label: "جميع الدفاتر" },
              ...initialLedgers.map(l => ({ value: l.id, label: l.nameAr }))
            ]}
          />

          <SelectInput
            label="حالة القيد"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "", label: "جميع الحالات" },
              { value: "DRAFT", label: "مسودة (DRAFT)" },
              { value: "PENDING_REVIEW", label: "قيد المراجعة (PENDING_REVIEW)" },
              { value: "APPROVED", label: "معتمد (APPROVED)" },
              { value: "POSTED", label: "مرحل (POSTED)" },
              { value: "VOIDED", label: "ملغى (VOIDED)" },
            ]}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البحث برقم/وصف القيد</label>
            <input
              type="text"
              placeholder="رقم القيد، الوصف، المرجع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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

      {/* Report Table */}
      {report && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6 print:p-0 print:border-none print:shadow-none space-y-4">
          <div className="text-center pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">تقرير حركة القيود اليومية (Journal Entry Report)</h2>
            <p className="text-xs text-gray-500 mt-1">إجمالي عدد القيود: {report.total}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">رقم القيد</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الدفتر المحاسبي</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">العملة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">الوصف</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">المرجع</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">إجمالي مدين (أساسي)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">إجمالي دائن (أساسي)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">لا توجد قيود يومية مطابقة لخيارات البحث.</td>
                  </tr>
                ) : (
                  report.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-indigo-600">
                        <Link href={`/crm/finance/journals/${item.id}`} className="hover:underline">
                          {item.journalNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.entryDate}</td>
                      <td className="px-4 py-3 text-gray-700">{item.ledgerNameAr}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{item.currencyCode}</td>
                      <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{item.description}</td>
                      <td className="px-4 py-3 text-gray-500">{item.reference || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "POSTED" ? "bg-blue-100 text-blue-800" :
                          item.status === "APPROVED" ? "bg-green-100 text-green-800" :
                          item.status === "VOIDED" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900">{item.totalBaseDebit}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{item.totalBaseCredit}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-right">المجموع الإجمالي (بالعملة الأساسية للدفتر المحاسبي)</td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-900">{report.grandTotalBaseDebit}</td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-900">{report.grandTotalBaseCredit}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
