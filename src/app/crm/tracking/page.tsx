import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FilterBar from "@/components/crm/FilterBar";

export default async function TrackingDashboardPage({ searchParams }: { searchParams: { actionType?: string, platform?: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  const actionTypeFilter = searchParams.actionType || undefined;
  const platformFilter = searchParams.platform || undefined;

  // Aggregate stats
  const totalWhatsApp = await prisma.clickEvent.count({ where: { actionType: "WHATSAPP" } });
  const totalCalls = await prisma.clickEvent.count({ where: { actionType: "CALL" } });

  const clicksByProjectRaw = await prisma.clickEvent.groupBy({
    by: ['projectId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Fetch project names
  const projectIds = clicksByProjectRaw.map(c => c.projectId).filter(Boolean) as string[];
  const projects = await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } });
  
  const clicksByProject = clicksByProjectRaw.map(c => ({
    projectId: c.projectId,
    count: c._count.id,
    projectName: projects.find(p => p.id === c.projectId)?.name || "عام / الرئيسية"
  }));

  const clicksBySource = await prisma.clickEvent.groupBy({
    by: ['utmSource'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Recent clicks
  const recentClicks = await prisma.clickEvent.findMany({
    where: {
      ...(actionTypeFilter && { actionType: actionTypeFilter }),
      ...(platformFilter && { utmSource: platformFilter }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: { select: { name: true } }, campaignLink: { select: { campaignName: true } } }
  });

  const filterFields = [
    {
      key: "actionType",
      label: "نوع الحدث",
      options: [
        { value: "WHATSAPP", label: "واتساب" },
        { value: "CALL", label: "اتصال" }
      ]
    },
    {
      key: "platform",
      label: "المنصة (UTM Source)",
      options: [
        { value: "Snapchat", label: "سناب شات" },
        { value: "TikTok", label: "تيك توك" },
        { value: "Instagram", label: "انستجرام" },
        { value: "Google", label: "جوجل" },
        { value: "Facebook", label: "فيسبوك" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إحصائيات تتبع النقرات</h1>
      </div>

      <FilterBar fields={filterFields} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-[#25D366] bg-opacity-10 rounded-full text-[#25D366] ml-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalWhatsApp}</div>
            <div className="text-sm font-medium text-gray-500">نقرات واتساب</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full ml-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalCalls}</div>
            <div className="text-sm font-medium text-gray-500">نقرات اتصال مباشر</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">أعلى المشاريع (نقرات)</h3>
          <ul className="space-y-4">
            {clicksByProject.map((p, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">{p.projectName}</span>
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-md">{p.count}</span>
              </li>
            ))}
            {clicksByProject.length === 0 && <li className="text-sm text-gray-500">لا توجد بيانات</li>}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">أعلى المصادر (UTM Source)</h3>
          <ul className="space-y-4">
            {clicksBySource.map((s, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium" dir="ltr">{s.utmSource || "عضوي / مباشر"}</span>
                <span className="text-sm font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-md">{s._count.id}</span>
              </li>
            ))}
            {clicksBySource.length === 0 && <li className="text-sm text-gray-500">لا توجد بيانات</li>}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">سجل النقرات الأخير</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحملة المرتبطة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المصدر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجهاز</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentClicks.map((click) => (
                <tr key={click.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>
                    {new Date(click.createdAt).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${click.actionType === 'WHATSAPP' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {click.actionType === 'WHATSAPP' ? 'واتساب' : 'اتصال'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{click.project?.name || "عام"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{click.campaignLink?.campaignName || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>{click.utmSource || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{click.deviceType || "-"}</td>
                </tr>
              ))}
              {recentClicks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">لا يوجد سجل نقرات حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
