import { requireRole } from "@/lib/auth-helpers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMO_EMPLOYEES } from "@/lib/demo-data/hr";

interface EmployeeProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await params;

  const employee = DEMO_EMPLOYEES.find((e) => e.id === resolvedParams.id);
  if (!employee) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8" dir="rtl">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crm/hr" className="text-xs font-bold text-amber-700 hover:underline">
              الموارد البشرية
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <Link href="/crm/hr/employees" className="text-xs font-bold text-amber-700 hover:underline">
              دليل الموظفين
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">الملف الوظيفي</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
          <p className="text-xs text-gray-500 mt-1">
            البيانات الوظيفية العامة والإدارية الرسمية (بيانات تجريبية)
          </p>
        </div>

        <Link
          href="/crm/hr/employees"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center"
        >
          العودة للدليل
        </Link>
      </div>

      {/* Main Profile Card (Job Info Only) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-bold flex items-center justify-center border-2 border-amber-200">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{employee.fullName}</h2>
              <p className="text-sm font-bold text-amber-700">{employee.jobTitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">{employee.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full font-bold text-xs ${
                employee.status === "نشط"
                  ? "bg-emerald-100 text-emerald-700"
                  : employee.status === "في إجازة"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              الحالة: {employee.status}
            </span>
          </div>
        </div>

        {/* General Job Details Grid */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>معلومات التوظيف والعمل</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">البريد الإلكتروني المهني</span>
              <span className="text-sm font-bold text-gray-800 dir-ltr inline-block">{employee.workEmail}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">هاتف العمل والتحويلة</span>
              <span className="text-sm font-bold text-gray-800">{employee.workPhone}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">تاريخ الانضمام للشركة</span>
              <span className="text-sm font-bold text-gray-800">{employee.hireDate}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">نوع التعاقد</span>
              <span className="text-sm font-bold text-gray-800">{employee.contractType}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">المدير المباشر</span>
              <span className="text-sm font-bold text-gray-800">{employee.directManager}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-400 block mb-1">موقع العمل الرئيسي</span>
              <span className="text-sm font-bold text-gray-800">{employee.workLocation}</span>
            </div>
          </div>
        </div>

        {/* Notice Disclaimer */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="leading-relaxed">
            ملاحظة أمان وتوافق: يعرض هذا الملف البيانات الوظيفية العامة والإدارية فقط دون تضمين أي رواتب أو بيانات هوية حقيقية أو حسابات بنكية.
          </p>
        </div>
      </div>
    </div>
  );
}
