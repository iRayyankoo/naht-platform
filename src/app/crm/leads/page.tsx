import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FilterBar from "@/components/crm/FilterBar";
import ContentCard from "@/components/platform/layout/ContentCard";

// Improved Status translation map for styling (matching Dashboard)
const statusColors: Record<string, string> = {
  "NEW": "bg-blue-100 text-blue-800",
  "CONTACTED": "bg-yellow-100 text-yellow-800",
  "NO_ANSWER": "bg-gray-100 text-gray-800",
  "INTERESTED": "bg-indigo-100 text-indigo-800",
  "DETAILS_SENT": "bg-purple-100 text-purple-800",
  "VISIT_SCHEDULED": "bg-orange-100 text-orange-800",
  "VISIT_DONE": "bg-teal-100 text-teal-800",
  "NEGOTIATION": "bg-pink-100 text-pink-800",
  "SOLD": "bg-green-100 text-green-800",
  "LOST": "bg-red-100 text-red-800",
  "UNQUALIFIED": "bg-gray-200 text-gray-600",
  "DUPLICATE": "bg-gray-200 text-gray-600",
  "POSTPONED": "bg-yellow-50 text-yellow-600",
};

const statusLabels: Record<string, string> = {
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

export default async function LeadsPage({ searchParams }: { searchParams: { type?: string, status?: string, project?: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session) {
    redirect("/auth/login");
  }
  const userId = (session.user as any).id;

  const leadTypeFilter = searchParams.type || undefined;
  const statusFilter = searchParams.status || undefined;
  const projectFilter = searchParams.project || undefined;

  // STRICT PERMISSIONS LOGIC PRESERVED
  let roleWhereClause = {};
  if (userRole === "SALES") {
    roleWhereClause = {
      OR: [
        { assignedToId: userId },
        { assignedToId: null }
      ]
    };
  } else if (userRole !== "ADMIN" && userRole !== "MARKETING") {
    redirect("/crm");
  }

  const leads = await prisma.lead.findMany({
    where: {
      ...roleWhereClause,
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

  // FILTER BAR CONFIGURATION PRESERVED
  const filterFields = [
    {
      key: "type",
      label: "نوع العميل",
      options: [
        { value: "GENERAL", label: "عملاء عام / مشاريع" },
        { value: "PROJECT_INTEREST", label: "مهتم بمنتج عقاري" },
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

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">العملاء المحتملين</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة ومتابعة جميع طلبات العملاء والاستفسارات</p>
        </div>
      </div>

      {/* Filter Bar Component */}
      <FilterBar searchPlaceholder="ابحث بالاسم، الجوال، البريد..." fields={filterFields} />

      {/* Data Presentation Area */}
      <ContentCard title="سجل العملاء">
        
        {leads.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="text-gray-300 text-6xl mb-4">📭</div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">لا يوجد عملاء مطابقون للفلاتر الحالية</h3>
             <p className="text-gray-500 text-sm max-w-md">جرّب تغيير الفلاتر المحددة أعلاه، أو قم بإزالة بعض الخيارات للبحث بشكل أوسع.</p>
          </div>
        ) : (
          <>
            {/* --- DESKTOP TABLE VIEW --- */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-right text-gray-600 min-w-[900px]">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">العميل</th>
                    <th className="px-6 py-4 font-medium text-center">المشروع</th>
                    <th className="px-6 py-4 font-medium text-center">المصدر</th>
                    <th className="px-6 py-4 font-medium text-center">تاريخ التسجيل</th>
                    <th className="px-6 py-4 font-medium text-center">الحالة</th>
                    <th className="px-6 py-4 font-medium text-center">المسؤول</th>
                    <th className="px-6 py-4 font-medium text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/crm/leads/${lead.id}`} className="block font-bold text-gray-900 hover:text-primary hover:underline">
                          {lead.name}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1 font-mono" dir="ltr">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                        {lead.project?.name || <span className="text-gray-400 text-xs">عام</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-500 bg-gray-50/50 rounded">
                        {lead.utmSource || "عضوي (Direct)"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1.5 inline-flex text-[10px] leading-none font-bold rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-600">
                        {lead.assignedTo?.name || <span className="text-gray-400">غير معين</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <Link href={`/crm/leads/${lead.id}`} className="text-primary hover:text-primary-dark font-medium text-xs bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors">
                          التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE/TABLET CARDS VIEW --- */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/30">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3 relative hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/crm/leads/${lead.id}`} className="font-bold text-gray-900 text-sm hover:text-primary">
                        {lead.name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1 font-mono" dir="ltr">{lead.phone}</div>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded-full whitespace-nowrap ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">المشروع</span>
                      <span className="font-medium truncate">{lead.project?.name || "عام"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">المسؤول</span>
                      <span className="font-medium truncate">{lead.assignedTo?.name || "غير معين"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">المصدر</span>
                      <span className="font-medium truncate">{lead.utmSource || "عضوي"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] mb-0.5">تاريخ التسجيل</span>
                      <span className="font-medium truncate">{new Date(lead.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <Link href={`/crm/leads/${lead.id}`} className="flex items-center justify-center w-full text-primary font-bold text-xs bg-primary/5 hover:bg-primary/10 py-2.5 rounded-lg transition-colors">
                      عرض التفاصيل الكاملة
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </ContentCard>
    </div>
  );
}
