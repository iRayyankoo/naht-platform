import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { deleteCampaignLink } from "@/actions/campaigns";
import CopyButton from "@/components/CopyButton";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || userRole === "VIEWER") {
    redirect("/crm");
  }

  const campaigns = await prisma.campaignLink.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      createdBy: true,
      _count: { select: { clickEvents: true } }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">روابط الحملات الإعلانية</h1>
        {(userRole === "ADMIN" || userRole === "MARKETING") && (
          <Link href="/crm/campaigns/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-bold flex items-center">
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            إنشاء رابط حملة
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحملة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنصة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النقرات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">بواسطة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{camp.campaignName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {camp.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{camp.project?.name || "عام"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{camp._count.clickEvents}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{camp.createdBy?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>
                    {new Date(camp.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center space-x-4 space-x-reverse">
                    <CopyButton textToCopy={camp.finalUrl} className="text-secondary hover:text-secondary-dark" />
                    {userRole === "ADMIN" && (
                      <form className="inline-block" action={async () => {
                        "use server";
                        await deleteCampaignLink(camp.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-900">حذف</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">لا توجد حملات مسجلة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
