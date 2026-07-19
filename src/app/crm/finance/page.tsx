import { Metadata } from "next";
import { getFinanceDashboardSummaryAction } from "@/actions/finance/dashboard-actions";

export const metadata: Metadata = {
  title: "المالية - لوحة التحكم",
};

export default async function FinanceDashboardPage() {
  const summaryRes = await getFinanceDashboardSummaryAction();
  const summary = summaryRes.ok ? summaryRes.data : {
    totalDrafts: 0,
    totalPendingReview: 0,
    totalApproved: 0,
    openPeriodsCount: 0,
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">المالية</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Drafts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">القيود المسودة</h3>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalDrafts}</div>
            <p className="text-xs text-gray-500 mt-1">قيود قيد التحرير</p>
          </div>
        </div>
        
        {/* Pending Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">قيد المراجعة</h3>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalPendingReview}</div>
            <p className="text-xs text-gray-500 mt-1">بانتظار الاعتماد أو الرفض</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">القيود المعتمدة</h3>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalApproved}</div>
            <p className="text-xs text-gray-500 mt-1">جاهزة للترحيل (Post)</p>
          </div>
        </div>

        {/* Open Periods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">الفترات المفتوحة</h3>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{summary.openPeriodsCount}</div>
            <p className="text-xs text-gray-500 mt-1">الفترات المالية المتاحة للحركة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
