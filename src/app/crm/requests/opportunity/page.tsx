import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";


export default async function CRMOpportunityRequests() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  // Fetch only leads of type REAL_ESTATE_OPPORTUNITY
  const opportunities = await prisma.lead.findMany({
    where: { leadType: "REAL_ESTATE_OPPORTUNITY" },
    orderBy: { createdAt: "desc" }
  });

  const stats = {
    total: opportunities.length,
    new: opportunities.filter(o => o.status === "NEW" || o.status === "جديد").length,
    inProgress: opportunities.filter(o => o.status === "IN_PROGRESS" || o.status === "قيد المراجعة" || o.status === "مهتم" || o.status === "تفاوض").length,
    resolved: opportunities.filter(o => o.status === "RESOLVED" || o.status === "مكتمل" || o.status === "غير مناسب" || o.status === "خاسر").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
      case "جديد":
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">جديد</span>;
      case "IN_PROGRESS":
      case "قيد المراجعة":
      case "مهتم":
      case "تفاوض":
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-100">قيد المتابعة</span>;
      case "RESOLVED":
      case "مكتمل":
      case "غير مناسب":
      case "خاسر":
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-full border border-gray-100">مغلق</span>;
      default: 
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-full border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الفرص العقارية</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-bold mb-1">إجمالي الفرص</span>
          <span className="text-2xl font-black text-gray-900">{stats.total}</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center">
          <span className="text-blue-600 text-xs font-bold mb-1">فرص جديدة</span>
          <span className="text-2xl font-black text-blue-900">{stats.new}</span>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-center">
          <span className="text-yellow-600 text-xs font-bold mb-1">قيد المتابعة</span>
          <span className="text-2xl font-black text-yellow-900">{stats.inProgress}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <span className="text-gray-600 text-xs font-bold mb-1">مغلقة / غير مناسبة</span>
          <span className="text-2xl font-black text-gray-900">{stats.resolved}</span>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">صاحب الفرصة</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نوع الفرصة / المدينة</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المصدر / التاريخ</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/crm/leads/${opp.id}`} className="text-sm font-bold text-primary hover:underline block">
                      {opp.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1"><a href={`tel:${opp.phone}`} className="hover:text-primary dir-ltr inline-block">{opp.phone}</a></div>
                    {opp.email && <div className="text-xs text-gray-400 mt-1"><a href={`mailto:${opp.email}`} className="hover:text-primary">{opp.email}</a></div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{opp.opportunityType || "غير محدد"}</div>
                    <div className="text-xs text-gray-500 mt-1">{opp.city || "مدينة غير محددة"}{opp.district ? ` - ${opp.district}` : ""}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{opp.source || "غير محدد"}</div>
                    <div className="text-xs text-gray-500 mt-1">{opp.createdAt.toLocaleDateString("ar-SA")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(opp.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Link href={`/crm/leads/${opp.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                      عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">لا توجد فرص عقارية حالياً.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
