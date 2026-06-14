import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequestStatusForm from "@/components/RequestStatusForm";
import Link from "next/link";

export default async function CRMCareersRequests() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    redirect("/crm");
  }

  const requests = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" }
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === "NEW").length,
    inProgress: requests.filter(r => r.status === "IN_PROGRESS").length,
    resolved: requests.filter(r => r.status === "RESOLVED").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">جديد</span>;
      case "IN_PROGRESS": return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-100">قيد المراجعة</span>;
      case "RESOLVED": return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">تم التواصل / توظيف</span>;
      case "CANCELLED": return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">مرفوض</span>;
      default: return <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-full border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة التوظيف والسير الذاتية</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-bold mb-1">إجمالي الطلبات</span>
          <span className="text-2xl font-black text-gray-900">{stats.total}</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center">
          <span className="text-blue-600 text-xs font-bold mb-1">طلبات جديدة</span>
          <span className="text-2xl font-black text-blue-900">{stats.new}</span>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-center">
          <span className="text-yellow-600 text-xs font-bold mb-1">قيد المراجعة</span>
          <span className="text-2xl font-black text-yellow-900">{stats.inProgress}</span>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center">
          <span className="text-green-600 text-xs font-bold mb-1">تم التواصل</span>
          <span className="text-2xl font-black text-green-900">{stats.resolved}</span>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المرشح</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الوظيفة / الخبرة</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المدينة / التاريخ</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/crm/requests/careers/${req.id}`} className="text-sm font-bold text-primary hover:underline block">{req.fullName}</Link>
                    <div className="text-xs text-gray-500 mt-1"><a href={`tel:${req.phone}`} className="hover:text-primary dir-ltr inline-block">{req.phone}</a></div>
                    <div className="text-xs text-gray-400 mt-1"><a href={`mailto:${req.email}`} className="hover:text-primary">{req.email}</a></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.position}</div>
                    <div className="text-xs text-gray-500 mt-1">{req.experienceYears != null ? `${req.experienceYears} سنوات خبرة` : "الخبرة غير محددة"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.city || "غير محدد"}</div>
                    <div className="text-xs text-gray-500 mt-1">{req.createdAt.toLocaleDateString("ar-SA")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Link href={`/crm/requests/careers/${req.id}`} className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-md transition-colors">
                        عرض التفاصيل
                      </Link>
                      <div className="w-full">
                        <RequestStatusForm
                          id={req.id}
                          currentStatus={req.status}
                          type="career"
                          options={[
                            { value: "NEW", label: "جديد" },
                            { value: "IN_PROGRESS", label: "قيد المراجعة" },
                            { value: "RESOLVED", label: "تم التواصل" },
                            { value: "CANCELLED", label: "مرفوض" }
                          ]}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">لا توجد طلبات توظيف حالياً.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
