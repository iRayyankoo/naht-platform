import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { DEMO_LEAVE_REQUESTS } from "@/lib/demo-data/hr";

export default async function HrLeavesPage() {
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
            <span className="text-xs text-gray-500 font-bold">طلبات الإجازات</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">سجل وطلبات الإجازات والمهمات</h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة ومتابعة طلبات الإجازات والتراخيص الإدارية (بيانات تجريبية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
            بيانات تجريبية
          </span>
        </div>
      </div>

      {/* Leave Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">طلبات بانتظار الاعتماد</span>
          <span className="text-2xl font-bold text-amber-800">
            {DEMO_LEAVE_REQUESTS.filter((l) => l.status === "قيد الانتظار").length} طلبات
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">المعتمدة هذا الشهر</span>
          <span className="text-2xl font-bold text-emerald-600">
            {DEMO_LEAVE_REQUESTS.filter((l) => l.status === "معتمد").length} إجازات
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 block mb-1">متوسط مدة الإجازة</span>
          <span className="text-2xl font-bold text-gray-900">4.6 أيام</span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">جدول الطلبات المسجلة</h2>
          <span className="text-xs text-gray-400">إدارة التجربة Demo Workflow</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">اسم الموظف</th>
                <th className="p-4">نوع الإجازة</th>
                <th className="p-4">تاريخ البداية</th>
                <th className="p-4">تاريخ النهاية</th>
                <th className="p-4 text-center">المدة (أيام)</th>
                <th className="p-4">السبب / البيان</th>
                <th className="p-4 text-center">حالة الاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEMO_LEAVE_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{req.employeeName}</td>
                  <td className="p-4">
                    <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg">
                      {req.leaveType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{req.startDate}</td>
                  <td className="p-4 text-gray-600 font-medium">{req.endDate}</td>
                  <td className="p-4 text-center font-bold text-gray-900">{req.daysCount}</td>
                  <td className="p-4 text-gray-500 max-w-xs truncate">{req.reason}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                        req.status === "معتمد"
                          ? "bg-emerald-100 text-emerald-700"
                          : req.status === "قيد الانتظار"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
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
