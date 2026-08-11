import { Metadata } from "next";
import Link from "next/link";
import { getImpersonationRuntimeContext } from "@/lib/impersonation-runtime-context";
import { requireAuth } from "@/lib/auth-helpers";
import { getCurrentUserScopedPermissions } from "@/lib/rbac-helpers";
import { listLedgersAction } from "@/actions/finance/reference-actions";
import JournalReportView from "./JournalReportView";

export const metadata: Metadata = {
  title: "تقرير حركة القيود - التقارير المالية",
};

export default async function JournalReportPage() {
  const context = await getImpersonationRuntimeContext();
  let actorId = context?.actorUserId;
  if (!actorId) {
    const user = await requireAuth();
    actorId = user.id;
  }

  const perms = await getCurrentUserScopedPermissions(actorId);
  if (!perms.has("finance.report.view")) {
    return (
      <div className="flex-1 p-8 pt-6 rtl">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">عذراً، ليس لديك صلاحية للاطلاع على تقرير حركة القيود.</p>
        </div>
      </div>
    );
  }

  const ledgersRes = await listLedgersAction({ skip: 0, take: 100 });
  const ledgers = (ledgersRes.ok && ledgersRes.data?.items) ? ledgersRes.data.items.map(l => ({ id: l.id, nameAr: l.nameAr })) : [];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center space-x-3 space-x-reverse mb-4">
        <Link href="/crm/finance/reports" className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">تقرير حركة القيود اليومية (Journal Entry Report)</h2>
      </div>

      <JournalReportView initialLedgers={ledgers} />
    </div>
  );
}
