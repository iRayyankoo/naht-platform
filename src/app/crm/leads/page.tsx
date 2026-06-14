import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FilterBar from "@/components/crm/FilterBar";

export default async function LeadsPage({ searchParams }: { searchParams: { type?: string, status?: string, project?: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm"); // Viewers cannot access leads
  }

  const leadTypeFilter = searchParams.type || undefined;
  const statusFilter = searchParams.status || undefined;
  const projectFilter = searchParams.project || undefined;

  const leads = await prisma.lead.findMany({
    where: {
      ...(leadTypeFilter && { leadType: leadTypeFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(projectFilter && { projectId: projectFilter }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      assignedTo: true,
    },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const filterFields = [
    {
      key: "type",
      label: "نوع العميل",
      options: [
        { value: "GENERAL", label: "عملاء عام / مشاريع" },
        { value: "CONTACT_US", label: "تواصل معنا" },
        { value: "REAL_ESTATE_OPPORTUNITY", label: "فرص عقارية" }
      ]
    },
    {
      key: "status",
      label: "الحالة",
      options: [
        { value: "NEW", label: "جديد" },
        { value: "CONTACTED", label: "تم التواصل" },
        { value: "NO_ANSWER", label: "لم يتم الرد" },
        { value: "INTERESTED", label: "مهتم" },
        { value: "DETAILS_SENT", label: "تم إرسال التفاصيل" },
        { value: "VISIT_SCHEDULED", label: "تم جدولة زيارة" },
        { value: "VISIT_DONE", label: "تمت الزيارة" },
        { value: "NEGOTIATION", label: "تفاوض" },
        { value: "SOLD", label: "تم البيع" },
        { value: "LOST", label: "خاسر" },
        { value: "UNQUALIFIED", label: "غير مؤهل" },
        { value: "DUPLICATE", label: "مكرر" },
        { value: "POSTPONED", label: "مؤجل" }
      ]
    },
    {
      key: "project",
      label: "المشروع",
      options: projects.map(p => ({ value: p.id, label: p.name }))
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800";
      case "INTERESTED": return "bg-green-100 text-green-800";
      case "VISIT_SCHEDULED": return "bg-purple-100 text-purple-800";
      case "VISIT_DONE": return "bg-indigo-100 text-indigo-800";
      case "SOLD": return "bg-gray-800 text-white";
      case "LOST": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      "NEW": "جديد",
      "CONTACTED": "تم التواصل",
      "NO_ANSWER": "لم يتم الرد",
      "INTERESTED": "مهتم",
      "DETAILS_SENT": "تم إرسال التفاصيل",
      "VISIT_SCHEDULED": "تم جدولة زيارة",
      "VISIT_DONE": "تمت الزيارة",
      "NEGOTIATION": "تفاوض",
      "SOLD": "تم البيع",
      "LOST": "خاسر",
      "UNQUALIFIED": "غير مؤهل",
      "DUPLICATE": "مكرر",
      "POSTPONED": "مؤجل",
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">العملاء المحتملين (Leads)</h1>
      </div>

      <FilterBar searchPlaceholder="ابحث بالاسم، الجوال، البريد..." fields={filterFields} />

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التسجيل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجوال</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المصدر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسؤول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>
                    {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/crm/leads/${lead.id}`} className="hover:text-primary hover:underline cursor-pointer">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>{lead.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.project?.name || "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.utmSource || "عضوي (Direct)"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.assignedTo?.name || "غير معين"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/crm/leads/${lead.id}`} className="text-primary hover:text-primary-dark font-medium">
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">لا يوجد عملاء حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
