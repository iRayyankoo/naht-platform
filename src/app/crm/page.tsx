import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MetricCard from "@/components/platform/layout/MetricCard";
import ContentCard from "@/components/platform/layout/ContentCard";
import MiniListCard from "@/components/platform/layout/MiniListCard";
import ChartPlaceholderCard from "@/components/platform/layout/ChartPlaceholderCard";

// Status translation map for styling
const statusColors: Record<string, string> = {
  "NEW": "bg-blue-100 text-blue-800",
  "CONTACTED": "bg-yellow-100 text-yellow-800",
  "NO_ANSWER": "bg-gray-100 text-gray-800",
  "INTERESTED": "bg-indigo-100 text-indigo-800",
  "DETAILS_SENT": "bg-purple-100 text-purple-800",
  "VISIT_SCHEDULED": "bg-orange-100 text-orange-800",
  "VISITED": "bg-teal-100 text-teal-800",
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
  "VISITED": "تمت الزيارة",
  "NEGOTIATION": "تفاوض",
  "SOLD": "تم البيع",
  "LOST": "خاسر",
  "UNQUALIFIED": "غير مؤهل",
  "DUPLICATE": "مكرر",
  "POSTPONED": "مؤجل",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role || "ADMIN";

  // Fetch Stats in parallel (Same as original)
  const [
    totalLeads,
    newLeads,
    totalProjects,
    whatsappClicks,
    callClicks,
    totalCampaigns,
    recentLeads,
    leadStatusCounts,
    recentMaintenance,
    recentVendors,
    recentCareers,
    recentContact
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.project.count(),
    prisma.clickEvent.count({ where: { actionType: "WHATSAPP" } }),
    prisma.clickEvent.count({ where: { actionType: "CALL" } }),
    prisma.campaignLink.count(),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { project: true }
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: true
    }),
    prisma.maintenanceRequest.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    prisma.vendorApplication.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({ take: 3, where: { leadType: "CONTACT_US" }, orderBy: { createdAt: "desc" } })
  ]);

  const realTotalRequests = await prisma.$transaction([
    prisma.maintenanceRequest.count(),
    prisma.vendorApplication.count(),
    prisma.jobApplication.count(),
    prisma.lead.count({ where: { leadType: "CONTACT_US" } })
  ]).then(res => res.reduce((a, b) => a + b, 0));

  // Combine and sort requests
  const combinedRequests = [
    ...recentMaintenance.map(r => ({ id: r.id, type: "صيانة", name: r.fullName, date: r.createdAt, link: `/crm/requests/maintenance/${r.id}` })),
    ...recentVendors.map(r => ({ id: r.id, type: "مورد", name: r.companyName, date: r.createdAt, link: `/crm/requests/vendors/${r.id}` })),
    ...recentCareers.map(r => ({ id: r.id, type: "توظيف", name: r.fullName, date: r.createdAt, link: `/crm/requests/careers/${r.id}` })),
    ...recentContact.map(r => ({ id: r.id, type: "تواصل معنا", name: r.name, date: r.createdAt, link: `/crm/leads/${r.id}` })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const pendingTasksItems = combinedRequests.map(req => ({
    id: `${req.type}-${req.id}`,
    title: req.name,
    subtitle: req.type,
    badge: new Date(req.date).toLocaleDateString("ar-SA"),
    badgeColor: "bg-gray-100 text-gray-800"
  }));

  const leadsTableContent = (
    <div className="overflow-x-auto h-full">
      <table className="w-full text-sm text-right text-gray-600 min-w-[500px]">
        <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 font-medium">العميل</th>
            <th className="px-4 py-3 font-medium">المشروع</th>
            <th className="px-4 py-3 font-medium">التاريخ</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {recentLeads.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">لا يوجد عملاء حتى الآن</td></tr>
          ) : (
            recentLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/crm/leads/${lead.id}`} className="font-bold text-gray-900 hover:text-primary hover:underline block">
                    {lead.name}
                  </Link>
                  <div className="font-mono text-xs text-gray-500">{lead.phone}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{lead.project?.name || <span className="text-gray-400">عام</span>}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const statusSummaryContent = (
    <div className="p-4 space-y-3">
      {leadStatusCounts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد إحصائيات</p>
      ) : (
        leadStatusCounts.sort((a, b) => b._count - a._count).map(status => (
          <div key={status.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${statusColors[status.status]?.split(' ')[0] || "bg-gray-300"}`}></span>
              <span className="text-xs font-bold text-gray-700">{statusLabels[status.status] || status.status}</span>
            </div>
            <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">{status._count}</span>
          </div>
        ))
      )}
    </div>
  );

  // ==========================================
  // Layouts
  // ==========================================

  return (
    <div className="w-full space-y-4 xl:space-y-5 pb-6">
      
      {/* --- ADMIN DASHBOARD --- */}
      {userRole === 'ADMIN' && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            <MetricCard label="إجمالي العملاء" value={totalLeads} icon="👥" />
            <MetricCard label="عدد المشاريع" value={totalProjects} icon="🏢" />
            <MetricCard label="الحملات النشطة" value={totalCampaigns} icon="🚀" />
            <MetricCard label="الطلبات الجديدة" value={realTotalRequests} icon="📋" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[250px]">
            <div className="xl:col-span-2 flex flex-col h-full">
              <ChartPlaceholderCard title="أداء النظام وإحصائيات عامة" type="bar" />
            </div>
            <div className="flex flex-col h-full">
              <MiniListCard title="أحدث الطلبات (تواصل، توظيف، إلخ)" items={pendingTasksItems} emptyMessage="لا توجد طلبات واردة مؤخراً" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[300px]">
            <div className="xl:col-span-2 flex flex-col h-full">
              <ContentCard title="آخر العملاء المضافين" action={<Link href="/crm/leads" className="text-sm text-primary font-medium hover:underline">عرض الكل</Link>} className="h-full">
                {leadsTableContent}
              </ContentCard>
            </div>
            <div className="flex flex-col h-full">
              <ContentCard title="ملخص حالات العملاء" className="h-full">
                {statusSummaryContent}
              </ContentCard>
            </div>
          </div>
        </>
      )}

      {/* --- MARKETING DASHBOARD --- */}
      {userRole === 'MARKETING' && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            <MetricCard label="الحملات النشطة" value={totalCampaigns} icon="🚀" />
            <MetricCard label="إجمالي العملاء" value={totalLeads} icon="👥" />
            <MetricCard label="نقرات واتساب" value={whatsappClicks} icon="💬" />
            <MetricCard label="نقرات الاتصال" value={callClicks} icon="📞" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[300px]">
            <div className="xl:col-span-2 flex flex-col h-full">
              <ChartPlaceholderCard title="أداء التتبع (Clicks)" type="bar" />
            </div>
            <div className="flex flex-col h-full">
              <ContentCard title="ملخص حالات العملاء" className="h-full">
                {statusSummaryContent}
              </ContentCard>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:gap-4 flex-1 min-h-[250px]">
            <ContentCard title="آخر العملاء المستقطبين" action={<Link href="/crm/leads" className="text-sm text-primary font-medium hover:underline">عرض الكل</Link>} className="h-full">
              {leadsTableContent}
            </ContentCard>
          </div>
        </>
      )}

      {/* --- SALES DASHBOARD --- */}
      {userRole === 'SALES' && (
        <>
          {/* Note: In a real scenario, this data should be filtered by Sales Rep ID. 
              Currently showing generic data due to DB schema constraints. */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            <MetricCard label="إجمالي العملاء" value={totalLeads} icon="👥" />
            <MetricCard label="عملاء جدد" value={newLeads} icon="✨" />
            <MetricCard label="إجمالي المشاريع" value={totalProjects} icon="🏢" />
            <MetricCard label="نقرات واتساب" value={whatsappClicks} icon="💬" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-[250px]">
            <div className="xl:col-span-1 flex flex-col h-full">
              <MiniListCard title="تنبيهات الطلبات" items={pendingTasksItems} emptyMessage="لا توجد تنبيهات حالياً" />
            </div>
            <div className="xl:col-span-2 flex flex-col h-full">
              <ContentCard title="مراحل البيع (Pipeline - إجمالي النظام)" className="h-full">
                {statusSummaryContent}
              </ContentCard>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:gap-4 flex-1 min-h-[300px]">
            <ContentCard title="آخر العملاء المضافين للنظام" action={<Link href="/crm/leads" className="text-sm text-primary font-medium hover:underline">عرض الكل</Link>} className="h-full">
              {leadsTableContent}
            </ContentCard>
          </div>
        </>
      )}

      {/* --- FALLBACK FOR NO ROLE MATCH --- */}
      {!['ADMIN', 'MARKETING', 'SALES'].includes(userRole) && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك في النظام</h2>
          <p className="text-gray-500">ليس لديك الصلاحيات الكافية لعرض إحصائيات لوحة التحكم. يرجى التواصل مع الإدارة.</p>
        </div>
      )}

    </div>
  );
}
