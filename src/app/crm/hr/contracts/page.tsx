import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { DEMO_CONTRACTS_DOCUMENTS } from "@/lib/demo-data/hr";

export default async function HrContractsPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crm/hr" className="text-xs font-bold text-amber-700 hover:underline">
              الموارد البشرية
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">العقود والوثائق</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">سجل العقود وتنبيهات انتهاء الوثائق (تجريبي)</h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة التواريخ الرسمية، صلاحيات العقود، والشهادات المهنية (بيانات تجريبية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
            بيانات تجريبية
          </span>
        </div>
      </div>

      {/* Expiry Alerts Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">عقود ووثائق سارية</span>
          <span className="text-2xl font-bold text-emerald-600">
            {DEMO_CONTRACTS_DOCUMENTS.filter((d) => d.status === "ساري").length} وثائق
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">تنتهي قريباً (أقل من 30 يوماً)</span>
          <span className="text-2xl font-bold text-amber-800">
            {DEMO_CONTRACTS_DOCUMENTS.filter((d) => d.status === "ينتهي قريباً").length} وثيقة
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">منتهية الصلاحية</span>
          <span className="text-2xl font-bold text-red-600">
            {DEMO_CONTRACTS_DOCUMENTS.filter((d) => d.status === "منتهي").length} وثيقة
          </span>
        </div>
      </div>

      {/* Contracts & Documents Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">سجل الوثائق الرسمية (تجريبي)</h2>
          <span className="text-xs text-gray-400">تنبيهات إدارية مستمرة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">عنوان الوثيقة</th>
                <th className="p-4">الموظف المعني</th>
                <th className="p-4">نوع الوثيقة</th>
                <th className="p-4">تاريخ الإصدار</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4 text-center">حالة الصلاحية</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEMO_CONTRACTS_DOCUMENTS.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{doc.docTitle}</td>
                  <td className="p-4 text-gray-700 font-medium">{doc.employeeName}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{doc.issueDate}</td>
                  <td className="p-4 text-gray-900 font-bold">{doc.expiryDate}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                        doc.status === "ساري"
                          ? "bg-emerald-100 text-emerald-700"
                          : doc.status === "ينتهي قريباً"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl inline-block cursor-not-allowed select-none"
                      aria-disabled="true"
                    >
                      معاينة الوثيقة (عرض تجريبي)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
