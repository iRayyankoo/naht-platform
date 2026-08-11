import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { DEMO_EMPLOYEES } from "@/lib/demo-data/hr";

interface EmployeesPageProps {
  searchParams: Promise<{
    query?: string;
    dept?: string;
    status?: string;
  }>;
}

export default async function HrEmployeesPage({ searchParams }: EmployeesPageProps) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;

  const validDepts = [
    "الكل",
    "التطوير الهندسي",
    "التسويق والإعلام",
    "المبيعات وحسابات العملاء",
    "التصميم والتخطيط",
  ];

  const validStatuses = ["الكل", "نشط", "في إجازة", "غير نشط"];

  // Normalize inputs to "الكل" if unknown
  const rawDept = resolvedParams.dept || "الكل";
  const rawStatus = resolvedParams.status || "الكل";

  const deptFilter = validDepts.includes(rawDept) ? rawDept : "الكل";
  const statusFilter = validStatuses.includes(rawStatus) ? rawStatus : "الكل";
  const searchQuery = (resolvedParams.query || "").trim();
  const searchLower = searchQuery.toLowerCase();

  const filteredEmployees = DEMO_EMPLOYEES.filter((emp) => {
    const matchQuery =
      !searchLower ||
      emp.fullName.toLowerCase().includes(searchLower) ||
      emp.jobTitle.toLowerCase().includes(searchLower) ||
      emp.workEmail.toLowerCase().includes(searchLower);

    const matchDept = deptFilter === "الكل" || emp.department === deptFilter;
    const matchStatus = statusFilter === "الكل" || emp.status === statusFilter;

    return matchQuery && matchDept && matchStatus;
  });

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
            <span className="text-xs text-gray-500 font-bold">دليل الموظفين</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">دليل وسجل فريق العمل (تجريبي)</h1>
          <p className="text-xs text-gray-500 mt-1">
            عرض البيانات الوظيفية العامة للكوادر البشرية في الشركة (بيانات تجريبية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
            بيانات تجريبية
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <form action="/crm/hr/employees" method="GET" className="flex flex-col md:flex-row items-center gap-4">
          {/* Preserve active filters on search submit */}
          <input type="hidden" name="dept" value={deptFilter} />
          <input type="hidden" name="status" value={statusFilter} />

          <div className="relative flex-1 w-full">
            <label htmlFor="employee-search-input" className="sr-only">
              ابحث باسم الموظف أو المسمى الوظيفي أو البريد الإلكتروني
            </label>
            <input
              id="employee-search-input"
              type="text"
              name="query"
              defaultValue={searchQuery}
              placeholder="ابحث باسم الموظف، المسمى الوظيفي، أو البريد الإلكتروني..."
              aria-label="ابحث باسم الموظف أو المسمى الوظيفي أو البريد الإلكتروني"
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-amber-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3.5 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              بحث
            </button>
            {(searchQuery || deptFilter !== "الكل" || statusFilter !== "الكل") && (
              <Link
                href="/crm/hr/employees"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                إعادة ضبط
              </Link>
            )}
          </div>
        </form>

        {/* Filter Pills preserving query */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-2">القسم:</span>
            {validDepts.map((d) => (
              <Link
                key={d}
                href={`/crm/hr/employees?query=${encodeURIComponent(searchQuery)}&dept=${encodeURIComponent(d)}&status=${encodeURIComponent(statusFilter)}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  deptFilter === d
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-2">الحالة:</span>
            {validStatuses.map((st) => (
              <Link
                key={st}
                href={`/crm/hr/employees?query=${encodeURIComponent(searchQuery)}&dept=${encodeURIComponent(deptFilter)}&status=${encodeURIComponent(st)}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">الموظف</th>
                <th className="p-4">المسمى الوظيفي والقسم</th>
                <th className="p-4">تاريخ الانضمام</th>
                <th className="p-4">نوع العقد</th>
                <th className="p-4 text-center">الحالة</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{emp.fullName}</span>
                        <span className="text-gray-400 text-[11px] dir-ltr inline-block">{emp.workEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-800 block">{emp.jobTitle}</span>
                    <span className="text-gray-500 text-[11px]">{emp.department}</span>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{emp.hireDate}</td>
                  <td className="p-4 text-gray-600">{emp.contractType}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[11px] ${
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
                  <td className="p-4 text-center">
                    <Link
                      href={`/crm/hr/employees/${emp.id}`}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl transition-colors inline-block"
                    >
                      الملف الوظيفي
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    لا يوجد موظفون يطابقون خيارات البحث المحددة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
