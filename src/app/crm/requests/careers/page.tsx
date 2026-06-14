import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequestStatusForm from "@/components/RequestStatusForm";

export default async function CRMCareersRequests() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    redirect("/crm");
  }

  const requests = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">جديد</span>;
      case "IN_PROGRESS": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">قيد المراجعة</span>;
      case "RESOLVED": return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">تم التواصل / التوظيف</span>;
      case "CANCELLED": return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">مرفوض</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة التوظيف والسير الذاتية</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المرشح</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوظيفة / الخبرة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدينة / روابط</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{req.fullName}</div>
                  <div className="text-xs text-gray-500" dir="ltr">{req.phone}</div>
                  <div className="text-xs text-gray-500">{req.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{req.position}</div>
                  <div className="text-xs text-gray-500">{req.experienceYears != null ? `${req.experienceYears} سنوات خبرة` : "لم يحدد الخبرة"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{req.city || "غير محدد"}</div>
                  {req.linkedInUrl && (
                    <a href={req.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs block mt-1">LinkedIn</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(req.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
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
                  {req.resumeUrl && (
                    <a href={req.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs mr-4 block mt-2">
                      تحميل السيرة الذاتية
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا توجد طلبات توظيف حالياً.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
