import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { deleteCampaignLink } from "@/actions/campaigns";
import CopyButton from "@/components/CopyButton";
import FilterBar from "@/components/crm/FilterBar";

export default async function CampaignsPage({ searchParams }: { searchParams: { platform?: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  // FIX: Next 15 searchParams promise + Array Safe Parsing
  const params = await Promise.resolve(searchParams);
  const platformFilter = typeof params.platform === 'string' ? params.platform : (Array.isArray(params.platform) ? params.platform[0] : undefined);

  // STRICT DATA FETCHING LOGIC PRESERVED
  const campaigns = await prisma.campaignLink.findMany({
    where: {
      ...(platformFilter && { platform: platformFilter }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      createdBy: true,
      _count: { select: { clickEvents: true } }
    },
  });

  const filterFields = [
    {
      key: "platform",
      label: "المنصة",
      options: [
        { value: "Snapchat", label: "سناب شات" },
        { value: "TikTok", label: "تيك توك" },
        { value: "Instagram", label: "انستجرام" },
        { value: "X", label: "إكس (تويتر)" },
        { value: "Google", label: "جوجل" },
        { value: "Facebook", label: "فيسبوك" },
        { value: "Other", label: "أخرى" }
      ]
    }
  ];

  return (
    <div className="space-y-4 xl:space-y-6 max-w-[1400px] mx-auto w-full pb-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">روابط الحملات الإعلانية</h1>
          <p className="text-sm text-gray-500 mt-1">تتبع وإدارة الروابط الإعلانية وحجم الزيارات</p>
        </div>
        {(userRole === "ADMIN" || userRole === "MARKETING") && (
          <Link href="/crm/campaigns/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors">
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            إنشاء رابط حملة
          </Link>
        )}
      </div>

      <FilterBar fields={filterFields} />

      {campaigns.length === 0 ? (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="text-gray-300 text-6xl mb-4">📣</div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد حملات مطابقة للفلاتر الحالية</h3>
           <p className="text-gray-500 text-sm max-w-md">جرّب تغيير فلتر المنصة أو ابدأ بإنشاء رابط حملة إعلانية جديد.</p>
        </div>
      ) : (
        /* --- CONTENT AREA --- */
        <div className="bg-white shadow-sm border border-gray-100 sm:rounded-2xl overflow-hidden">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحملة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المنصة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المشروع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">النقرات</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">بواسطة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{camp.campaignName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {camp.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{camp.project?.name || "عام"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{camp._count.clickEvents}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{camp.createdBy?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>
                      {new Date(camp.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-center flex items-center justify-center gap-2">
                      <CopyButton textToCopy={camp.finalUrl} className="text-secondary hover:text-secondary-dark p-2 bg-secondary/10 rounded-lg transition-colors" />
                      {userRole === "ADMIN" && (
                        <form action={async () => {
                          "use server";
                          await deleteCampaignLink(camp.id);
                        }}>
                          <button type="submit" title="حذف الرابط" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{camp.campaignName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{camp.project?.name || "عام"}</p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {camp.platform}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <span className="block text-[10px] text-gray-400 font-bold mb-1">النقرات</span>
                    <span className="block text-sm font-bold text-gray-900">{camp._count.clickEvents}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <span className="block text-[10px] text-gray-400 font-bold mb-1">بواسطة</span>
                    <span className="block text-sm font-bold text-gray-900 truncate">{camp.createdBy?.name || "-"}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400 font-medium" dir="ltr">
                    {new Date(camp.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <CopyButton textToCopy={camp.finalUrl} className="text-secondary hover:text-secondary-dark p-2 bg-secondary/10 rounded-lg transition-colors" />
                    {userRole === "ADMIN" && (
                      <form action={async () => {
                        "use server";
                        await deleteCampaignLink(camp.id);
                      }}>
                        <button type="submit" title="حذف الرابط" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
