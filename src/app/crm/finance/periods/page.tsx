import { Metadata } from "next";
import Link from "next/link";
import { listPeriodsAction } from "@/actions/finance/period-actions";
import { FinanceFiscalPeriodDTO } from "@/actions/finance/finance-dtos";

export const metadata: Metadata = {
  title: "الفترات المالية",
};

export default async function PeriodsPage({ searchParams }: { searchParams: Promise<{ page?: string, yearId?: string }> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const take = 20;
  const skip = (page - 1) * take;

  const res = await listPeriodsAction({ skip, take, fiscalYearId: resolvedParams.yearId });

  if (!res.ok) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 rtl">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">الفترات المالية</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">عذراً، حدث خطأ أثناء تحميل الفترات المالية.</p>
          <p className="text-sm mt-1">{res.error?.message || "يرجى المحاولة لاحقاً."}</p>
        </div>
      </div>
    );
  }

  const data = res.data;
  const totalPages = Math.ceil(data.total / take);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">الفترات المالية</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">قائمة الفترات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفترة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ النهاية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإغلاق</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">لا توجد بيانات لعرضها.</td>
                </tr>
              ) : (
                data.items.map((period: FinanceFiscalPeriodDTO) => (
                  <tr key={period.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.periodName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.periodNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(period.startDate).toLocaleDateString("ar-SA")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(period.endDate).toLocaleDateString("ar-SA")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        period.status === "OPEN" ? "bg-green-100 text-green-800" :
                        period.status === "CLOSED" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.closedAt ? new Date(period.closedAt).toLocaleDateString("ar-SA") : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link href={page > 1 ? `/crm/finance/periods?page=${page - 1}` : "#"} className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>السابق</Link>
              <Link href={page < totalPages ? `/crm/finance/periods?page=${page + 1}` : "#"} className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>التالي</Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  عرض <span className="font-medium">{skip + 1}</span> إلى <span className="font-medium">{Math.min(skip + take, data.total)}</span> من <span className="font-medium">{data.total}</span> نتائج
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px rtl:space-x-reverse" aria-label="Pagination">
                  <Link href={page > 1 ? `/crm/finance/periods?page=${page - 1}` : "#"} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="sr-only">السابق</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <Link href={page < totalPages ? `/crm/finance/periods?page=${page + 1}` : "#"} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="sr-only">التالي</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
