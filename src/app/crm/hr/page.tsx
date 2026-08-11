import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import {
  DEMO_EMPLOYEES,
  DEMO_LEAVE_REQUESTS,
  DEMO_CONTRACTS_DOCUMENTS,
} from "@/lib/demo-data/hr";

export default async function HrDashboardPage() {
  await requireRole(["ADMIN"]);

  const activeEmployees = DEMO_EMPLOYEES.filter((e) => e.status === "نشط").length;
  const onLeaveEmployees = DEMO_EMPLOYEES.filter((e) => e.status === "في إجازة").length;
  const pendingLeaves = DEMO_LEAVE_REQUESTS.filter((l) => l.status === "قيد الانتظار").length;
  const expiringDocs = DEMO_CONTRACTS_DOCUMENTS.filter(
    (d) => d.status === "ينتهي قريباً" || d.status === "منتهي"
  ).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Demo Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-3 left-3 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-bold backdrop-blur-md border border-amber-500/30">
          بيانات تجريبية - مؤمن للـ ADMIN فقط
        </div>
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            نظام الموارد البشرية (HR Hub)
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            إدارة البيانات الوظيفية العامة، دليل الموظفين، طلبات الإجازات، ومتابعة صلاحية العقود والوثائق الرسمية.
          </p>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/crm/hr/employees"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">إجمالي الموظفين</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{DEMO_EMPLOYEES.length} موظفاً</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {activeEmployees} نشط
            </span>
          </div>
        </Link>

        <Link
          href="/crm/hr/leaves"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">في إجازة حالياً</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{onLeaveEmployees} موظف</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {pendingLeaves} طلب معلق
            </span>
          </div>
        </Link>

        <Link
          href="/crm/hr/contracts"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">تنبيهات العقود والوثائق</span>
            <span className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{expiringDocs} وثيقة</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              تتطلب الإجراء
            </span>
          </div>
        </Link>

        <Link
          href="/crm/hr/employees"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">الأقسام الإدارية</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">4 أقسام</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              مكتملة الهيكل
            </span>
          </div>
        </Link>
      </div>

      {/* Grid: Quick Actions & Employee Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employees Table Preview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">فريق العمل (دليل الموظفين)</h2>
              <p className="text-xs text-gray-500">عرض البيانات الوظيفية العامة (بيانات تجريبية)</p>
            </div>
            <Link
              href="/crm/hr/employees"
              className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
            >
              عرض الدليل كامل ({DEMO_EMPLOYEES.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3">اسم الموظف</th>
                  <th className="p-3">المسمى الوظيفي</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DEMO_EMPLOYEES.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{emp.fullName}</td>
                    <td className="p-3 text-gray-600">{emp.jobTitle}</td>
                    <td className="p-3 text-gray-600">{emp.department}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          emp.status === "نشط"
                            ? "bg-emerald-100 text-emerald-700"
                            : emp.status === "في إجازة"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/crm/hr/employees/${emp.id}`}
                        className="text-xs font-bold text-amber-700 hover:underline bg-amber-50 px-2.5 py-1 rounded-lg"
                      >
                        الملف الوظيفي
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requests & Alerts (1 col) */}
        <div className="space-y-6">
          {/* Pending Leaves */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">طلبات إجازة معلقة</h3>
              <Link href="/crm/hr/leaves" className="text-xs font-bold text-amber-700 hover:underline">
                إدارة الإجازات
              </Link>
            </div>
            <div className="space-y-3">
              {DEMO_LEAVE_REQUESTS.filter((l) => l.status === "قيد الانتظار").map((req) => (
                <div key={req.id} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{req.employeeName}</span>
                    <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded">{req.leaveType}</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">المدة: {req.daysCount} أيام ({req.startDate})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Docs */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">تنبيهات الانتهاء</h3>
              <Link href="/crm/hr/contracts" className="text-xs font-bold text-amber-700 hover:underline">
                عرض العقود
              </Link>
            </div>
            <div className="space-y-3">
              {DEMO_CONTRACTS_DOCUMENTS.filter((d) => d.status !== "ساري").map((doc) => (
                <div key={doc.id} className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{doc.docTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === "منتهي" ? "bg-red-200 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px]">تاريخ الانتهاء: {doc.expiryDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
