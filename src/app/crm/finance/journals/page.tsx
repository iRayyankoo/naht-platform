import { Metadata } from "next";
import Link from "next/link";
import { listJournalsAction } from "@/actions/finance/journal-actions";

export const metadata: Metadata = {
  title: "القيود اليومية",
};

export default async function JournalsPage({ searchParams }: { searchParams: { page?: string, status?: string } }) {
  const page = parseInt(searchParams.page || "1");
  const take = 20;
  const skip = (page - 1) * take;

  const res = await listJournalsAction({ skip, take, status: searchParams.status });
  const data = res.ok ? res.data : { items: [], total: 0 };
  const totalPages = Math.ceil(data.total / take);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">القيود اليومية</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">قائمة القيود</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم القيد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العملة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">لا توجد بيانات لعرضها.</td>
                </tr>
              ) : (
                data.items.map((journal: any) => (
                  <tr key={journal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{journal.entryNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(journal.entryDate).toLocaleDateString("ar-SA")}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{journal.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.currencyId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.totalBaseAmount || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        journal.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        journal.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                        journal.status === "POSTED" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {journal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link href={`/crm/finance/journals/${journal.id}`} className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link href={page > 1 ? `/crm/finance/journals?page=${page - 1}` : "#"} className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>السابق</Link>
              <Link href={page < totalPages ? `/crm/finance/journals?page=${page + 1}` : "#"} className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>التالي</Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  عرض <span className="font-medium">{skip + 1}</span> إلى <span className="font-medium">{Math.min(skip + take, data.total)}</span> من <span className="font-medium">{data.total}</span> نتائج
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px rtl:space-x-reverse" aria-label="Pagination">
                  <Link href={page > 1 ? `/crm/finance/journals?page=${page - 1}` : "#"} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="sr-only">السابق</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <Link href={page < totalPages ? `/crm/finance/journals?page=${page + 1}` : "#"} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
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
