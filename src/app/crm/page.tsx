import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

  // Fetch Stats in parallel
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">لوحة القيادة</h1>
        <div className="text-sm text-gray-500">
          مرحباً بك يا <span className="font-bold text-gray-900">{session?.user?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="إجمالي العملاء" value={totalLeads} icon="👥" />
        <StatCard title="العملاء الجدد" value={newLeads} icon="✨" color="text-green-600" />
        <StatCard title="عدد المشاريع" value={totalProjects} icon="🏢" />
        <StatCard title="عدد الطلبات" value={realTotalRequests} icon="📋" />
        <StatCard title="نقرات واتساب" value={whatsappClicks} icon="💬" color="text-green-500" />
        <StatCard title="نقرات الاتصال" value={callClicks} icon="📞" color="text-blue-500" />
        <StatCard title="عدد الحملات" value={totalCampaigns} icon="🚀" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Leads & Links */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Leads */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">آخر العملاء المضافين</h2>
              <Link href="/crm/leads" className="text-sm text-primary hover:underline font-medium">عرض الكل</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-gray-500">
                <thead className="text-xs text-gray-700 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">المشروع</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا يوجد عملاء حتى الآن</td></tr>
                  ) : (
                    recentLeads.map(lead => (
                      <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{lead.name}</div>
                          <div className="text-xs text-gray-500 dir-ltr text-right">{lead.phone}</div>
                        </td>
                        <td className="px-6 py-4">{lead.project?.name || <span className="text-gray-400">عام</span>}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[lead.status] || "bg-gray-100 text-gray-800"}`}>
                            {statusLabels[lead.status] || lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</td>
                        <td className="px-6 py-4 text-left">
                          <Link href={`/crm/leads/${lead.id}`} className="text-primary hover:text-primary-dark font-medium text-xs bg-primary/10 px-3 py-1.5 rounded-md transition-colors">
                            التفاصيل
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">روابط سريعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <QuickLink href="/crm/projects/new" icon="+" title="إضافة مشروع" />
              <QuickLink href="/crm/leads" icon="👥" title="عرض العملاء" />
              <QuickLink href="/crm/campaigns/new" icon="🚀" title="إنشاء حملة" />
              <QuickLink href="/crm/cms/settings" icon="⚙️" title="إعدادات الموقع" />
              <QuickLink href="/crm/cms/homepage" icon="🏠" title="الصفحة الرئيسية" />
              <QuickLink href="/crm/cms/tracking" icon="📊" title="إعدادات التتبع" />
            </div>
          </div>

        </div>

        {/* Right Column: Status & Requests */}
        <div className="space-y-8">
          
          {/* Status Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-3">ملخص حالات العملاء</h2>
            <div className="space-y-3">
              {leadStatusCounts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد إحصائيات</p>
              ) : (
                leadStatusCounts.sort((a, b) => b._count - a._count).map(status => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${statusColors[status.status]?.split(' ')[0] || "bg-gray-300"}`}></span>
                      <span className="text-sm text-gray-700">{statusLabels[status.status] || status.status}</span>
                    </div>
                    <span className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded-md">{status._count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <h2 className="text-lg font-bold text-gray-900">آخر الطلبات</h2>
            </div>
            <div className="space-y-4">
              {combinedRequests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد طلبات</p>
              ) : (
                combinedRequests.map(req => (
                  <Link key={req.id} href={req.link} className="block group">
                    <div className="flex items-start justify-between p-3 rounded-lg border border-gray-50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                      <div>
                        <div className="text-xs font-medium text-primary mb-1">{req.type}</div>
                        <div className="text-sm font-bold text-gray-900">{req.name}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(req.date).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-primary" }: { title: string, value: number, icon: string, color?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
      <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500">{title}</div>
    </div>
  );
}

function QuickLink({ href, icon, title }: { href: string, icon: string, title: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors text-gray-700">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-bold">{title}</span>
    </Link>
  );
}
