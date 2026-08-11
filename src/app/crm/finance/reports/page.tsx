import { Metadata } from "next";
import Link from "next/link";
import { getImpersonationRuntimeContext } from "@/lib/impersonation-runtime-context";
import { requireAuth } from "@/lib/auth-helpers";
import { getCurrentUserScopedPermissions } from "@/lib/rbac-helpers";

export const metadata: Metadata = {
  title: "التقارير المالية - المنظومة المالية",
};

export default async function FinanceReportsHubPage() {
  const context = await getImpersonationRuntimeContext();
  let actorId = context?.actorUserId;
  if (!actorId) {
    const user = await requireAuth();
    actorId = user.id;
  }

  const perms = await getCurrentUserScopedPermissions(actorId);

  const canView = perms.has("finance.report.view");

  if (!canView) {
    return (
      <div className="flex-1 p-8 pt-6 rtl">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">عذراً، ليس لديك صلاحية للاطلاع على التقارير المالية.</p>
        </div>
      </div>
    );
  }

  const reports = [
    {
      title: "ميزان المراجعة (Trial Balance)",
      description: "عرض الأرصدة الافتتاحية والحركات والأرصدة الختامية لجميع الحسابات مع التحقق من توازن الأرصدة.",
      href: "/crm/finance/reports/trial-balance",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "دفتر الأستاذ العام (General Ledger)",
      description: "كشف تفصيلي لحركات حساب معين مع الرصيد المتراكم والربط المباشر مع القيود.",
      href: "/crm/finance/reports/general-ledger",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "تقرير حركة القيود (Journal Report)",
      description: "سجل كامل للقيود اليومية مع خيارات التصفية والتفتيش والجاهزية للطباعة والتصدير.",
      href: "/crm/finance/reports/journals",
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">التقارير المالية الأساسية</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <Link
            key={i}
            href={r.href}
            className="group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                {r.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {r.title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
