import { Metadata } from "next";
import { getJournalAction } from "@/actions/finance/journal-actions";
import { FinanceJournalLineDTO } from "@/actions/finance/finance-dtos";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تفاصيل القيد",
};

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const res = await getJournalAction({ id: resolvedParams.id });
  
  if (!res.ok || !res.data) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 rtl">
        <div className="flex items-center space-x-2 space-x-reverse mb-6">
          <Link href="/crm/finance/journals" className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">القيد غير موجود</h2>
        </div>
        <p className="text-gray-500">تعذر العثور على القيد المطلوب أو لا تملك صلاحية الوصول إليه.</p>
      </div>
    );
  }

  const journal = res.data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center space-x-2 space-x-reverse mb-6">
        <Link href="/crm/finance/journals" className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">تفاصيل القيد: {journal.entryNumber || "مسودة"}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">معلومات القيد</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">تاريخ القيد:</span>
              <span className="text-gray-900">{new Date(journal.entryDate).toLocaleDateString("ar-SA")}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">الحالة:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                journal.status === "APPROVED" ? "bg-green-100 text-green-800" :
                journal.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                journal.status === "POSTED" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {journal.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">الوصف:</span>
              <span className="text-gray-900">{journal.description}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-gray-700">المرجع:</span>
              <span className="text-gray-900">{journal.reference || "-"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">معلومات مالية</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">العملة:</span>
              <span className="text-gray-900">{journal.currency ? `${journal.currency.code} — ${journal.currency.nameAr}` : journal.currencyId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">سعر الصرف:</span>
              <span className="text-gray-900">{journal.exchangeRate}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">الفترة المالية:</span>
              <span className="text-gray-900">{journal.period?.periodName || journal.fiscalPeriodId}</span>
            </div>
            {journal.rejectionReason && (
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-red-600">سبب الرفض:</span>
                <span className="text-red-600">{journal.rejectionReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">أسطر القيد</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السطر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحساب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مركز التكلفة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البيان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">مدين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">دائن</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!journal.lines || journal.lines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">لا توجد أسطر في هذا القيد.</td>
                </tr>
              ) : (
                journal.lines.map((line: FinanceJournalLineDTO) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{line.lineNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{line.account ? `${line.account.code} - ${line.account.nameAr}` : line.accountId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.costCenterId || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{line.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{line.debitAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{line.creditAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-gray-900">الإجمالي:</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{journal.totalDebit || "0"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{journal.totalCredit || "0"}</td>
              </tr>
              {journal.exchangeRate !== "1" && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-gray-900">الإجمالي بالعملة الأساسية:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{journal.totalBaseDebit || "0"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{journal.totalBaseCredit || "0"}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
