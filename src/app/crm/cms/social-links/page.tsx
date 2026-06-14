import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SocialLinkForm from "./SocialLinkForm";
import { deleteSocialLink } from "@/actions/cms";

export default async function SocialLinksCMS() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MARKETING"].includes(userRole)) {
    redirect("/crm");
  }

  const links = await prisma.socialLink.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة روابط السوشال ميديا</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">إضافة رابط جديد</h2>
            <SocialLinkForm />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنصة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرابط</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الترتيب</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{link.platformName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dir-ltr text-right">
                      <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">{link.url}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{link.order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${link.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {link.isVisible ? "ظاهر" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <form action={async () => {
                        "use server";
                        await deleteSocialLink(link.id);
                      }}>
                        <button type="submit" className="text-red-500 hover:text-red-700">حذف</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {links.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">لا توجد روابط مضافة.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
