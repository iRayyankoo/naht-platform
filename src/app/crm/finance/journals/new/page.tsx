import { Metadata } from "next";
import { getCurrentUserScopedPermissions } from "@/lib/rbac-helpers";

import { getImpersonationRuntimeContext } from "@/lib/impersonation-runtime-context";
import { listLedgersAction, listCurrenciesAction } from "@/actions/finance/reference-actions";
import JournalForm from "./JournalForm";

import { requireAuth } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "إنشاء قيد جديد - المالية",
};

export default async function NewJournalPage() {
  const context = await getImpersonationRuntimeContext();
  let actorId = context?.actorUserId;
  if (!actorId) {
    const user = await requireAuth();
    actorId = user.id;
  }


  const perms = await getCurrentUserScopedPermissions(actorId);
  if (!perms.has("finance.journal.create")) {
    return (
      <div className="flex-1 p-8 pt-6 rtl">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">عذراً، ليس لديك صلاحية لإنشاء القيود.</p>
        </div>
      </div>
    );
  }

  // Fetch initial data for Ledgers and Currencies
  const [ledgersRes, currenciesRes] = await Promise.all([
    listLedgersAction({ skip: 0, take: 100 }),
    listCurrenciesAction({ skip: 0, take: 100 }),
  ]);

  if (!ledgersRes.ok || !currenciesRes.ok) {
    return (
      <div className="flex-1 p-8 pt-6 rtl">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">عذراً، حدث خطأ أثناء تحميل البيانات المرجعية الأساسية.</p>
        </div>
      </div>
    );
  }

  const ledgers = (ledgersRes.data?.items || []).map(l => ({
    id: l.id,
    code: l.code,
    nameAr: l.nameAr,
    baseCurrencyId: l.baseCurrencyId, // passed to form for exchange rate locking
  }));

  const currencies = (currenciesRes.data?.items || []).map(c => ({
    id: c.id,
    code: c.code,
    nameAr: c.nameAr,
  }));

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">إنشاء قيد جديد</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <JournalForm initialLedgers={ledgers} initialCurrencies={currencies} />
      </div>
    </div>
  );
}
